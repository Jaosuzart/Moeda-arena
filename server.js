<<<<<<< HEAD
const config = require("./src/backend/config/env");
const logger = require("./src/backend/config/logger");
const app = require("./src/backend/app");
const { testarConexao, encerrarPool } = require("./src/backend/database/db");
const whatsappService = require("./src/backend/integrations/whatsappService");
=======
const config = require("./src/config/env");
const logger = require("./src/config/logger");
const app = require("./src/app");
const { testarConexao, encerrarPool } = require("./src/models/db");
const whatsappService = require("./src/services/whatsappService");
>>>>>>> 16517a57767f8530fe1a419d706e317705ca7966

let server;
let encerrando = false;

const encerrar = async (sinal, codigo = 0) => {
  if (encerrando) return;
  encerrando = true;
  logger.info("Encerrando servidor...", { sinal });
  const limite = setTimeout(() => {
    logger.error("Encerramento excedeu o limite de 10 segundos.");
    process.exit(1);
  }, 10000);
  try {
    if (server?.listening) {
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
        server.closeIdleConnections?.();
      });
    }
    await whatsappService.stopWhatsApp();
    await encerrarPool();
  } catch (err) {
    logger.error("Falha no encerramento.", { erro: err.message });
    codigo = 1;
  } finally {
    clearTimeout(limite);
    if (sinal === "SIGUSR2" && codigo === 0) {
      process.kill(process.pid, "SIGUSR2");
    } else {
      process.exit(codigo);
    }
  }
};

process.on("SIGTERM", () => encerrar("SIGTERM"));
process.on("SIGINT", () => encerrar("SIGINT"));
process.once("SIGUSR2", () => encerrar("SIGUSR2"));

const iniciar = async () => {
  try {
    await testarConexao();
    if (encerrando) return;
    server = app.listen(config.port, () => {
      logger.info(`Servidor HTTP rodando em http://localhost:${config.port}`, {
        ambiente: config.nodeEnv,
        porta: config.port,
      });
<<<<<<< HEAD
      if (config.whatsappEnabled && config.nodeEnv !== "test" && !encerrando) {
=======
      if (config.nodeEnv !== "test" && !encerrando) {
>>>>>>> 16517a57767f8530fe1a419d706e317705ca7966
        void whatsappService.initWhatsApp();
      }
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        logger.error(
          `Porta ${config.port} ocupada. Encerre a outra instância ou altere PORT no .env.`,
        );
      } else {
        logger.error("Erro no servidor HTTP.", { codigo: err.code });
      }
      void encerrar("ERRO_HTTP", 1);
    });
  } catch (err) {
    logger.error("Falha ao iniciar o servidor.", { codigo: err.code });
    if (err.code === "ER_ACCESS_DENIED_ERROR") {
      logger.error(
        "O banco recusou o acesso. Confira DB_USER e DB_PASSWORD no .env da raiz do Moeda Arena e a senha atual no provedor.",
      );
    } else {
      logger.error(
        "Verifique as configurações do .env, a disponibilidade e as permissões do banco de dados.",
      );
    }
    await encerrar("FALHA_INICIALIZACAO", 1);
  }
};

void iniciar();
