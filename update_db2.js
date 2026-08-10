const mysql = require('mysql2/promise');
const config = require('./src/config/env');

async function updateDb2() {
  const pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Conectando ao TiDB para atualizar tabela...");
    
    try {
      await pool.query('ALTER TABLE usuarios ADD COLUMN email_verificado BOOLEAN DEFAULT FALSE');
      console.log('Coluna email_verificado adicionada.');
    } catch (e) { console.error('Coluna email_verificado possivelmente já existe.'); }

    try {
      await pool.query('ALTER TABLE usuarios ADD COLUMN token_verificacao VARCHAR(255) DEFAULT NULL');
      console.log('Coluna token_verificacao adicionada.');
    } catch (e) { console.error('Coluna token_verificacao possivelmente já existe.'); }

    console.log("Banco de dados atualizado com sucesso!");
  } catch (error) {
    console.error("Erro geral:", error);
  } finally {
    await pool.end();
  }
}

updateDb2();
