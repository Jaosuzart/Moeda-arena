
const { MercadoPagoConfig, Payment } = require('mercadopago');
const config = require('../config/env');
const logger = require('../config/logger');
const usuarioModel = require('../models/usuarioModel');
const cupomModel = require('../models/cupomModel');
const { pool } = require('../models/db');

const client = new MercadoPagoConfig({ accessToken: config.mpAccessToken });

const jaProcessado = async (paymentId) => {
  const sql = 'SELECT id FROM pagamentos_processados WHERE payment_id = ?';
  const [rows] = await pool.query(sql, [String(paymentId)]);
  return rows.length > 0;
};

const registrarPagamento = async (paymentId, usuarioId, planoId, tokens, valor, status) => {
  const sql = `INSERT INTO pagamentos_processados
    (payment_id, usuario_id, plano_id, tokens_creditados, valor_pago, status)
    VALUES (?, ?, ?, ?, ?, ?)`;
  await pool.query(sql, [String(paymentId), usuarioId, planoId, tokens, valor, status]);
};
const processarNotificacao = async (req, res) => {
  res.status(200).send('OK');

  const evento = req.body;
  const { topic, id } = req.query;

  try {
    const tipoEvento = topic || evento.type;
    const idPagamento = id || (evento.data && evento.data.id);

    if (tipoEvento !== 'payment' || !idPagamento) {
      logger.debug('Webhook ignorado: tipo não é payment.', { tipo: tipoEvento });
      return;
    }

    logger.info('Webhook de pagamento recebido.', { paymentId: idPagamento });

    const processado = await jaProcessado(idPagamento);
    if (processado) {
      logger.info('Pagamento já processado anteriormente. Ignorando duplicata.', {
        paymentId: idPagamento
      });
      return;
    }

    const paymentApi = new Payment(client);
    const pagamento = await paymentApi.get({ id: idPagamento });

    logger.info('Detalhes do pagamento obtidos da API do Mercado Pago.', {
      paymentId: idPagamento,
      status: pagamento.status,
      statusDetail: pagamento.status_detail,
      externalReference: pagamento.external_reference
    });
    if (pagamento.status !== 'approved') {
      logger.info('Pagamento não aprovado. Nenhuma ação necessária.', {
        paymentId: idPagamento,
        status: pagamento.status,
        statusDetail: pagamento.status_detail
      });
      return;
    }

    let referencia;
    try {
      referencia = JSON.parse(pagamento.external_reference);
    } catch (e) {
      logger.error('Falha ao parsear external_reference do pagamento.', {
        paymentId: idPagamento,
        rawReference: pagamento.external_reference
      });
      return;
    }

    const { usuarioId, planoId, tokens, cupom } = referencia;

    const creditado = await usuarioModel.adicionarTokens(usuarioId, tokens);

    if (creditado) {
      await registrarPagamento(
        idPagamento, usuarioId, planoId, tokens,
        pagamento.transaction_amount || 0, 'approved'
      );

      if (cupom) {
        try {
          await cupomModel.incrementarUso(cupom);
          logger.info('Uso de cupom de streamer registrado.', {
            cupom,
            paymentId: idPagamento,
            usuarioId
          });
        } catch (cupomErr) {
          logger.error('Erro ao registrar uso do cupom (não crítico).', {
            cupom,
            erro: cupomErr.message
          });
        }
      }

      logger.info('Pagamento processado com sucesso! Tokens creditados.', {
        paymentId: idPagamento,
        usuarioId,
        planoId,
        tokens,
        cupom: cupom || 'nenhum',
        valor: pagamento.transaction_amount
      });
    } else {
      logger.error('Falha ao creditar tokens: usuário não encontrado no banco.', {
        paymentId: idPagamento,
        usuarioId
      });
    }

  } catch (err) {
    logger.error('Erro crítico ao processar webhook:', {
      erro: err.message,
      stack: err.stack
    });
  }
};

module.exports = { processarNotificacao };
