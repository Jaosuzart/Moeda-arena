const { pool } = require("#database");

const jaProcessado = async (
  paymentId,
  executor = pool,
) => {
  const [rows] = await executor.query(
    `
      SELECT id
      FROM pagamentos_processados
      WHERE payment_id = ?
    `,
    [String(paymentId)],
  );

  return rows.length > 0;
};

const registrarPagamento = async (
  paymentId,
  usuarioId,
  planoId,
  moedas,
  valor,
  status,
  executor = pool,
) => {
  await executor.query(
    `
      INSERT INTO pagamentos_processados
      (
        payment_id,
        usuario_id,
        plano_id,
        moedas_creditadas,
        valor_pago,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      String(paymentId),
      usuarioId,
      planoId,
      moedas,
      valor,
      status,
    ],
  );
};

module.exports = {
  jaProcessado,
  registrarPagamento,
};