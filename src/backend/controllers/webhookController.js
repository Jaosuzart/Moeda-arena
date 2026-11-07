const { MercadoPagoConfig, Payment, WebhookSignatureValidator } = require("mercadopago");
const config = require("../config/env");
const logger = require("../config/logger");
const usuarioModel = require("../repositories/usuarioRepository");
const planoModel = require("../domain/planoCatalog");
const { verifyPaymentReference } = require("../security/security");
const { toCents } = require("../domain/paymentAmounts");
const { settlePayment } = require("../services/paymentSettlement");
const emailService = require("../integrations/emailService");
const whatsappService = require("../integrations/whatsappService");
const mpClient = new MercadoPagoConfig({ accessToken: config.mpAccessToken });

async function processarNotificacao(req, res) {
  const type = req.query.topic || req.body?.type;
  const id = req.query["data.id"] || req.query.id || req.body?.data?.id;
  if (type !== "payment" || !id) return res.status(200).send("Ignorado");
  if (!/^\d+$/.test(String(id))) return res.status(400).send("ID invalido");
  if (!config.mpWebhookSecret) return res.status(503).send("Webhook nao configurado");
  try {
    WebhookSignatureValidator.validate({
      xSignature: req.headers["x-signature"], xRequestId: req.headers["x-request-id"],
      dataId: String(id), secret: config.mpWebhookSecret,
    });
  } catch {
    return res.status(401).send("Invalid signature");
  }
  try {
    // O corpo da notificação nunca é usado como prova de aprovação ou valor.
    const payment = await new Payment(mpClient).get({ id: String(id) });
    if (String(payment.id) !== String(id)) throw new Error("ID divergente no provedor.");
    if (!["approved", "refunded", "charged_back", "cancelled", "in_mediation"].includes(payment.status)) {
      return res.status(200).send("Ignorado - Nao aprovado");
    }
    const reference = verifyPaymentReference(payment.external_reference);
    if (!reference) return res.status(400).send("Referencia invalida");
    const plan = planoModel.obterPlanoPorId(reference.planoId);
    if (!plan || plan.isGratis) return res.status(400).send("Plano invalido");
    if (toCents(payment.transaction_amount) !== reference.valorCentavos || payment.currency_id !== reference.moeda) {
      return res.status(400).send("Pagamento divergente");
    }
    const result = await settlePayment(payment, reference, plan);
    if (result.firstCredit) {
      // Falhas de comunicação nunca revertem ou repetem a liquidação financeira.
      try {
        const user = await usuarioModel.buscarPorId(reference.usuarioId);
        if (user?.email) await emailService.enviarEmailRecibo(user.email, user.nome, payment.transaction_amount, result.coins);
        if (user?.telefone && config.whatsappEnabled) await whatsappService.enviarMensagem(user.telefone,
          `Olá ${user.nome}! Seu pagamento foi confirmado. ${result.coins} moedas foram creditadas na Moeda Arena.`);
      } catch (error) {
        logger.error("Falha ao notificar pagamento liquidado.", { paymentId: String(id), erro: error.message });
      }
    }
    return res.status(200).send(result.changed ? "OK" : "Sem alteracao");
  } catch (error) {
    logger.error("Falha ao processar webhook.", { paymentId: String(id), codigo: error.code, erro: error.message });
    return res.status(500).send("Falha no processamento");
  }
}
module.exports = { processarNotificacao };
