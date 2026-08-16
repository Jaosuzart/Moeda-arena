const mysql = require('mysql2/promise');
const config = require('./src/config/env');
const logger = require('./src/config/logger');

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
    logger.info("Conectando ao TiDB para atualizar tabela...");
    
    try {
      await pool.query('ALTER TABLE usuarios ADD COLUMN email_verificado BOOLEAN DEFAULT FALSE');
      logger.info('Coluna email_verificado adicionada.');
    } catch (e) { 
      logger.warn('Coluna email_verificado possivelmente já existe.'); 
    }

    try {
      await pool.query('ALTER TABLE usuarios ADD COLUMN token_verificacao VARCHAR(255) DEFAULT NULL');
      logger.info('Coluna token_verificacao adicionada.');
    } catch (e) { 
      logger.warn('Coluna token_verificacao possivelmente já existe.'); 
    }

    logger.info("Banco de dados atualizado com sucesso!");
  } catch (error) {
    logger.error("Erro geral:", error);
  } finally {
    await pool.end();
  }
}

updateDb2();
