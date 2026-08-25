const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const logger = require("../config/logger");
let client;
let isReady = false;
const fs = require("fs");
const path = require("path");

const limparLocksPuppeteer = () => {
  const sessionDir = path.join(
    process.cwd(),
    ".whatsapp_auth",
    "session",
  );
  if (!fs.existsSync(sessionDir)) return;
  try {
    const entries = fs.readdirSync(sessionDir, { recursive: true });
    for (const entry of entries) {
      if (
        typeof entry === "string" &&
        entry.endsWith("SingletonLock")
      ) {
        const lockPath = path.join(sessionDir, entry);
        fs.rmSync(lockPath, { force: true });
        logger.info("Lock travado do Puppeteer removido.", {
          arquivo: entry,
        });
      }
    }
  } catch (err) {
    logger.warn("Aviso ao limpar locks do Puppeteer:", {
      erro: err.message,
    });
  }
};

const initWhatsApp = () => {
  try {
    limparLocksPuppeteer();

    client = new Client({
      authStrategy: new LocalAuth({ dataPath: ".whatsapp_auth" }),
      puppeteer: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu"
        ],
      },
    });
    client.on("qr", (qr) => {
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr)}`;
      logger.info("====================================================");
      logger.info("📱 Escaneie o QR Code no terminal OU clique no link:");
      logger.info(`👉 ${url} 👈`);
      logger.info("====================================================");
      qrcode.generate(qr, { small: true });
    });
    client.on("ready", () => {
      isReady = true;
      logger.info("✅ WhatsApp Bot conectado e pronto para enviar mensagens!");
    });
    client.on("authenticated", () => {
      logger.info("WhatsApp Autenticado com sucesso.");
    });
    client.on("auth_failure", (msg) => {
      logger.error("Falha na autenticação do WhatsApp", { error: msg });
    });
    client.on("disconnected", (reason) => {
      isReady = false;
      logger.warn("WhatsApp desconectado", { reason });
    });
    client.initialize().catch((err) => {
      if (err.message && err.message.includes("already running")) {
        logger.warn("Browser do WhatsApp ainda estava travado. Forçando encerramento de processos Chrome órfãos...");
        
        const { exec } = require("child_process");
        const comando = process.platform === "win32" 
          ? `wmic process where "name='chrome.exe' and commandline like '%--headless%'" call terminate` 
          : `pkill -f "chrome.*--headless"`;

        exec(comando, (error) => {
          logger.info("Processos órfãos eliminados. Limpando sessão...");
          const sessionDir = path.join(process.cwd(), ".whatsapp_auth", "session");
          try {
            fs.rmSync(sessionDir, { recursive: true, force: true });
          } catch (rmErr) {
            logger.warn("Aviso ao limpar pasta da sessão (EPERM), tentaremos novamente...");
          }
          setTimeout(() => initWhatsApp(), 3000);
        });
      } else {
        logger.error("Erro ao inicializar WhatsApp:", {
          stack: err.stack,
        });
      }
    });
  } catch (error) {
    logger.error("Falha crítica ao iniciar serviço de WhatsApp", {
      error: error.message,
    });
  }
};
const enviarMensagem = async (telefone, mensagem) => {
  if (!isReady || !client) {
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
    const chatId = `${numeroLimpo}@c.us`;
    await client.sendMessage(chatId, mensagem);
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
  if (client) {
    logger.info("Encerrando cliente do WhatsApp (limpeza de processo)...");
    try {
      // O client.destroy() pode travar se o browser já estiver travado. 
      // Executamos com timeout.
      await Promise.race([
        client.destroy(),
        new Promise(resolve => setTimeout(resolve, 3000))
      ]);
    } catch (e) {
      logger.warn("Erro ao encerrar WhatsApp via destroy:", { erro: e.message });
    }
    
    // Aniquilador final para garantir que nenhum Chrome zombie fique vivo
    const { exec } = require("child_process");
    const comando = process.platform === "win32" 
      ? `wmic process where "name='chrome.exe' and commandline like '%--headless%'" call terminate` 
      : `pkill -f "chrome.*--headless"`;
    
    exec(comando, () => {
      logger.info("Verificação final de processos órfãos concluída.");
    });
  }
};
module.exports = {
  initWhatsApp,
  enviarMensagem,
  stopWhatsApp,
};
