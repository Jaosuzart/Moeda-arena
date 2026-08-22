const config = require("./src/config/env");
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
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
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    ambiente: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});
app.use(errorHandler);
const { runMinify } = require("./minify");
const whatsappService = require("./src/services/whatsappService");
const iniciar = async () => {
  try {
    try {
      const resMin = runMinify();
      logger.info("Assets estáticos minificados com sucesso.", {
        css: `${resMin.cssOriginal}B -> ${resMin.cssMinified}B`,
        js: `${resMin.jsOriginal}B -> ${resMin.jsMinified}B`,
      });
    } catch (e) {
      logger.error("Erro ao minificar assets estáticos no startup:", {
        erro: e.message,
      });
    }
    if (config.nodeEnv === "development") {
      const fs = require("fs");
      const path = require("path");
      let watchTimeout;
      fs.watch(path.join(__dirname, "public"), (eventType, filename) => {
        if (filename === "main.js" || filename === "style.css") {
          clearTimeout(watchTimeout);
          watchTimeout = setTimeout(() => {
            try {
              const resMin = runMinify();
              logger.info(
                `Arquivo ${filename} modificado. Assets re-minificados.`,
                {
                  css: `${resMin.cssOriginal}B -> ${resMin.cssMinified}B`,
                  js: `${resMin.jsOriginal}B -> ${resMin.jsMinified}B`,
                },
              );
            } catch (err) {
              logger.error("Erro ao re-minificar assets dinamicamente:", {
                erro: err.message,
              });
            }
          }, 100);
        }
      });
    }
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
    const encerrar = async (sinal) => {
      logger.info(`Sinal ${sinal} recebido. Iniciando shutdown gracioso...`);
      server.close(async () => {
        logger.info(
          "Servidor HTTP encerrado. Fechando conexões com o banco...",
        );
        await encerrarPool();
        logger.info("Shutdown completo. Até logo!");
        process.exit(0);
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
  } catch (err) {
    logger.error("Falha crítica ao iniciar o servidor:", { erro: err.message });
    logger.error(
      "Verifique as configurações do .env e se o banco de dados está acessível.",
    );
    process.exit(1);
  }
};
iniciar();
