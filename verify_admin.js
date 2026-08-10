const mysql = require('mysql2/promise');
const config = require('./src/config/env');

async function verifyUser() {
  const pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const sql = 'UPDATE usuarios SET email_verificado = 1 WHERE id = 1';
    await pool.query(sql);
    console.error("Admin verificado com sucesso.");
  } catch (error) {
    console.error("Erro:", error);
  } finally {
    await pool.end();
  }
}

verifyUser();
