const mysql = require("mysql2/promise");
const config = require("../config/env");
const logger = require("../config/logger");
const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  ssl: {
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: config.db.connectionLimit,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});
const testarConexao = async () => {
  try {
    const conexao = await pool.getConnection();
    await conexao.query("SELECT 1");
    conexao.release();
    logger.info("Conexão com o banco de dados estabelecida.", {
      host: config.db.host,
      database: config.db.database,
    });
    return true;
  } catch (err) {
    logger.error("Falha ao conectar com o banco de dados.", {
      host: config.db.host,
      database: config.db.database,
      erro: err.message,
      codigo: err.code,
    });
    throw err;
  }
};
const encerrarPool = async () => {
  try {
    await pool.end();
    logger.info("Pool de conexões com o banco encerrado.");
  } catch (err) {
    logger.error("Erro ao encerrar pool de conexões:", { erro: err.message });
  }
};
module.exports = { pool, testarConexao, encerrarPool };
