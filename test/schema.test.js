const { test } = require('node:test');
const assert = require('node:assert/strict');
const { checkPaymentSchema } = require('../src/backend/database/schema');
function database({ missing = false, unsigned = false, composite = false, myisam = false } = {}) {
  return { async query(sql) {
    if (sql.includes('information_schema.TABLES')) return [[...['usuarios', 'cupons', 'pagamentos_processados', 'pagamento_saldos']
      .slice(0, missing ? 3 : 4).map(TABLE_NAME => ({ TABLE_NAME, ENGINE: myisam ? 'MyISAM' : 'InnoDB' }))]];
    if (sql.startsWith('SHOW COLUMNS')) return [[{ Type: unsigned ? 'bigint unsigned' : 'bigint' }, { Type: 'bigint' }]];
    if (sql.startsWith('SHOW INDEX')) return [[{ Key_name: 'uq_payment', Non_unique: 0, Column_name: 'payment_id' },
      ...(composite ? [{ Key_name: 'uq_payment', Non_unique: 0, Column_name: 'usuario_id' }] : [])]];
    throw new Error(sql);
  } };
}
test('esquema exige transações, saldo com sinal e unicidade global do pagamento', async () => {
  await checkPaymentSchema(database());
  for (const options of [{ missing: true }, { unsigned: true }, { composite: true }, { myisam: true }]) {
    await assert.rejects(checkPaymentSchema(database(options)));
  }
});
