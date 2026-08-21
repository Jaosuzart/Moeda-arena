const { pool } = require("./db");
const logger = require("../config/logger");
const crypto = require("crypto");

const criarUsuario = async (
  nome,
  email,
  senhaHash,
  telefone = null,
  indicadoPor = null,
  hasPassword = true,
) => {
  try {
    const tokenVerificacao = crypto.randomBytes(32).toString("hex");
    const codigoConvite =
      nome.replace(/\s+/g, "").substring(0, 5).toUpperCase() +
      Math.floor(Math.random() * 100000);

    const sql =
      "INSERT INTO usuarios (nome, email, senha_hash, telefone, token_verificacao, has_password, codigo_convite, indicado_por) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    const [resultado] = await pool.query(sql, [
      nome,
      email,
      senhaHash,
      telefone,
      tokenVerificacao,
      hasPassword,
      codigoConvite,
      indicadoPor,
    ]);

    logger.info("Novo usuário criado.", { usuarioId: resultado.insertId, email });

    return {
      id: resultado.insertId,
      nome,
      email,
      saldo_tokens: 100,
      token_verificacao: tokenVerificacao,
    };
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      const error = new Error("Este email já está cadastrado.");
      error.statusCode = 409;
      error.codigo = "EMAIL_DUPLICADO";
      throw error;
    }
    logger.error("Erro ao criar usuário.", { erro: err.message });
    throw err;
  }
};

const buscarPorEmail = async (email) => {
  const sql =
    "SELECT id, nome, email, senha_hash, saldo_tokens, cpf, localidade, chave_pix, cartao_final, trofeus, vitorias, xp, status, email_verificado, token_verificacao, has_password FROM usuarios WHERE email = ?";
  const [rows] = await pool.query(sql, [email]);
  return rows[0] || null;
};

const buscarPorId = async (id) => {
  const sql =
    "SELECT id, nome, email, saldo_tokens, cpf, localidade, telefone, chave_pix, cartao_final, trofeus, vitorias, xp, status, email_verificado, has_password, codigo_convite, ganhos_afiliado FROM usuarios WHERE id = ?";
  const [rows] = await pool.query(sql, [id]);
  return rows[0] || null;
};

const buscarPorTokenVerificacao = async (token) => {
  const sql = "SELECT id FROM usuarios WHERE token_verificacao = ?";
  const [rows] = await pool.query(sql, [token]);
  return rows[0] || null;
};

const buscarPorCodigoConvite = async (codigo) => {
  try {
    const [rows] = await pool.query(
      "SELECT id FROM usuarios WHERE codigo_convite = ?",
      [codigo],
    );
    return rows[0] || null;
  } catch (err) {
    logger.error("Erro ao buscar usuário por código de convite.", { erro: err.message });
    throw err;
  }
};

const confirmarEmail = async (id) => {
  const sql =
    "UPDATE usuarios SET email_verificado = 1, token_verificacao = NULL WHERE id = ?";
  const [resultado] = await pool.query(sql, [id]);
  return resultado.affectedRows > 0;
};

const buscarRanking = async (limite = 10) => {
  const sql =
    "SELECT id, nome, trofeus, vitorias, xp FROM usuarios WHERE status != 'banido' ORDER BY trofeus DESC, vitorias DESC, xp DESC LIMIT ?";
  const [rows] = await pool.query(sql, [limite]);
  return rows;
};

const adicionarEstatisticas = async (id, trofeus, vitorias, xp) => {
  const sql =
    "UPDATE usuarios SET trofeus = trofeus + ?, vitorias = vitorias + ?, xp = xp + ? WHERE id = ?";
  const [resultado] = await pool.query(sql, [trofeus, vitorias, xp, id]);
  return resultado.affectedRows > 0;
};

const listarTodos = async () => {
  const sql =
    "SELECT id, nome, email, saldo_tokens, trofeus, vitorias, xp, status, ganhos_afiliado FROM usuarios ORDER BY id DESC";
  const [rows] = await pool.query(sql);
  return rows;
};

const atualizarStatus = async (id, status) => {
  const sql = "UPDATE usuarios SET status = ? WHERE id = ?";
  const [resultado] = await pool.query(sql, [status, id]);
  return resultado.affectedRows > 0;
};

