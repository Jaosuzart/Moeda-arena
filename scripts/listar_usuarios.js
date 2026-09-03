require("dotenv").config();
const { pool } = require("../src/models/db");

async function listarUsuarios() {
  try {
    const [rows] = await pool.query("SELECT id, nome, email FROM usuarios LIMIT 10");
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error("Erro:", err);
  } finally {
    pool.end();
  }
}

listarUsuarios();
