const config = require("./src/config/env");
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const logger = require("./src/config/logger");
const { testarConexao, encerrarPool } = require("./src/models/db");
const errorHandler = require("./src/middlewares/errorHandler");
const authRoutes = require("./src/routes/authRoutes");
const planoRoutes = require("./src/routes/planoRoutes");
const compraRoutes = require("./src/routes/compraRoutes");
const webhookRoutes = require("./src/routes/webhookRoutes");
const gameRoutes = require("./src/routes/gameRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const contatoRoutes = require("./src/routes/contatoRoutes");
const app = express();
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    sucesso: false,
    erro: "Muitas requisições. Tente novamente em 1 minuto.",
    codigo: "RATE_LIMIT_EXCEDIDO",
  },
});
app.use("/api", limiter);
const compression = require("compression");
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else {
        res.setHeader("Cache-Control", "public, max-age=31536000");
      }
    },
    etag: true,
  }),
);
app.use("/api/auth", authRoutes);
app.use("/api", planoRoutes);
app.use("/api", compraRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", contatoRoutes);
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    ambiente: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});
app.use(errorHandler);

const whatsappService = require("./src/services/whatsappService");
const iniciar = async () => {
  try {
    await testarConexao();
    if (config.nodeEnv !== "test") {
      whatsappService.initWhatsApp();
    }
    const server = app.listen(config.port, () => {
      logger.info(`Servidor rodando em http://localhost:${config.port}`, {
        ambiente: config.nodeEnv,
        porta: config.port,
      });
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        if (config.nodeEnv !== "development") {
          logger.error(`Porta ${config.port} ocupada. O servidor não pode iniciar.`);
          process.exit(1);
        }
        logger.warn(
          `Porta ${config.port} ocupada. Tentando liberar automaticamente (apenas dev)...`,
        );
        const { exec } = require("child_process");
        exec(
          `netstat -ano | findstr :${config.port}`,
          (error, stdout) => {
            if (error || !stdout.trim()) {
              logger.error(
                `Não foi possível identificar o processo na porta ${config.port}. Encerre-o manualmente.`,
              );
              process.exit(1);
            }
            const pids = new Set();
            stdout
              .trim()
              .split("\n")
              .forEach((line) => {
                const parts = line.trim().split(/\s+/);
                const pid = parts[parts.length - 1];
                if (pid && /^\d+$/.test(pid) && pid !== "0") {
                  pids.add(pid);
                }
              });
            if (pids.size === 0) {
              logger.error("Nenhum PID válido encontrado. Encerrando.");
              process.exit(1);
            }
            let killed = 0;
            pids.forEach((pid) => {
              exec(`taskkill /F /PID ${pid}`, (killErr) => {
                killed++;
                if (!killErr) {
                  logger.info(`Processo PID ${pid} finalizado com sucesso.`);
                }
                if (killed === pids.size) {
                  logger.info(
                    "Porta liberada. Reiniciando servidor em 1 segundo...",
                  );
                  setTimeout(() => iniciar(), 1000);
                }
              });
            });
          },
        );
      } else {
        logger.error("Erro fatal ao iniciar o servidor:", {
          erro: err.message,
        });
        process.exit(1);
      }
    });
    const encerrar = async (sinal) => {
      logger.info(`Sinal ${sinal} recebido. Iniciando shutdown gracioso...`);
      try {
        await whatsappService.stopWhatsApp();
      } catch (e) { }

      server.close(async () => {
        logger.info("Servidor HTTP encerrado. Fechando banco de dados...");
        await encerrarPool();
        logger.info("Shutdown completo. Até logo!");
        if (sinal === "SIGUSR2") {
          process.kill(process.pid, "SIGUSR2");
        } else {
          process.exit(0);
        }
      });
      setTimeout(() => {
        logger.error(
          "Shutdown gracioso excedeu o tempo limite. Forçando encerramento.",
        );
        process.exit(1);
      }, 10000);
    };
    process.on("SIGTERM", () => encerrar("SIGTERM"));
    process.on("SIGINT", () => encerrar("SIGINT"));
    process.once("SIGUSR2", () => encerrar("SIGUSR2"));
  } catch (err) {
    logger.error("Falha crítica ao iniciar o servidor:", { erro: err.message });
    logger.error(
      "Verifique as configurações do .env e se o banco de dados está acessível.",
    );
    process.exit(1);
  }
};
iniciar();

