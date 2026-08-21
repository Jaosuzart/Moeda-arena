const mysql = require("mysql2/promise");
const config = require("./src/config/env");
const logger = require("./src/config/logger");
async function updateDb() {
  const pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port,
    ssl: { rejectUnauthorized: false },
  });
  try {
    logger.info("Conectando ao TiDB para atualizar tabela...");
    try {
      await pool.query("ALTER TABLE usuarios ADD COLUMN trofeus INT DEFAULT 0");
      logger.info("Coluna trofeus adicionada.");
    } catch (e) {
      logger.warn("Coluna trofeus possivelmente já existe.");
    }
    try {
      await pool.query(
        "ALTER TABLE usuarios ADD COLUMN vitorias INT DEFAULT 0",
      );
      logger.info("Coluna vitorias adicionada.");
    } catch (e) {
      logger.warn("Coluna vitorias possivelmente já existe.");
    }
    try {
      await pool.query("ALTER TABLE usuarios ADD COLUMN xp INT DEFAULT 0");
      logger.info("Coluna xp adicionada.");
    } catch (e) {
      logger.warn("Coluna xp possivelmente já existe.");
    }
    try {
      await pool.query(
        "ALTER TABLE usuarios ADD COLUMN status VARCHAR(20) DEFAULT 'ativo'",
      );
      logger.info("Coluna status adicionada.");
    } catch (e) {
      logger.warn("Coluna status possivelmente já existe.");
    }
    logger.info("Banco de dados atualizado com sucesso!");
  } catch (error) {
    logger.error("Erro geral:", error);
  } finally {
    await pool.end();
  }
}
updateDb();
