"use strict";
require("dotenv").config();

const { pool } = require("../src/models/db");
const { encrypt, isEncrypted } = require("../src/helpers/crypto");
const logger = require("../src/config/logger");

const SENSITIVE_FIELDS = ["cpf", "telefone", "chave_pix", "cartao_final"];
const BATCH_SIZE = 100;

async function migrateUser(row) {
  const updates = {};
  let needsUpdate = false;

  for (const field of SENSITIVE_FIELDS) {
    const value = row[field];
    if (value != null && !isEncrypted(value)) {
      updates[field] = encrypt(value);
      needsUpdate = true;
    }
  }

  if (!needsUpdate) return false;

  const setClauses = Object.keys(updates).map((f) => f + " = ?").join(", ");
  const values = [...Object.values(updates), row.id];
  const sql = "UPDATE usuarios SET " + setClauses + " WHERE id = ?";
  await pool.execute(sql, values);
  return true;
}

async function run() {
  logger.info("[migrate-encrypt] Iniciando migracao de campos sensiveis...");

  let offset = 0;
  let totalProcessed = 0;
  let totalMigrated = 0;

  while (true) {
    const [rows] = await pool.query(
      "SELECT id, cpf, telefone, chave_pix, cartao_final FROM usuarios LIMIT ? OFFSET ?",
      [BATCH_SIZE, offset],
    );

    if (rows.length === 0) break;

    for (const row of rows) {
      const migrated = await migrateUser(row);
      totalProcessed++;
      if (migrated) {
        totalMigrated++;
        logger.info("[migrate-encrypt] Usuario migrado.", { id: row.id });
      }
    }

    offset += rows.length;
    if (rows.length < BATCH_SIZE) break;
  }

  logger.info("[migrate-encrypt] Migracao concluida.", {
    totalProcessed,
    totalMigrated,
    skipped: totalProcessed - totalMigrated,
  });

  await pool.end();
  process.exit(0);
}

run().catch((err) => {
  logger.error("[migrate-encrypt] Erro fatal na migracao.", { erro: err.message });
  process.exit(1);
});