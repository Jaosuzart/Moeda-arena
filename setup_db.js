const mysql = require('mysql2/promise');
const config = require('./src/config/env');
const logger = require('./src/config/logger');

async function run() {
  const pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port,
    ssl: { rejectUnauthorized: false }
  });

  try {
    logger.info('Conectando ao banco de dados...');
    
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    
    await pool.query('DROP TABLE IF EXISTS usuarios');
    logger.info('Tabela antiga removida.');

    const createUsuariosSQL = `
      CREATE TABLE usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        senha_hash VARCHAR(255) DEFAULT NULL,
        google_id VARCHAR(100) UNIQUE DEFAULT NULL,
        avatar VARCHAR(255) DEFAULT NULL,
        saldo_tokens INT DEFAULT 0,
        tipo_plano VARCHAR(50) DEFAULT 'gratis',
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
        cpf VARCHAR(20) DEFAULT NULL,
        chave_pix VARCHAR(100) DEFAULT NULL,
        localidade VARCHAR(100) DEFAULT NULL,
        telefone VARCHAR(30) DEFAULT NULL,
        cartao_final VARCHAR(10) DEFAULT NULL,
        cartao_bandeira VARCHAR(50) DEFAULT NULL,
        metodo_pagamento_padrao VARCHAR(50) DEFAULT NULL,
        trofeus INT DEFAULT 0,
        vitorias INT DEFAULT 0,
        xp INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'ativo',
        has_password BOOLEAN DEFAULT TRUE,
        email_verificado BOOLEAN DEFAULT FALSE,
        token_verificacao VARCHAR(255) DEFAULT NULL
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `;
    await pool.query(createUsuariosSQL);
    logger.info('Tabela usuarios criada com sucesso.');

    const insertUsersSQL = `
      INSERT INTO usuarios (nome, email, senha_hash, saldo_tokens, tipo_plano, cpf, cartao_final, has_password) 
      VALUES 
      ('João Marcelo (Admin)', 'joaomarcelosuzartcastro@gmail.com', '$2b$10$amw7b4GqsyOqvRYBwrvg3egANcOSqfgkJLW4r6QaEpM2Fqjsi87lm', 10000, 'vip', '00000000000', '0000', FALSE),
      ('Jogador Teste', 'jogador@teste.com', '$2b$10$amw7b4GqsyOqvRYBwrvg3egANcOSqfgkJLW4r6QaEpM2Fqjsi87lm', 500, 'free', '11122233344', '1234', TRUE);
    `;
    await pool.query(insertUsersSQL);
    logger.info('Usuários de teste inseridos.');

    const createPagamentosSQL = `
      CREATE TABLE IF NOT EXISTS pagamentos_processados (
        id INT AUTO_INCREMENT PRIMARY KEY,
        payment_id VARCHAR(100) UNIQUE NOT NULL,
        usuario_id INT NOT NULL,
        plano_id VARCHAR(50) NOT NULL,
        tokens_creditados INT NOT NULL,
        valor_pago DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        data_processamento DATETIME DEFAULT CURRENT_TIMESTAMP
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `;
    await pool.query(createPagamentosSQL);
    logger.info('Tabela pagamentos_processados verificada/criada.');

    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    logger.info('Tudo configurado com sucesso!');

  } catch (err) {
    logger.error('Erro ao configurar banco de dados:', { erro: err.message, stack: err.stack });
  } finally {
    await pool.end();
  }
}

run();
