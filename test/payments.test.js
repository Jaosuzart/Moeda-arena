const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { settlementTarget, toCents } = require('../src/backend/domain/paymentAmounts');
const logger = { info() {}, warn() {}, error() {} };
function load(file, dependencies) {
  const context = { module: { exports: {} }, require(name) { assert.ok(name in dependencies, name); return dependencies[name]; }, Date, console };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
  return context.module.exports;
}
const reference = { usuarioId: 7, planoId: 'premium', moedas: 5000, valorCentavos: 499, moeda: 'BRL', cupom: 'PROMO' };
const plan = { id: 'premium', moedas: 9999 }; // O snapshot deve prevalecer sobre o catálogo alterado.
const payment = (status = 'approved', refunded = 0, time = 1) => ({ id: '123', status, transaction_amount: 4.99,
  transaction_amount_refunded: refunded, date_last_updated: `2026-10-29T12:00:0${time}Z` });

function fixture({ legacy = false, failCommission = false } = {}) {
  let state = { ledger: null, processed: legacy ? [{ id: 1 }] : [], users: { 7: { balance: 0, gains: 0, indicado_por: 8 }, 8: { balance: 0, gains: 0 } }, couponUses: 0 };
  let before;
  let commits = 0, rollbacks = 0, releases = 0;
  // Uma conexão por vez simula o bloqueio da linha do pagamento, sem rede/banco real.
  let queue = Promise.resolve();
  const pool = { async getConnection() {
    const previous = queue;
    let unlock;
    queue = new Promise(resolve => { unlock = resolve; });
    await previous;
    return {
      async beginTransaction() { before = structuredClone(state); },
      async commit() { commits++; },
      async rollback() { state = before; rollbacks++; },
      release() { releases++; unlock(); },
      async query(sql, args = []) {
        sql = sql.replace(/\s+/g, ' ').trim();
        if (sql.startsWith('INSERT INTO pagamento_saldos')) {
          if (!state.ledger) state.ledger = { payment_id: args[0], usuario_id: args[1], plano_id: args[2], moedas_originais: args[3],
            valor_centavos: args[4], cupom: args[5], moedas_liquidas: 0, comissao_liquida: 0, reembolso_centavos: 0,
            cupom_contabilizado: 0, status: 'new', provider_updated_ms: 0, afiliado_id: null };
          return [{ affectedRows: 1 }]; // FOUND_ROWS pode devolver 1 até na duplicata.
        }
        if (sql.startsWith('SELECT * FROM pagamento_saldos')) return [[{ ...state.ledger }]];
        if (sql.startsWith('SELECT id FROM pagamentos_processados')) return [state.processed];
        if (sql.startsWith('SELECT indicado_por')) return [[{ indicado_por: state.users[args[0]].indicado_por }]];
        if (sql.startsWith('SELECT id FROM usuarios')) return [state.users[args[0]] ? [{ id: args[0] }] : []];
        if (sql.startsWith('UPDATE usuarios SET saldo_moedas')) {
          if (sql.includes('ganhos_afiliado')) {
            if (failCommission) throw new Error('falha de comissão simulada');
            state.users[args[2]].balance += args[0]; state.users[args[2]].gains += args[1];
          } else state.users[args[1]].balance += args[0];
          return [{ affectedRows: 1 }];
        }
        if (sql.startsWith('UPDATE cupons')) { state.couponUses++; return [{ affectedRows: 1 }]; }
        if (sql.startsWith('INSERT INTO pagamentos_processados')) { state.processed.push({ id: 1, status: args[5], coins: args[3] }); return [{}]; }
        if (sql.startsWith('UPDATE pagamentos_processados')) { state.processed[0].status = args[0]; state.processed[0].coins = args[1]; return [{}]; }
        if (sql.startsWith('UPDATE pagamento_saldos')) {
          Object.assign(state.ledger, { moedas_liquidas: args[0], reembolso_centavos: args[1], afiliado_id: args[2],
            comissao_liquida: args[3], cupom_contabilizado: args[4], status: args[5], provider_updated_ms: args[6] });
          return [{}];
        }
        throw new Error('SQL não simulado: ' + sql);
      },
    };
  } };
  const { settlePayment } = load('src/backend/services/paymentSettlement.js', {
    '../database/db': { pool }, '../domain/paymentAmounts': { settlementTarget },
  });
  return { settle: (p, ref = reference) => settlePayment(p, ref, plan), state: () => state,
    counts: () => ({ commits, rollbacks, releases }), spend(id, amount) { state.users[id].balance -= amount; } };
}

