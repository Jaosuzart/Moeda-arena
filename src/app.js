const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const Sentry = require("@sentry/node");

const config = require("./config/env");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const planoRoutes = require("./routes/planoRoutes");
const compraRoutes = require("./routes/compraRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const gameRoutes = require("./routes/gameRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contatoRoutes = require("./routes/contatoRoutes");

Sentry.init({
  dsn: "https://e9316799db954e62b4d4a7911d1207c2@o4512017861967873.ingest.us.sentry.io/4512017910857728",
  tracesSampleRate: 1.0,
});

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: config.corsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
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

app.use(compression());
app.use(express.json());
app.use(cookieParser());

app.use(
  express.static(path.join(__dirname, "../public"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else {
        res.setHeader("Cache-Control", "public, max-age=31536000");
      }
    },
    etag: true,
  })
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

Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);

module.exports = app;
