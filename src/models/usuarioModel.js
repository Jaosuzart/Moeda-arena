
const { pool } = require('./db');
const logger = require('../config/logger');

const crypto = require('crypto');

const criarUsuario = async (nome, email, senhaHash, telefone = null, hasPassword = true) => {
  try {
    const tokenVerificacao = crypto.randomBytes(32).toString('hex');
    const sql = 'INSERT INTO usuarios (nome, email, senha_hash, telefone, token_verificacao, has_password) VALUES (?, ?, ?, ?, ?, ?)';
    const [resultado] = await pool.query(sql, [nome, email, senhaHash, telefone, tokenVerificacao, hasPassword]);

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

const atualizarPerfil = async (id, { nome, cpf, localidade, telefone, chave_pix, cartao_final }) => {
  try {
    const sql = 'UPDATE usuarios SET nome = ?, cpf = ?, localidade = ?, telefone = ?, chave_pix = ?, cartao_final = ? WHERE id = ?';
    const [resultado] = await pool.query(sql, [nome, cpf, localidade, telefone, chave_pix, cartao_final, id]);

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

const salvarTokenResetSenha = async (usuarioId, token, expira) => {
  const sql = 'UPDATE usuarios SET reset_senha_token = ?, reset_senha_expira = ? WHERE id = ?';
  const [resultado] = await pool.query(sql, [token, expira, usuarioId]);
  return resultado.affectedRows > 0;
};

const buscarPorTokenResetSenha = async (token) => {
  const sql = 'SELECT id, nome, email, reset_senha_expira FROM usuarios WHERE reset_senha_token = ?';
  const [rows] = await pool.query(sql, [token]);
  return rows[0] || null;
};

const atualizarSenhaPorReset = async (usuarioId, novaSenhaHash) => {
  const sql = 'UPDATE usuarios SET senha_hash = ?, reset_senha_token = NULL, reset_senha_expira = NULL, has_password = TRUE WHERE id = ?';
  const [resultado] = await pool.query(sql, [novaSenhaHash, usuarioId]);
  return resultado.affectedRows > 0;
};

const obterEstatisticaPlataforma = async () => {
  try {
    const sqlUsuarios = "SELECT COUNT(*) as total_usuarios FROM usuarios WHERE status != 'banido'";
    const sqlTokens = "SELECT COALESCE(SUM(tokens_creditados), 0) as total_tokens FROM pagamentos_processados WHERE status = 'approved'";
    const sqlUltimosPagamentos = `
      SELECT u.nome, p.plano_id, p.tokens_creditados, p.data_processamento 
      FROM pagamentos_processados p 
      JOIN usuarios u ON p.usuario_id = u.id 
      WHERE p.status = 'approved'
      ORDER BY p.data_processamento DESC 
      LIMIT 5
    `;

    const [rowsUsuarios] = await pool.query(sqlUsuarios);
    const [rowsTokens] = await pool.query(sqlTokens);
    const [rowsUltimos] = await pool.query(sqlUltimosPagamentos);

    return {
      totalUsuarios: rowsUsuarios[0]?.total_usuarios || 0,
      totalTokens: rowsTokens[0]?.total_tokens || 0,
      ultimasVendas: rowsUltimos.map(row => ({
        nome: row.nome,
        plano_id: row.plano_id,
        tokens: row.tokens_creditados,
        data: row.data_processamento
      }))
    };
  } catch (err) {
    logger.error('Erro ao obter estatísticas da plataforma:', err);
    throw err;
  }
};

module.exports = { 
  criarUsuario, 
  buscarPorEmail, 
  buscarPorId, 
  adicionarTokens, 
  debitarTokens, 
  atualizarPerfil, 
  buscarRanking, 
  adicionarEstatisticas, 
  listarTodos, 
  atualizarStatus, 
  buscarPorTokenVerificacao, 
  confirmarEmail, 
  definirSenha,
  salvarTokenResetSenha,
  buscarPorTokenResetSenha,
  atualizarSenhaPorReset,
  obterEstatisticaPlataforma
};