test('aprovação credita snapshot, comissão e cupom uma única vez, inclusive concorrentemente', async () => {
  const f = fixture();
  await Promise.all(Array.from({ length: 8 }, () => f.settle(payment())));
  assert.equal(f.state().users[7].balance, 5000);
  assert.equal(f.state().users[8].balance, 250);
  assert.equal(f.state().users[8].gains, 250);
  assert.equal(f.state().couponUses, 1);
  assert.equal(f.state().processed.length, 1);
  assert.equal(f.counts().releases, 8);
});
test('falha da comissão desfaz crédito, registro e cupom', async () => {
  const f = fixture({ failCommission: true });
  await assert.rejects(f.settle(payment()), /comissão/);
  assert.equal(f.state().users[7].balance, 0);
  assert.equal(f.state().users[8].balance, 0);
  assert.equal(f.state().ledger, null);
  assert.equal(f.state().processed.length, 0);
  assert.equal(f.state().couponUses, 0);
  assert.deepEqual(f.counts(), { commits: 0, rollbacks: 1, releases: 1 });
});
test('estorno parcial, total e repetição ajustam somente o delta de moedas e comissão', async () => {
  const f = fixture(); await f.settle(payment());
  await f.settle(payment('approved', 1.00, 2));
  assert.equal(f.state().users[7].balance, 3997);
  assert.equal(f.state().users[8].balance, 199);
  await f.settle(payment('refunded', 4.99, 3));
  await f.settle(payment('refunded', 4.99, 3));
  assert.equal(f.state().users[7].balance, 0);
  assert.equal(f.state().users[8].balance, 0);
  assert.equal(f.state().users[8].gains, 0);
  assert.equal(f.state().couponUses, 1);
});
test('chargeback preserva ajuste mesmo quando moedas já foram usadas', async () => {
  const f = fixture(); await f.settle(payment()); f.spend(7, 4000);
  await f.settle(payment('charged_back', 0, 2));
  assert.equal(f.state().users[7].balance, -4000);
  assert.equal(f.state().users[8].balance, 0);
});
test('notificação antiga e aprovação posterior não restauram estorno', async () => {
  const f = fixture(); await f.settle(payment('refunded', 4.99, 3));
  await f.settle(payment('approved', 0, 1));
  await f.settle(payment('approved', 0, 4));
  assert.equal(f.state().users[7].balance, 0);
});
test('mediação suspende crédito e aprovação mais recente restaura somente uma vez', async () => {
  const f = fixture(); await f.settle(payment());
  await f.settle(payment('in_mediation', 0, 2));
  assert.equal(f.state().users[7].balance, 0);
  await f.settle(payment('approved', 0, 3));
  await f.settle(payment('approved', 0, 3));
  assert.equal(f.state().users[7].balance, 5000);
  assert.equal(f.state().users[8].balance, 250);
  assert.equal(f.state().couponUses, 1);
});
test('pagamento legado nunca é creditado novamente nem estornado por suposição', async () => {
  const f = fixture({ legacy: true });
  await assert.rejects(f.settle(payment('refunded', 4.99, 2)), { code: 'PAGAMENTO_LEGADO' });
  assert.equal(f.state().users[7].balance, 0);
  assert.equal(f.state().ledger, null);
});
test('valores monetários inválidos não são liquidados', () => {
  for (const value of [-1, NaN, Infinity, 0.001, 'abc']) assert.throws(() => toCents(value));
  assert.equal(toCents(4.99), 499);
  assert.throws(() => settlementTarget(payment('approved', 5), { valorCentavos: 499, moedas: 5000 }));
});

