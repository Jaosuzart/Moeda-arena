const { MercadoPagoConfig, Payment } = require("mercadopago");
const crypto = require("crypto");
const config = require("../config/env");
const logger = require("../config/logger");
const usuarioModel = require("../models/usuarioModel");
const pagamentoModel = require("../models/pagamentoModel");
const whatsappService = require("../services/whatsappService");
const emailService = require("../services/emailService");
const cupomModel = require("../models/cupomModel");

const mpClient = new MercadoPagoConfig({ accessToken: config.mpAccessToken });

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
  const evento = req.body;
  const { topic, id } = req.query;
  const tipoEvento = topic || evento?.type;
  const idPagamento = id || evento?.data?.id;

  if (tipoEvento !== "payment" || !idPagamento) {
    logger.debug("Webhook ignorado: tipo não é payment.", { tipo: tipoEvento });
    return res.status(200).send("Ignorado");
  }

  if (config.mpWebhookSecret) {
    const signatureHeader = req.headers["x-signature"];
    if (!signatureHeader) {
      logger.warn("Webhook recusado: sem x-signature.");
      return res.status(403).send("Missing signature");
    }

    const parts = signatureHeader.split(",");
    let ts = "";
    let v1 = "";
    parts.forEach(part => {
      const [key, value] = part.split("=");
      if (key && key.trim() === "ts") ts = value;
      if (key && key.trim() === "v1") v1 = value;
    });

    const manifest = `id:${idPagamento};request-id:${req.headers["x-request-id"] || ""};ts:${ts};`;
    const hash = crypto.createHmac("sha256", config.mpWebhookSecret).update(manifest).digest("hex");

    if (hash !== v1) {
      logger.warn("Assinatura do webhook inválida.", { signatureHeader });
      return res.status(403).send("Invalid signature");
    }
  }

  try {



    logger.info("Webhook de pagamento recebido.", { paymentId: idPagamento });

    if (await pagamentoModel.jaProcessado(idPagamento)) {
      logger.info("Pagamento já processado. Ignorando duplicata.", { paymentId: idPagamento });
      return res.status(200).send("Duplicata");
    }

    const paymentApi = new Payment(mpClient);
    const pagamento = await paymentApi.get({ id: idPagamento });

    if (pagamento.status !== "approved") {
      logger.info("Pagamento não aprovado. Nenhuma ação necessária.", {
        paymentId: idPagamento,
        status: pagamento.status,
      });
      return res.status(200).send("Ignorado - Nao aprovado");
    }

    let referencia;
    try {
      referencia = JSON.parse(pagamento.external_reference);
    } catch {
      logger.error("Falha ao parsear external_reference.", { paymentId: idPagamento });
      return res.status(200).send("Referencia invalida");
    }

    const { usuarioId, planoId, tokens, cupom } = referencia;
    const creditado = await usuarioModel.adicionarTokens(usuarioId, tokens);

    if (!creditado) {
      logger.error("Falha ao creditar tokens: usuário não encontrado.", { usuarioId });
      return res.status(200).send("Usuario nao encontrado");
    }

    await pagamentoModel.registrarPagamento(
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

    return res.status(200).send("OK");
  } catch (err) {
    logger.error("Erro crítico ao processar webhook.", { erro: err.message, stack: err.stack });
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = { processarNotificacao };
