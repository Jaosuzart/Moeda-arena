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
    logger.info("Conectando ao banco...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(50) UNIQUE NOT NULL,
        desconto_percentual INT NOT NULL DEFAULT 0,
        comissao_percentual INT NOT NULL DEFAULT 0,
        ativo BOOLEAN DEFAULT TRUE,
        usos INT DEFAULT 0
      );
    `);
    await pool.query(`
      INSERT IGNORE INTO cupons (codigo, desconto_percentual, comissao_percentual) 
      VALUES ('STREAMER10', 10, 10);
    `);
    logger.info("Tabela cupons criada e cupom inserido!");
  } catch (err) {
    logger.error("Erro ao criar cupons:", { erro: err.message });
  } finally {
    await pool.end();
  }
}
run();
