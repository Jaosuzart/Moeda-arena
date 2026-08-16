/**
 * @module config/env
 * @description Carrega e valida as variáveis de ambiente.
 *              Se alguma variável obrigatória estiver faltando, o servidor não sobe (fail-fast).
 */
require('dotenv').config();

const variaveisObrigatorias = [
  'PORT',
  'MP_ACCESS_TOKEN',
  'DB_HOST',
  'DB_USER',
  'DB_NAME',
  'JWT_SECRET',
  'API_GAME_SECRET'
];

const faltando = variaveisObrigatorias.filter(v => !process.env[v]);

if (faltando.length > 0) {
  process.stderr.write(`[FATAL] Variáveis de ambiente obrigatórias não definidas: ${faltando.join(', ')}\n`);
  process.stderr.write('[FATAL] Crie um arquivo .env na raiz do projeto. Use .env.example como referência.\n');
  process.exit(1);
}

/**
 * @readonly
 */
const config = Object.freeze({
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  mpAccessToken: process.env.MP_ACCESS_TOKEN,
  db: Object.freeze({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    connectionLimit: parseInt(process.env.DB_CONN_LIMIT, 10) || 10
  }),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  jwtSecret: process.env.JWT_SECRET,
  apiGameSecret: process.env.API_GAME_SECRET,
  googleClientId: process.env.CLIENT_ID_GOOGLE || '',
  adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'admin@tokenarena.com'
});

module.exports = config;
