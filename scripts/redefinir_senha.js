require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool } = require("../src/models/db");

async function redefinirSenha() {
  const email = process.argv[2];
  const novaSenha = process.argv[3];

  if (!email || !novaSenha) {
    console.error("Uso: node scripts/redefinir_senha.js <email> <nova_senha>");
    process.exit(1);
  }

  try {
    const [rows] = await pool.query("SELECT id, nome FROM usuarios WHERE email = ?", [email]);
    if (rows.length === 0) {
      console.error(`Usuário com email ${email} não encontrado.`);
      process.exit(1);
    }

    const usuario = rows[0];
    const senhaHash = await bcrypt.hash(novaSenha, 12);

    const [resultado] = await pool.query(
      "UPDATE usuarios SET senha_hash = ?, reset_senha_token = NULL, reset_senha_expira = NULL, has_password = TRUE WHERE id = ?",
      [senhaHash, usuario.id]
    );

    if (resultado.affectedRows > 0) {
      console.log(`✅ Senha redefinida com sucesso para o usuário: ${usuario.nome} (${email})`);
    } else {
      console.error("Falha ao atualizar a senha.");
    }
  } catch (err) {
    console.error("Erro ao redefinir a senha:", err);
  } finally {
    pool.end();
  }
}

redefinirSenha();