function checkoutFixture() {
  let created;
  const controller = load('src/backend/controllers/compraController.js', {
    '../domain/planoCatalog': { obterPlanoPorId: () => ({ ...plan, precoMensal: 499, nome: 'Premium' }) },
    '../repositories/cupomRepository': { buscarPorCodigo: async () => ({ codigo: 'PROMO', desconto_percentual: 15 }) },
    mercadopago: { MercadoPagoConfig: class {}, Preference: class { async create(input) { created = input.body; return { id: 'pref-1', init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect' }; } } },
    crypto, '../config/env': { mpAccessToken: 'test', mpWebhookSecret: 'test', corsOrigin: 'https://moedaarena.com.br' },
    '../config/logger': logger, '../http/apiResponse': {
      sucesso: (_res, dados) => ({ dados }), erro: (_res, message, status, codigo) => ({ message, status, codigo }),
    }, '../repositories/pagamentoRepository': {}, '../database/db': { pool: {} },
    '../security/security': { signPaymentReference: data => JSON.stringify(data) },
  });
  return { buy: body => controller.processarCompra({ body: { planoId: 'premium', metodoPagamento: 'Pix', ...body }, usuario: { id: 7 } }, {}, err => { throw err; }), created: () => created };
}
test('checkout calcula cupom em centavos e inclui callback e snapshot de moedas', async () => {
  const f = checkoutFixture(); await f.buy({ cupom: 'PROMO', preco: 0.01 });
  assert.equal(f.created().items[0].unit_price, 4.24);
  assert.equal(f.created().notification_url, 'https://moedaarena.com.br/api/webhook/mercadopago');
  assert.equal(JSON.parse(f.created().external_reference).moedas, 9999);
  assert.equal(JSON.parse(f.created().external_reference).periodo, 'avulso');
});
test('checkout rejeita período anual ou vitalício em vez de cobrar outro valor', async () => {
  for (const periodo of ['anual', 'vitalicio', 'mensal']) {
    const f = checkoutFixture(); assert.equal((await f.buy({ periodo })).status, 400); assert.equal(f.created(), undefined);
  }
});

function webhookFixture({ signatureValid = true, amount = 4.99, status = 'approved', validReference = true } = {}) {
  let settled = 0, fetched = 0;
  const { processarNotificacao } = load('src/backend/controllers/webhookController.js', {
    mercadopago: { MercadoPagoConfig: class {}, Payment: class { async get() { fetched++; return { id: '123', status, transaction_amount: amount, currency_id: 'BRL', external_reference: 'signed' }; } },
      WebhookSignatureValidator: { validate() { if (!signatureValid) throw new Error('invalid'); } } },
    '../config/env': { mpAccessToken: 'test', mpWebhookSecret: 'test' }, '../config/logger': logger,
    '../repositories/usuarioRepository': {}, '../domain/planoCatalog': { obterPlanoPorId: () => plan },
    '../security/security': { verifyPaymentReference: () => validReference ? reference : null },
    '../domain/paymentAmounts': { toCents }, '../services/paymentSettlement': { async settlePayment() { settled++; return { changed: true }; } },
    '../integrations/emailService': {}, '../integrations/whatsappService': {},
  });
  return { async run() {
    const res = { status(code) { this.code = code; return this; }, send(body) { this.body = body; return this; } };
    await processarNotificacao({ query: { 'data.id': '123' }, body: { type: 'payment', status: 'approved' }, headers: {} }, res);
    return { code: res.code, settled, fetched };
  } };
}
test('webhook com assinatura inválida não consulta provedor nem credita', async () => {
  assert.deepEqual(await webhookFixture({ signatureValid: false }).run(), { code: 401, settled: 0, fetched: 0 });
});
test('webhook com valor ou referência adulterados não liquida', async () => {
  assert.equal((await webhookFixture({ amount: 0.01 }).run()).settled, 0);
  assert.equal((await webhookFixture({ validReference: false }).run()).settled, 0);
});
test('webhook pendente não confia no status approved recebido no corpo', async () => {
  assert.deepEqual(await webhookFixture({ status: 'pending' }).run(), { code: 200, settled: 0, fetched: 1 });
});
test('webhook aprovado encaminha liquidação após validar valor e referência', async () => {
  assert.deepEqual(await webhookFixture().run(), { code: 200, settled: 1, fetched: 1 });
});
