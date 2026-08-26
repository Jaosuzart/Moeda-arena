const { pool, testarConexao } = require('./src/models/db');
const logger = require('./src/config/logger');

async function migrate() {
    try {
        await testarConexao();

        console.log("Adicionando colunas de 2FA...");

        try {
            await pool.query("ALTER TABLE usuarios ADD COLUMN ativo_2fa BOOLEAN DEFAULT FALSE;");
            console.log("Coluna ativo_2fa adicionada.");
        } catch (e) {
            console.error("Coluna ativo_2fa possivelmente já existe:", e.message);
        }

        try {
            await pool.query("ALTER TABLE usuarios ADD COLUMN codigo_2fa VARCHAR(6) NULL;");
            console.log("Coluna codigo_2fa adicionada.");
        } catch (e) {
            console.error("Coluna codigo_2fa possivelmente já existe:", e.message);
        }

        try {
            await pool.query("ALTER TABLE usuarios ADD COLUMN codigo_2fa_expira DATETIME NULL;");
            console.log("Coluna codigo_2fa_expira adicionada.");
        } catch (e) {
            console.error("Coluna codigo_2fa_expira possivelmente já existe:", e.message);
        }

        console.log("Migração concluída com sucesso.");
        process.exit(0);
    } catch (e) {
        console.error("Erro na migração:", e);
        process.exit(1);
    }
}

migrate();
