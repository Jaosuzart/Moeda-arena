const mysql = require('mysql2/promise');
const config = require('./src/config/env');

async function updateDb() {
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
    
    // Tentamos adicionar as colunas, ignorando o erro caso elas já existam
    try {
      await pool.query('ALTER TABLE usuarios ADD COLUMN trofeus INT DEFAULT 0');
      console.log('Coluna trofeus adicionada.');
    } catch (e) { console.log('Coluna trofeus possivelmente já existe.'); }

    try {
      await pool.query('ALTER TABLE usuarios ADD COLUMN vitorias INT DEFAULT 0');
      console.log('Coluna vitorias adicionada.');
    } catch (e) { console.log('Coluna vitorias possivelmente já existe.'); }

    try {
      await pool.query('ALTER TABLE usuarios ADD COLUMN xp INT DEFAULT 0');
      console.log('Coluna xp adicionada.');
    } catch (e) { console.log('Coluna xp possivelmente já existe.'); }

    // E também o status do usuário para o painel admin (ex: 'ativo' ou 'banido')
    try {
      await pool.query("ALTER TABLE usuarios ADD COLUMN status VARCHAR(20) DEFAULT 'ativo'");
      console.log('Coluna status adicionada.');
    } catch (e) { console.log('Coluna status possivelmente já existe.'); }

    console.log("Banco de dados atualizado com sucesso!");
  } catch (error) {
    console.error("Erro geral:", error);
  } finally {
    await pool.end();
  }
}

updateDb();
