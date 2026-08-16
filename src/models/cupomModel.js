/**
 * @module models/cupomModel
 * @description 
 */
const { pool } = require('./db');

/**
 * @param {string} codigo 
 * @returns {Promise<Object|null>} 
 */
const buscarPorCodigo = async (codigo) => {
  const sql = 'SELECT * FROM cupons WHERE codigo = ? AND ativo = TRUE';
  const [rows] = await pool.query(sql, [codigo.toUpperCase().trim()]);
  return rows.length > 0 ? rows[0] : null;
};

/**
 * @param {string} codigo 
 * @returns {Promise<boolean>} 
 */
const incrementarUso = async (codigo) => {
  const sql = 'UPDATE cupons SET usos = usos + 1 WHERE codigo = ? AND ativo = TRUE';
  const [result] = await pool.query(sql, [codigo.toUpperCase().trim()]);
  return result.affectedRows > 0;
};

module.exports = { buscarPorCodigo, incrementarUso };
