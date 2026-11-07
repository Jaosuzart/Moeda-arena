// Quantidades inteiras evitam diferenças de arredondamento entre notificações.
function toCents(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || Math.abs(number * 100 - Math.round(number * 100)) > 0.00001) {
    throw new Error("Valor monetário inválido.");
  }
  const cents = Math.round(number * 100);
  if (!Number.isSafeInteger(cents)) throw new Error("Valor monetário fora do limite.");
  return cents;
}

function settlementTarget(payment, snapshot) {
  const total = snapshot.valorCentavos;
  const refunded = toCents(payment.transaction_amount_refunded ?? 0);
  if (refunded > total) throw new Error("Reembolso superior ao pagamento.");
  const fullReversal = ["refunded", "charged_back", "cancelled"].includes(payment.status);
  const refundCents = Math.max(Number(snapshot.reembolsoCentavos || 0), fullReversal ? total : refunded);
  const held = payment.status === "in_mediation";
  if (!["approved", "refunded", "charged_back", "cancelled", "in_mediation"].includes(payment.status)) return null;
  const coins = held ? 0 : Number(BigInt(snapshot.moedas) * BigInt(total - refundCents) / BigInt(total));
  return { coins, refundCents, commission: Math.floor(coins * 0.05) };
}
module.exports = { toCents, settlementTarget };
