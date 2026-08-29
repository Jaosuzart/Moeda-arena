const { pool } = require("./db");

const jaProcessado = async (paymentId) => {
  const [rows] = await pool.query("SELECT id FROM pagamentos_processados WHERE payment_id = ?", [String(paymentId)]);
  return rows.length > 0;
};

const registrarPagamento = async (paymentId, usuarioId, planoId, moedas, valor, status) => {
  await pool.query(
    "INSERT INTO pagamentos_processados (payment_id, usuario_id, plano_id, moedas_creditadas, valor_pago, status) VALUES (?, ?, ?, ?, ?, ?)",
    [String(paymentId), usuarioId, planoId, moedas, valor, status],
  );
};

module.exports = {
  jaProcessado,
  registrarPagamento,
};
