
const { pool } = require('./db');

const buscarPorCodigo = async (codigo) => {
  const sql = 'SELECT * FROM cupons WHERE codigo = ? AND ativo = TRUE';
  const [rows] = await pool.query(sql, [codigo.toUpperCase().trim()]);
  return rows.length > 0 ? rows[0] : null;
};

const incrementarUso = async (codigo) => {
  const sql = 'UPDATE cupons SET usos = usos + 1 WHERE codigo = ? AND ativo = TRUE';
  const [result] = await pool.query(sql, [codigo.toUpperCase().trim()]);
  return result.affectedRows > 0;
};

module.exports = { buscarPorCodigo, incrementarUso };
