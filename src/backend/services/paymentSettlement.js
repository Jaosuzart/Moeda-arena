const { pool } = require("../database/db");
const { settlementTarget } = require("../domain/paymentAmounts");

// A chave primária serializa notificações do mesmo pagamento. Todas as alterações
// de saldo, comissão e cupom são confirmadas ou desfeitas na mesma transação.
async function settlePayment(payment, reference, plan) {
  const paymentId = String(payment.id);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      `INSERT INTO pagamento_saldos
        (payment_id, usuario_id, plano_id, moedas_originais, valor_centavos, cupom)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE payment_id = payment_id`,
      [paymentId, reference.usuarioId, reference.planoId, reference.moedas ?? plan.moedas,
        reference.valorCentavos, reference.cupom || null],
    );
    const [rows] = await connection.query("SELECT * FROM pagamento_saldos WHERE payment_id = ? FOR UPDATE", [paymentId]);
    const record = rows[0];
    if (Number(record.usuario_id) !== reference.usuarioId || record.plano_id !== reference.planoId || Number(record.valor_centavos) !== reference.valorCentavos) {
      throw new Error("Referência incompatível com pagamento registrado.");
    }
    const [processed] = await connection.query("SELECT id FROM pagamentos_processados WHERE payment_id = ?", [paymentId]);
    if (record.status === "new" && processed.length) {
      // O código anterior não persistia o destinatário da comissão. Não inventar
      // um saldo inicial nem repetir créditos de pagamentos anteriores à migração.
      throw Object.assign(new Error("Pagamento legado requer reconciliação manual antes de ajuste."), { code: "PAGAMENTO_LEGADO" });
    }
    const updatedAt = new Date(payment.date_last_updated || payment.date_created).getTime();
    if (!Number.isFinite(updatedAt)) throw new Error("Data de atualização do pagamento inválida.");
    if (record.provider_updated_ms && updatedAt < Number(record.provider_updated_ms)) {
      await connection.commit();
      return { changed: false, stale: true };
    }
    const target = settlementTarget(payment, {
      valorCentavos: Number(record.valor_centavos), moedas: Number(record.moedas_originais),
      reembolsoCentavos: Number(record.reembolso_centavos),
    });
    if (!target) {
      await connection.commit();
      return { changed: false };
    }
    // Capture o indicador somente no primeiro crédito e mantenha o mesmo em estornos.
    let affiliateId = record.afiliado_id;
    if (!record.cupom_contabilizado && target.coins > 0) {
      const [buyer] = await connection.query("SELECT indicado_por FROM usuarios WHERE id = ?", [reference.usuarioId]);
      if (!buyer.length) throw new Error("Comprador não encontrado.");
      affiliateId = buyer[0].indicado_por;
      if (Number(affiliateId) === reference.usuarioId) affiliateId = null;
    }
    const userIds = [...new Set([reference.usuarioId, affiliateId].filter(Boolean).map(Number))].sort((a, b) => a - b);
    for (const userId of userIds) {
      const [users] = await connection.query("SELECT id FROM usuarios WHERE id = ? FOR UPDATE", [userId]);
      if (!users.length) throw new Error("Usuário do pagamento não encontrado.");
    }
    const coinDelta = target.coins - Number(record.moedas_liquidas);
    const commission = affiliateId ? target.commission : 0;
    const commissionDelta = commission - Number(record.comissao_liquida);
    if (coinDelta) await connection.query("UPDATE usuarios SET saldo_moedas = saldo_moedas + ? WHERE id = ?", [coinDelta, reference.usuarioId]);
    if (commissionDelta) await connection.query(
      "UPDATE usuarios SET saldo_moedas = saldo_moedas + ?, ganhos_afiliado = ganhos_afiliado + ? WHERE id = ?",
      [commissionDelta, commissionDelta, affiliateId],
    );
    const firstCredit = !record.cupom_contabilizado && target.coins > 0;
    if (firstCredit && record.cupom) await connection.query("UPDATE cupons SET usos = usos + 1 WHERE codigo = ?", [record.cupom]);
    if (!processed.length) await connection.query(
      `INSERT INTO pagamentos_processados (payment_id, usuario_id, plano_id, moedas_creditadas, valor_pago, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [paymentId, reference.usuarioId, reference.planoId, target.coins, reference.valorCentavos / 100, payment.status],
    );
    else await connection.query("UPDATE pagamentos_processados SET status = ?, moedas_creditadas = ? WHERE payment_id = ?", [payment.status, target.coins, paymentId]);
    await connection.query(
      `UPDATE pagamento_saldos SET moedas_liquidas = ?, reembolso_centavos = ?, afiliado_id = ?,
       comissao_liquida = ?, cupom_contabilizado = ?, status = ?, provider_updated_ms = ? WHERE payment_id = ?`,
      [target.coins, target.refundCents, affiliateId || null, commission,
        record.cupom_contabilizado || firstCredit ? 1 : 0, payment.status, updatedAt, paymentId],
    );
    await connection.commit();
    return { changed: Boolean(coinDelta || commissionDelta), firstCredit, coins: target.coins, coinDelta };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
module.exports = { settlePayment };
