const { pool } = require('./src/models/db');

async function runMigration() {
  try {
    console.log('Iniciando migração do banco de dados...');
    
    try {
      await pool.query("ALTER TABLE usuarios ADD COLUMN cpf VARCHAR(14) DEFAULT NULL");
      console.log('Coluna CPF adicionada.');
    } catch (e) { console.log('CPF: ' + e.message); }

    try {
      await pool.query("ALTER TABLE usuarios ADD COLUMN localidade VARCHAR(255) DEFAULT NULL");
      console.log('Coluna localidade adicionada.');
    } catch (e) { console.log('Localidade: ' + e.message); }
    
    try {
      await pool.query("ALTER TABLE usuarios ADD COLUMN cartao_final VARCHAR(4) DEFAULT NULL");
      console.log('Coluna cartao_final adicionada.');
    } catch (e) { console.log('Cartao: ' + e.message); }
    
    console.log('Migração concluída com sucesso!');
  } catch (err) {
    console.error('Erro geral na migração:', err);
  } finally {
    process.exit(0);
  }
}

runMigration();
