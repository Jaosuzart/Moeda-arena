const { pool } = require("./db");

const jaProcessado = async (paymentId) => {
  const [rows] = await pool.query(
    "SELECT id FROM pagamentos_processados WHERE payment_id = ?",
    [String(paymentId)],
  );
  return rows.length > 0;
};

const registrarPagamento = async (paymentId, usuarioId, planoId, tokens, valor, status) => {
  await pool.query(
    "INSERT INTO pagamentos_processados (payment_id, usuario_id, plano_id, tokens_creditados, valor_pago, status) VALUES (?, ?, ?, ?, ?, ?)",
    [String(paymentId), usuarioId, planoId, tokens, valor, status],
  );
};

module.exports = {
  jaProcessado,
  registrarPagamento,
};
