const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const logger = require("../config/logger");
const pino = require("pino");
const path = require("path");

let sock;
let isReady = false;
let encerrando = false;
let iniciando = false;
let reconnectTimer;

const initWhatsApp = async () => {
  if (encerrando || iniciando) return;
  iniciando = true;
  try {
    const { state, saveCreds } = await useMultiFileAuthState(
      path.resolve(__dirname, "../../.whatsapp_auth_baileys"),
    );
    if (encerrando) return;

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
    });

    sock.ev.on("creds.update", () => {
      void saveCreds().catch((error) =>
        logger.error("Falha ao salvar sessão do WhatsApp.", {
          erro: error.message,
        }),
      );
    });

    sock.ev.on("connection.update", (update) => {
      if (encerrando) return;
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        logger.info("====================================================");
        logger.info("📱 Escaneie o QR Code exibido neste terminal:");
        logger.info("====================================================");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "close") {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !==
          DisconnectReason.loggedOut;
        isReady = false;
        logger.warn("WhatsApp desconectado", {
          reason: lastDisconnect?.error?.message,
          shouldReconnect,
        });

        if (shouldReconnect) {
          logger.info("Reconectando ao WhatsApp...");
          clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(() => {
            void initWhatsApp();
          }, 3000);
        } else {
          logger.error(
            "WhatsApp deslogado pelo celular. Apague a pasta .whatsapp_auth_baileys e reinicie para gerar novo QR Code.",
          );
        }
      } else if (connection === "open") {
        isReady = true;
        logger.info(
          "✅ WhatsApp Bot conectado (Baileys) e pronto para enviar mensagens!",
        );
      }
    });
  } catch (error) {
    logger.error("Falha crítica ao iniciar serviço de WhatsApp", {
      error: error.message,
    });
  } finally {
    iniciando = false;
  }
};

const enviarMensagem = async (telefone, mensagem) => {
  if (!isReady || !sock) {
    logger.warn(
      "Tentativa de envio de WhatsApp ignorada. Bot não está pronto.",
      { telefone },
    );
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

    logger.info("Mensagem de WhatsApp enviada com sucesso.", {
      telefone: numeroLimpo,
    });
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
  encerrando = true;
  isReady = false;
  clearTimeout(reconnectTimer);
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
