const mysql = require("mysql2/promise");
const config = require("./src/config/env");
const logger = require("./src/config/logger");
async function verifyUser() {
  const pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port,
    ssl: { rejectUnauthorized: false },
  });
  try {
    const sql = "UPDATE usuarios SET email_verificado = 1 WHERE id = 1";
    await pool.query(sql);
    logger.info("Admin verificado com sucesso.");
  } catch (err) {
    logger.error("Erro ao verificar admin:", { erro: err.message });
  } finally {
    await pool.end();
  }
}
verifyUser();
