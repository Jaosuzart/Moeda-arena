const mysql = require('mysql2/promise');
const config = require('./src/config/env');
const logger = require('./src/config/logger');

async function test() {
  const pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const [rows] = await pool.query('DESCRIBE usuarios');
    logger.info('Colunas da tabela usuarios:', { colunas: rows });
  } catch (err) {
    logger.error('Erro ao consultar schema:', { erro: err.message });
  } finally {
    await pool.end();
    process.exit(0);
  }
}
test();
