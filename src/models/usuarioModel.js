
const { pool } = require('./db');
const logger = require('../config/logger');

const crypto = require('crypto');

const criarUsuario = async (nome, email, senhaHash, hasPassword = true) => {
  try {
    const tokenVerificacao = crypto.randomBytes(32).toString('hex');
    const sql = 'INSERT INTO usuarios (nome, email, senha_hash, token_verificacao, has_password) VALUES (?, ?, ?, ?, ?)';
    const [resultado] = await pool.query(sql, [nome, email, senhaHash, tokenVerificacao, hasPassword]);

    logger.info('Novo usuário criado.', { usuarioId: resultado.insertId, email });

    return {
      id: resultado.insertId,
      nome,
      email,
      saldo_tokens: 100,
      token_verificacao: tokenVerificacao
    };
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const error = new Error('Este email já está cadastrado.');
      error.statusCode = 409;
      error.codigo = 'EMAIL_DUPLICADO';
      throw error;
    }
    logger.error('Erro ao criar usuário:', { erro: err.message });
    throw err;
  }
};

const buscarPorEmail = async (email) => {
  const sql = 'SELECT id, nome, email, senha_hash, saldo_tokens, cpf, localidade, chave_pix, cartao_final, trofeus, vitorias, xp, status, email_verificado, token_verificacao, has_password FROM usuarios WHERE email = ?';
  const [rows] = await pool.query(sql, [email]);
  return rows[0] || null;
};

const buscarPorId = async (id) => {
  const sql = 'SELECT id, nome, email, saldo_tokens, cpf, localidade, chave_pix, cartao_final, trofeus, vitorias, xp, status, email_verificado, has_password FROM usuarios WHERE id = ?';
  const [rows] = await pool.query(sql, [id]);
  return rows[0] || null;
};

const buscarPorTokenVerificacao = async (token) => {
  const sql = 'SELECT id FROM usuarios WHERE token_verificacao = ?';
  const [rows] = await pool.query(sql, [token]);
  return rows[0] || null;
};

const confirmarEmail = async (id) => {
  const sql = 'UPDATE usuarios SET email_verificado = 1, token_verificacao = NULL WHERE id = ?';
  const [resultado] = await pool.query(sql, [id]);
  return resultado.affectedRows > 0;
};

const buscarRanking = async (limite = 10) => {
  const sql = "SELECT id, nome, trofeus, vitorias, xp FROM usuarios WHERE status != 'banido' ORDER BY trofeus DESC, vitorias DESC, xp DESC LIMIT ?";
  const [rows] = await pool.query(sql, [limite]);
  return rows;
};
const adicionarEstatisticas = async (id, trofeus, vitorias, xp) => {
  const sql = 'UPDATE usuarios SET trofeus = trofeus + ?, vitorias = vitorias + ?, xp = xp + ? WHERE id = ?';
  const [resultado] = await pool.query(sql, [trofeus, vitorias, xp, id]);
  return resultado.affectedRows > 0;
};

const listarTodos = async () => {
  const sql = 'SELECT id, nome, email, saldo_tokens, trofeus, vitorias, xp, status FROM usuarios ORDER BY id DESC';
  const [rows] = await pool.query(sql);
  return rows;
};
const atualizarStatus = async (id, status) => {
  const sql = 'UPDATE usuarios SET status = ? WHERE id = ?';
  const [resultado] = await pool.query(sql, [status, id]);
  return resultado.affectedRows > 0;
};

const definirSenha = async (id, senhaHash) => {
  const sql = 'UPDATE usuarios SET senha_hash = ?, has_password = TRUE WHERE id = ?';
  const [resultado] = await pool.query(sql, [senhaHash, id]);
  return resultado.affectedRows > 0;
};

const adicionarTokens = async (usuarioId, quantidade) => {
  try {
    const sql = 'UPDATE usuarios SET saldo_tokens = saldo_tokens + ? WHERE id = ?';
    const [resultado] = await pool.query(sql, [quantidade, usuarioId]);

    if (resultado.affectedRows > 0) {
      logger.info('Tokens creditados com sucesso.', { usuarioId, quantidade });
      return true;
    }

    logger.warn('Nenhum usuário encontrado para creditar tokens.', { usuarioId });
    return false;
  } catch (err) {
    logger.error('Erro ao adicionar tokens:', { usuarioId, quantidade, erro: err.message });
    throw err;
  }
};

const atualizarPerfil = async (id, { nome, cpf, localidade, chave_pix, cartao_final }) => {
  try {
    const sql = 'UPDATE usuarios SET nome = ?, cpf = ?, localidade = ?, chave_pix = ?, cartao_final = ? WHERE id = ?';
    const [resultado] = await pool.query(sql, [nome, cpf, localidade, chave_pix, cartao_final, id]);
    
    if (resultado.affectedRows > 0) {
      logger.info('Perfil de usuário atualizado com sucesso.', { usuarioId: id });
      return true;
    }
    return false;
  } catch (err) {
    logger.error('Erro ao atualizar perfil do usuário:', { usuarioId: id, erro: err.message });
    throw err;
  }
};
const debitarTokens = async (id, quantidade) => {
  try {
    const query = 'UPDATE usuarios SET saldo_tokens = saldo_tokens - ? WHERE id = ? AND saldo_tokens >= ?';
    const [result] = await pool.execute(query, [quantidade, id, quantidade]);
    return result.affectedRows > 0;
  } catch (error) {
    logger.error('Erro ao debitar tokens no banco de dados:', error);
    throw error;
  }
};
module.exports = { criarUsuario, buscarPorEmail, buscarPorId, adicionarTokens, debitarTokens, atualizarPerfil, buscarRanking, adicionarEstatisticas, listarTodos, atualizarStatus, buscarPorTokenVerificacao, confirmarEmail, definirSenha };
