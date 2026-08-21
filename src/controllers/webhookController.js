const { MercadoPagoConfig, Payment } = require("mercadopago");
const config = require("../config/env");
const logger = require("../config/logger");
const usuarioModel = require("../models/usuarioModel");
const whatsappService = require("../services/whatsappService");
const emailService = require("../services/emailService");
const cupomModel = require("../models/cupomModel");
const { pool } = require("../models/db");

const mpClient = new MercadoPagoConfig({ accessToken: config.mpAccessToken });

const jaProcessado = async (paymentId) => {
  const [rows] = await pool.query(
    "SELECT id FROM pagamentos_processados WHERE payment_id = ?",
    [String(paymentId)],
  );
  return rows.length > 0;
};

const registrarPagamento = async (paymentId, usuarioId, planoId, tokens, valor, status) => {
  await pool.query(
    "INSERT INTO pagamentos_processados (payment_id, usuario_id, plano_id, tokens_creditados, valor_pago, status) VALUES (?, ?, ?, ?, ?, ?)",
    [String(paymentId), usuarioId, planoId, tokens, valor, status],
  );
};

const notificarUsuario = async (usuario, valor, tokens) => {
  if (usuario.telefone) {
    const msg = `✅ Olá ${usuario.nome}! Seu pagamento de R$ ${valor} foi aprovado! 🎉\n\nCreditamos ${tokens} tokens na sua conta da Moeda Arena.`;
    whatsappService.enviarMensagem(usuario.telefone, msg).catch((err) =>
      logger.error("Falha ao enviar WhatsApp.", { erro: err.message }),
    );
  }

  if (usuario.email) {
    emailService.enviarEmailRecibo(usuario.email, usuario.nome, valor, tokens).catch((err) =>
      logger.error("Falha ao enviar e-mail de recibo.", { erro: err.message }),
    );
  }
};

const processarAfiliado = async (usuarioId, tokensComprados) => {
  const usuario = await usuarioModel.buscarPorId(usuarioId);
  if (!usuario || !usuario.indicado_por) return;

  const comissao = Math.floor(tokensComprados * 0.05);
  if (comissao <= 0) return;

  await usuarioModel.adicionarTokens(usuario.indicado_por, comissao);
  await pool.query(
    "UPDATE usuarios SET ganhos_afiliado = ganhos_afiliado + ? WHERE id = ?",
    [comissao, usuario.indicado_por],
  );
  logger.info("Comissão de afiliado paga.", { indicador: usuario.indicado_por, comissao });
};

const processarNotificacao = async (req, res) => {
  res.status(200).send("OK");

  const evento = req.body;
  const { topic, id } = req.query;

  try {
    const tipoEvento = topic || evento.type;
    const idPagamento = id || evento.data?.id;

    if (tipoEvento !== "payment" || !idPagamento) {
      logger.debug("Webhook ignorado: tipo não é payment.", { tipo: tipoEvento });
      return;
    }

    logger.info("Webhook de pagamento recebido.", { paymentId: idPagamento });

    if (await jaProcessado(idPagamento)) {
      logger.info("Pagamento já processado. Ignorando duplicata.", { paymentId: idPagamento });
      return;
    }

    const paymentApi = new Payment(mpClient);
    const pagamento = await paymentApi.get({ id: idPagamento });

    if (pagamento.status !== "approved") {
      logger.info("Pagamento não aprovado. Nenhuma ação necessária.", {
        paymentId: idPagamento,
        status: pagamento.status,
      });
      return;
    }

    let referencia;
    try {
      referencia = JSON.parse(pagamento.external_reference);
    } catch {
      logger.error("Falha ao parsear external_reference.", { paymentId: idPagamento });
      return;
    }

    const { usuarioId, planoId, tokens, cupom } = referencia;
    const creditado = await usuarioModel.adicionarTokens(usuarioId, tokens);

    if (!creditado) {
      logger.error("Falha ao creditar tokens: usuário não encontrado.", { usuarioId });
      return;
    }

    await registrarPagamento(
      idPagamento,
      usuarioId,
      planoId,
      tokens,
      pagamento.transaction_amount || 0,
      "approved",
    );

    if (cupom) {
      cupomModel.incrementarUso(cupom).catch((err) =>
        logger.error("Erro ao registrar uso do cupom (não crítico).", { cupom, erro: err.message }),
      );
    }

    await processarAfiliado(usuarioId, tokens);

    const usuario = await usuarioModel.buscarPorId(usuarioId);
    if (usuario) {
      await notificarUsuario(usuario, pagamento.transaction_amount, tokens);
    }

    logger.info("Pagamento processado e tokens creditados.", {
      paymentId: idPagamento,
      usuarioId,
      planoId,
      tokens,
    });
  } catch (err) {
    logger.error("Erro crítico ao processar webhook.", { erro: err.message, stack: err.stack });
  }
};

module.exports = { processarNotificacao };
