const { pool } = require('./src/models/db');
const logger = require('./src/config/logger');

async function runMigration() {
  try {
    logger.info('Iniciando migração do banco de dados...');

    try {
      await pool.query("ALTER TABLE usuarios ADD COLUMN cpf VARCHAR(14) DEFAULT NULL");
      logger.info('Coluna CPF adicionada.');
    } catch (e) { 
      logger.warn('CPF: ' + e.message); 
    }

    try {
      await pool.query("ALTER TABLE usuarios ADD COLUMN localidade VARCHAR(255) DEFAULT NULL");
      logger.info('Coluna localidade adicionada.');
    } catch (e) { 
      logger.warn('Localidade: ' + e.message); 
    }

    try {
      await pool.query("ALTER TABLE usuarios ADD COLUMN cartao_final VARCHAR(4) DEFAULT NULL");
      logger.info('Coluna cartao_final adicionada.');
    } catch (e) { 
      logger.warn('Cartao: ' + e.message); 
    }

    logger.info('Migração concluída com sucesso!');
  } catch (err) {
    logger.error('Erro geral na migração:', err);
  } finally {
    process.exit(0);
  }
}

runMigration();