const definirSenha = async (id, senhaHash) => {
  const sql =
    "UPDATE usuarios SET senha_hash = ?, has_password = TRUE WHERE id = ?";
  const [resultado] = await pool.query(sql, [senhaHash, id]);
  return resultado.affectedRows > 0;
};

const adicionarTokens = async (usuarioId, quantidade) => {
  try {
    const sql =
      "UPDATE usuarios SET saldo_tokens = saldo_tokens + ? WHERE id = ?";
    const [resultado] = await pool.query(sql, [quantidade, usuarioId]);
    if (resultado.affectedRows > 0) {
      logger.info("Tokens creditados com sucesso.", { usuarioId, quantidade });
      return true;
    }
    logger.warn("Nenhum usuário encontrado para creditar tokens.", { usuarioId });
    return false;
  } catch (err) {
    logger.error("Erro ao adicionar tokens.", { usuarioId, quantidade, erro: err.message });
    throw err;
  }
};

const debitarTokens = async (id, quantidade) => {
  try {
    const sql =
      "UPDATE usuarios SET saldo_tokens = saldo_tokens - ? WHERE id = ? AND saldo_tokens >= ?";
    const [resultado] = await pool.execute(sql, [quantidade, id, quantidade]);
    return resultado.affectedRows > 0;
  } catch (err) {
    logger.error("Erro ao debitar tokens.", { usuarioId: id, erro: err.message });
    throw err;
  }
};

const atualizarPerfil = async (
  id,
  { nome, cpf, localidade, telefone, chave_pix, cartao_final },
) => {
  try {
    const sql =
      "UPDATE usuarios SET nome = ?, cpf = ?, localidade = ?, telefone = ?, chave_pix = ?, cartao_final = ? WHERE id = ?";
    const [resultado] = await pool.query(sql, [
      nome,
      cpf,
      localidade,
      telefone,
      chave_pix,
      cartao_final,
      id,
    ]);
    if (resultado.affectedRows > 0) {
      logger.info("Perfil atualizado.", { usuarioId: id });
      return true;
    }
    return false;
  } catch (err) {
    logger.error("Erro ao atualizar perfil.", { usuarioId: id, erro: err.message });
    throw err;
  }
};

const salvarTokenResetSenha = async (usuarioId, token, expira) => {
  const sql =
    "UPDATE usuarios SET reset_senha_token = ?, reset_senha_expira = ? WHERE id = ?";
  const [resultado] = await pool.query(sql, [token, expira, usuarioId]);
  return resultado.affectedRows > 0;
};

const buscarPorTokenResetSenha = async (token) => {
  const sql =
    "SELECT id, nome, email, reset_senha_expira FROM usuarios WHERE reset_senha_token = ?";
  const [rows] = await pool.query(sql, [token]);
  return rows[0] || null;
};

const atualizarSenhaPorReset = async (usuarioId, novaSenhaHash) => {
  const sql =
    "UPDATE usuarios SET senha_hash = ?, reset_senha_token = NULL, reset_senha_expira = NULL, has_password = TRUE WHERE id = ?";
  const [resultado] = await pool.query(sql, [novaSenhaHash, usuarioId]);
  return resultado.affectedRows > 0;
};

const obterEstatisticaPlataforma = async () => {
  try {
    const sqlTotais =
      "SELECT COUNT(id) AS totalUsuarios, COALESCE(SUM(saldo_tokens), 0) AS totalTokens FROM usuarios";
    const [totaisRows] = await pool.query(sqlTotais);

    const sqlUltimas = `
      SELECT p.data_processamento AS data, u.nome, p.plano_id, p.tokens_creditados AS tokens
      FROM pagamentos_processados p
      JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.id DESC
      LIMIT 10
    `;
    const [ultimasRows] = await pool.query(sqlUltimas);

    return {
      totalUsuarios: totaisRows[0].totalUsuarios,
      totalTokens: Number(totaisRows[0].totalTokens),
      ultimasVendas: ultimasRows,
    };
  } catch (err) {
    logger.error("Erro ao obter estatísticas da plataforma.", { erro: err.message });
    throw err;
  }
};

module.exports = {
  criarUsuario,
  buscarPorEmail,
  buscarPorId,
  buscarPorCodigoConvite,
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
  obterEstatisticaPlataforma,
};
