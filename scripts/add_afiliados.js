const { pool, testarConexao } = require("../src/models/db");
const logger = require("../src/config/logger");

const runMigration = async () => {
  try {
    await testarConexao();

    // Adiciona codigo_convite
    try {
      await pool.query(
        "ALTER TABLE usuarios ADD COLUMN codigo_convite VARCHAR(20) UNIQUE DEFAULT NULL",
      );
      console.log("Coluna codigo_convite adicionada.");
    } catch (e) {
      console.log("Coluna codigo_convite ja existe.");
    }

    // Adiciona indicado_por
    try {
      await pool.query(
        "ALTER TABLE usuarios ADD COLUMN indicado_por INT DEFAULT NULL",
      );
      // Adiciona chave estrangeira
      await pool.query(
        "ALTER TABLE usuarios ADD CONSTRAINT fk_indicador FOREIGN KEY (indicado_por) REFERENCES usuarios(id) ON DELETE SET NULL",
      );
      console.log("Coluna indicado_por adicionada.");
    } catch (e) {
      console.log("Coluna indicado_por ja existe.");
    }

    // Adiciona ganhos_afiliado
    try {
      await pool.query(
        "ALTER TABLE usuarios ADD COLUMN ganhos_afiliado INT DEFAULT 0",
      );
      console.log("Coluna ganhos_afiliado adicionada.");
    } catch (e) {
      console.log("Coluna ganhos_afiliado ja existe.");
    }

    // Gerar codigo de convite para os usuarios existentes
    const [usuarios] = await pool.query(
      "SELECT id, nome FROM usuarios WHERE codigo_convite IS NULL",
    );
    for (const u of usuarios) {
      const codigo =
        u.nome.replace(/\s+/g, "").substring(0, 5).toUpperCase() +
        u.id +
        Math.floor(Math.random() * 1000);
      await pool.query("UPDATE usuarios SET codigo_convite = ? WHERE id = ?", [
        codigo,
        u.id,
      ]);
    }
    console.log("Codigos gerados para usuarios antigos.");

    console.log("Migracao concluida!");
    process.exit(0);
  } catch (err) {
    console.error("Erro na migracao", err);
    process.exit(1);
  }
};

runMigration();
