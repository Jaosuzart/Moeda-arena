const mysql = require("mysql2/promise");
const config = require("./src/config/env");
const logger = require("./src/config/logger");
async function run() {
  const pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port,
    ssl: { rejectUnauthorized: false },
  });
  try {
    logger.info(
      "Conectando ao banco de dados para adicionar colunas de reset de senha...",
    );
    try {
      await pool.query(
        "ALTER TABLE usuarios ADD COLUMN reset_senha_token VARCHAR(255) DEFAULT NULL",
      );
      logger.info("Coluna reset_senha_token adicionada.");
    } catch (e) {
      logger.warn(
        "Coluna reset_senha_token possivelmente já existe: " + e.message,
      );
    }
    try {
      await pool.query(
        "ALTER TABLE usuarios ADD COLUMN reset_senha_expira DATETIME DEFAULT NULL",
      );
      logger.info("Coluna reset_senha_expira adicionada.");
    } catch (e) {
      logger.warn(
        "Coluna reset_senha_expira possivelmente já existe: " + e.message,
      );
    }
    logger.info("Migração concluída com sucesso!");
  } catch (error) {
    logger.error("Erro geral na migração:", error);
  } finally {
    await pool.end();
  }
}
run();
