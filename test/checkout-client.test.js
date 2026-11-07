const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../src/frontend/main.js'), 'utf8');
const handlers = source.slice(source.indexOf('  function abrirCheckout(plano)'), source.indexOf('  async function carregarRanking()'));
function setup() {
  const element = () => ({ value: '', textContent: '', style: {}, disabled: false, callbacks: {},
    addEventListener(name, callback) { this.callbacks[name] = callback; }, appendChild() {},
  });
  const DOM = Object.fromEntries(['checkoutPlanoNome','checkoutFeedback','metodoPagamento','btnConfirmarCompra','inputCupom',
    'cupomFeedback','btnAplicarCupom','areaPagamento','areaCupom','checkoutPrecoArea','checkoutPrecoOriginal',
    'checkoutPrecoFinal','checkoutModal','btnFecharCheckout','btnCancelarCheckout','navMoedaCount'].map(key => [key, element()]));
  let assigned, requested;
  const context = { DOM, estado: {}, document: { createElement: element, createTextNode: text => text },
    esconderFeedback() {}, mostrarFeedback() {}, abrirModal() {}, fecharModal() {}, setTimeout() {}, URL,
    window: { location: { assign(url) { assigned = url; } } },
    fetchAutenticado: async (url, options) => {
      requested = JSON.parse(options.body);
      if (url.includes('validar-cupom')) return { json: async () => ({ sucesso: true, dados: { codigo: 'PROMO', desconto_percentual: 15, mensagem: 'Cupom aplicado' } }) };
      return { json: async () => ({ sucesso: true, dados: { urlCheckout: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=test' } }) };
    },
  };
  vm.createContext(context); vm.runInContext(handlers + '\nthis.openCheckout = abrirCheckout;', context);
  return { DOM, open: context.openCheckout, result: () => ({ assigned, requested }) };
}
test('reabrir checkout permite novo cupom e desconto usa o mesmo arredondamento do backend', async () => {
  const f = setup(); f.DOM.inputCupom.disabled = true; f.DOM.btnAplicarCupom.textContent = 'Aplicado';
  f.open({ nome: 'Premium', id: 'premium', precoMensal: 499 });
  assert.equal(f.DOM.inputCupom.disabled, false);
  assert.equal(f.DOM.btnAplicarCupom.textContent, 'Aplicar');
  f.DOM.inputCupom.value = 'PROMO';
  await f.DOM.btnAplicarCupom.callbacks.click();
  assert.match(f.DOM.checkoutPrecoFinal.textContent, /4,24/);
});
test('checkout envia compra avulsa e redireciona na mesma aba', async () => {
  const f = setup(); f.open({ nome: 'Premium', id: 'premium', precoMensal: 499, isGratis: false });
  f.DOM.metodoPagamento.value = 'Pix';
  await f.DOM.btnConfirmarCompra.callbacks.click();
  assert.equal(f.result().requested.periodo, 'avulso');
  assert.match(f.result().assigned, /^https:\/\/www\.mercadopago\.com\.br\//);
});
