const logger = require("../config/logger");

async function enviarMensagem() {
  logger.warn("Notificação automática de WhatsApp indisponível no Workers; recibo enviado por e-mail.");
  return false;
}

module.exports = { enviarMensagem };
