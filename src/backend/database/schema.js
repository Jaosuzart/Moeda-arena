async function checkPaymentSchema(executor) {
  const [tables] = await executor.query(
    "SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('usuarios','cupons','pagamentos_processados','pagamento_saldos')",
  );
  if (tables.length !== 4 || tables.some((table) => table.ENGINE?.toLowerCase() !== "innodb")) {
    throw new Error("Esquema de pagamentos ausente ou sem InnoDB. Execute npm run db:setup (banco novo) ou npm run db:migrate (banco existente).");
  }
  const [columns] = await executor.query("SHOW COLUMNS FROM usuarios WHERE Field IN ('saldo_moedas', 'ganhos_afiliado')");
  if (columns.length !== 2 || columns.some((column) => /unsigned/i.test(column.Type) || !/^(bigint|int)\b/i.test(column.Type))) {
    throw new Error("Saldos devem aceitar ajustes negativos de estorno. Execute npm run db:migrate.");
  }
  const [indexes] = await executor.query("SHOW INDEX FROM pagamentos_processados");
  const unique = indexes.filter((index) => !Number(index.Non_unique));
  const grouped = new Map();
  for (const index of unique) grouped.set(index.Key_name, [...(grouped.get(index.Key_name) || []), index.Column_name]);
  if (![...grouped.values()].some((fields) => fields.length === 1 && fields[0] === "payment_id")) {
    throw new Error("payment_id precisa de índice único para impedir créditos duplicados.");
  }
}
module.exports = { checkPaymentSchema };
