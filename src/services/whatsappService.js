const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const logger = require("../config/logger");
const pino = require("pino");

let sock;
let isReady = false;

const initWhatsApp = async () => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(".whatsapp_auth_baileys");

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr)}`;
        logger.info("====================================================");
        logger.info("📱 Escaneie o QR Code no terminal OU clique no link:");
        logger.info(`👉 ${url} 👈`);
        logger.info("====================================================");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "close") {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        isReady = false;
        logger.warn("WhatsApp desconectado", {
          reason: lastDisconnect?.error?.message,
          shouldReconnect,
        });

        if (shouldReconnect) {
          logger.info("Reconectando ao WhatsApp...");
          setTimeout(() => initWhatsApp(), 3000);
        } else {
          logger.error(
            "WhatsApp deslogado pelo celular. Apague a pasta .whatsapp_auth_baileys e reinicie para gerar novo QR Code.",
          );
        }
      } else if (connection === "open") {
        isReady = true;
        logger.info("✅ WhatsApp Bot conectado (Baileys) e pronto para enviar mensagens!");
      }
    });
  } catch (error) {
    logger.error("Falha crítica ao iniciar serviço de WhatsApp", {
      error: error.message,
    });
  }
};

const enviarMensagem = async (telefone, mensagem) => {
  if (!isReady || !sock) {
    logger.warn("Tentativa de envio de WhatsApp ignorada. Bot não está pronto.", { telefone });
    return false;
  }
  if (!telefone) {
    logger.warn("Tentativa de envio sem número de telefone fornecido.");
    return false;
  }

  try {
    let numeroLimpo = telefone.replace(/\D/g, "");
    if (numeroLimpo.length >= 10 && !numeroLimpo.startsWith("55")) {
      numeroLimpo = "55" + numeroLimpo;
    }

    const jid = `${numeroLimpo}@s.whatsapp.net`;

    await sock.sendMessage(jid, { text: mensagem });

    logger.info("Mensagem de WhatsApp enviada com sucesso.", { telefone: numeroLimpo });
    return true;
  } catch (error) {
    logger.error("Erro ao enviar mensagem no WhatsApp", {
      telefone,
      error: error.message,
    });
    return false;
  }
};

const stopWhatsApp = async () => {
  if (sock) {
    logger.info("Encerrando cliente do WhatsApp (Baileys)...");
    try {
      sock.end(new Error("Processo encerrado pelo servidor"));
    } catch (e) {
      logger.warn("Erro ao encerrar WhatsApp:", { erro: e.message });
    }
  }
};

module.exports = {
  initWhatsApp,
  enviarMensagem,
  stopWhatsApp,
};
