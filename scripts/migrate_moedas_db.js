require('dotenv').config();
const mysql = require('mysql2/promise');

async function runMigration() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 1,
        queueLimit: 0
    });

    try {
        console.log("Iniciando migração de Tokens para Moedas no banco de dados...");
        
        // Check if `saldo_tokens` exists and rename to `saldo_moedas`
        try {
            await pool.query("ALTER TABLE usuarios RENAME COLUMN saldo_tokens TO saldo_moedas;");
            console.log("✓ Coluna 'saldo_tokens' renomeada para 'saldo_moedas' na tabela 'usuarios'.");
        } catch (e) {
            console.log("Aviso (saldo_tokens):", e.message);
        }

        // Check if `tokens_creditados` exists in pagamentos_aprovados or similar
        try {
            await pool.query("ALTER TABLE pagamentos_processados RENAME COLUMN tokens_creditados TO moedas_creditadas;");
            console.log("✓ Coluna 'tokens_creditados' renomeada para 'moedas_creditadas' na tabela 'pagamentos_processados'.");
        } catch (e) {
            console.log("Aviso (tokens_creditados):", e.message);
        }

        console.log("Migração concluída.");
    } catch (error) {
        console.error("Erro durante a migração:", error.message);
    } finally {
        await pool.end();
    }
}

runMigration();
