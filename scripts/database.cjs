const fs = require('node:fs');
const path = require('node:path');
const { pool } = require('../src/backend/database/db');
const { checkPaymentSchema } = require('../src/backend/database/schema');

async function main() {
  const action = process.argv[2];
  if (!['setup', 'migrate', 'check'].includes(action)) throw new Error('Use setup, migrate ou check.');
  const connection = await pool.getConnection();
  try {
    if (action !== 'check') {
      const [duplicates] = await connection.query(
        "SELECT COUNT(*) AS count FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pagamentos_processados'",
      );
      if (Number(duplicates[0].count)) {
        const [payments] = await connection.query('SELECT payment_id FROM pagamentos_processados GROUP BY payment_id HAVING COUNT(*) > 1 LIMIT 1');
        if (payments.length) throw new Error('Existem payment_id duplicados. Reconcilie os saldos antes da migração. Nenhum pagamento foi excluído.');
      }
      const schema = fs.readFileSync(path.resolve(__dirname, '../database/schema.sql'), 'utf8');
      for (const statement of schema.split(';').map(s => s.trim()).filter(Boolean)) await connection.query(statement);
      if (action === 'migrate') {
        // Não apaga contas, histórico ou credenciais. DDL deve ser executado com
        // backup e aplicação parada; MySQL faz commits implícitos nestas alterações.
        await connection.query('ALTER TABLE usuarios MODIFY saldo_moedas BIGINT NOT NULL DEFAULT 0, MODIFY ganhos_afiliado BIGINT NOT NULL DEFAULT 0');
        await connection.query('ALTER TABLE pagamentos_processados MODIFY status VARCHAR(32) NOT NULL');
        const [indexes] = await connection.query('SHOW INDEX FROM pagamentos_processados');
        const unique = new Map();
        for (const i of indexes.filter(i => !Number(i.Non_unique))) unique.set(i.Key_name, [...(unique.get(i.Key_name) || []), i.Column_name]);
        if (![...unique.values()].some(fields => fields.length === 1 && fields[0] === 'payment_id')) {
          await connection.query('ALTER TABLE pagamentos_processados ADD UNIQUE KEY uq_payment_id (payment_id)');
        }
      }
    }
    await checkPaymentSchema(connection);
    console.log('Esquema de pagamentos verificado.');
  } finally { connection.release(); }
}
main().catch(error => { console.error('Falha no banco:', error.message); process.exitCode = 1; }).finally(() => pool.end());
