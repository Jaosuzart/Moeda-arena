/**
 * @module models/usuarioModel
 * @description
 */
const { pool } = require('./db');
const logger = require('../config/logger');

/**
 * Cria um novo usuário no banco de dados.
 * @param {string} nome - Nome do usuário.
 * @param {string} email - Email único do usuário.
 * @param {string} senhaHash - Hash bcrypt da senha.
 * @returns {Promise<Object>} O usuário criado (sem senha).
 * @throws {Error} Se o email já existir (código: EMAIL_DUPLICADO).
 */
const criarUsuario = async (nome, email, senhaHash) => {
  try {
    const sql = 'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)';
    const [resultado] = await pool.query(sql, [nome, email, senhaHash]);

    logger.info('Novo usuário criado.', { usuarioId: resultado.insertId, email });

    return {
      id: resultado.insertId,
      nome,
      email,
      saldo_tokens: 100  // Valor padrão definido no schema SQL
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

/**
 * Busca um usuário pelo email (inclui senha_hash para login).
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
const buscarPorEmail = async (email) => {
  const sql = 'SELECT id, nome, email, senha_hash, saldo_tokens, cpf, localidade, chave_pix, cartao_final, trofeus, vitorias, xp, status FROM usuarios WHERE email = ?';
  const [rows] = await pool.query(sql, [email]);
  return rows[0] || null;
};

/**
 * Busca um usuário pelo ID (sem senha_hash).
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
const buscarPorId = async (id) => {
  const sql = 'SELECT id, nome, email, saldo_tokens, cpf, localidade, chave_pix, cartao_final, trofeus, vitorias, xp, status FROM usuarios WHERE id = ?';
  const [rows] = await pool.query(sql, [id]);
  return rows[0] || null;
};

/**
 * Busca o Top N jogadores ordenado por troféus, vitórias e XP.
 * @param {number} limite 
 */
const buscarRanking = async (limite = 10) => {
  const sql = 'SELECT id, nome, trofeus, vitorias, xp FROM usuarios WHERE status != "banido" ORDER BY trofeus DESC, vitorias DESC, xp DESC LIMIT ?';
  const [rows] = await pool.query(sql, [limite]);
  return rows;
};

/**
 * Atualiza as estatísticas do jogo de um usuário.
 */
const adicionarEstatisticas = async (id, trofeus, vitorias, xp) => {
  const sql = 'UPDATE usuarios SET trofeus = trofeus + ?, vitorias = vitorias + ?, xp = xp + ? WHERE id = ?';
  const [resultado] = await pool.query(sql, [trofeus, vitorias, xp, id]);
  return resultado.affectedRows > 0;
};

/**
 * Lista todos os usuários (para o Admin).
 */
const listarTodos = async () => {
  const sql = 'SELECT id, nome, email, saldo_tokens, trofeus, vitorias, xp, status FROM usuarios ORDER BY id DESC';
  const [rows] = await pool.query(sql);
  return rows;
};

/**
 * Atualiza o status (banir/desbanir) de um usuário.
 */
const atualizarStatus = async (id, status) => {
  const sql = 'UPDATE usuarios SET status = ? WHERE id = ?';
  const [resultado] = await pool.query(sql, [status, id]);
  return resultado.affectedRows > 0;
};

/**
 * @param {number} usuarioId - ID do usuário.
 * @param {number} quantidade - Quantidade de tokens a creditar.
 * @returns {Promise<boolean>} true se o update afetou uma linha.
 */
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

/**
 * Atualiza o perfil do usuário (nome, cpf, localidade, cartao).
 * @param {number} id
 * @param {Object} dados
 * @returns {Promise<boolean>}
 */
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

module.exports = { criarUsuario, buscarPorEmail, buscarPorId, adicionarTokens, debitarTokens, atualizarPerfil, buscarRanking, adicionarEstatisticas, listarTodos, atualizarStatus };
