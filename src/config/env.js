const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

function inteiroPositivo(nome, padrao, maximo = Number.MAX_SAFE_INTEGER) {
  const valor = process.env[nome] ?? String(padrao);
  const numero = Number(valor);
  if (
    !/^\d+$/.test(valor) ||
    !Number.isSafeInteger(numero) ||
    numero < 1 ||
    numero > maximo
  ) {
    process.stderr.write(
      `[FATAL] ${nome} deve ser um inteiro entre 1 e ${maximo}.\n`,
    );
    process.exit(1);
  }
  return numero;
}
const variaveisObrigatorias = [
  "PORT",
  "MP_ACCESS_TOKEN",
  "DB_HOST",
  "DB_USER",
  "DB_NAME",
  "JWT_SECRET",
  "API_GAME_SECRET",
  "ENCRYPTION_KEY",
];
const faltando = variaveisObrigatorias.filter((v) => !process.env[v]);
if (faltando.length > 0) {
  process.stderr.write(
    `[FATAL] Variáveis de ambiente obrigatórias não definidas: ${faltando.join(", ")}\n`,
  );
  process.stderr.write(
    "[FATAL] Crie um arquivo .env na raiz do projeto. Use .env.example como referência.\n",
  );
  process.exit(1);
}
const config = Object.freeze({
  port: inteiroPositivo("PORT", 3001, 65535),
  nodeEnv: process.env.NODE_ENV || "development",
  mpAccessToken: process.env.MP_ACCESS_TOKEN,
  db: Object.freeze({
    host: process.env.DB_HOST,
    port: inteiroPositivo("DB_PORT", 3306, 65535),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    connectionLimit: inteiroPositivo("DB_CONN_LIMIT", 10),
  }),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3001",
  jwtSecret: process.env.JWT_SECRET,
  apiGameSecret: process.env.API_GAME_SECRET,
  googleClientId: process.env.CLIENT_ID_GOOGLE || "",
  telegramUrl: process.env.TELEGRAM_URL || "",
  whatsappUrl: process.env.WHATSAPP_URL || "",
  mpWebhookSecret: process.env.MP_WEBHOOK_SECRET || "",
  mixpanelToken: process.env.MIXPANEL_TOKEN || "",
  adminEmail: process.env.ADMIN_EMAIL || "admin@moedaarena.com",
});
module.exports = config;
