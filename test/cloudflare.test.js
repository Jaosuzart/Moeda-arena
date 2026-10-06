const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

function database(createConnection, env = { HYPERDRIVE: { host: "db", port: 3306, user: "test", password: "test", database: "arena" } }) {
  const pending = [];
  const context = {
    module: { exports: {} },
    require(name) {
      if (name === "mysql2/promise") return { createConnection };
      if (name === "./bindings.mjs") return { env, waitUntil: (promise) => pending.push(promise) };
      throw new Error(name);
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../src/cloudflare/db.js"), "utf8"), context);
  return { pool: context.module.exports.pool, pending };
}

test("Worker não compartilha conexões MySQL entre consultas e fecha em caso de erro", async () => {
  let opened = 0;
  let closed = 0;
  const { pool, pending } = database(async (options) => {
    assert.equal(options.disableEval, true);
    assert.equal(options.host, "db");
    opened++;
    return {
      query: async () => [[{ ok: true }]],
      execute: async () => { throw new Error("SQL_FAILED"); },
      end: async () => { closed++; },
    };
  });
  await pool.query("SELECT 1");
  await assert.rejects(pool.execute("invalid"), /SQL_FAILED/);
  await Promise.all(pending);
  assert.equal(opened, 2);
  assert.equal(closed, 2);
});

test("Worker mantém a mesma conexão em transações e libera uma única vez", async () => {
  const calls = [];
  const connection = {
    beginTransaction: async () => calls.push("begin"),
    query: async () => calls.push("query"),
    commit: async () => calls.push("commit"),
    end: async () => calls.push("end"),
  };
  const { pool, pending } = database(async () => connection);
  const transaction = await pool.getConnection();
  assert.equal(transaction, connection);
  await transaction.beginTransaction();
  await transaction.query("UPDATE saldo");
  await transaction.commit();
  transaction.release();
  transaction.release();
  await Promise.all(pending);
  assert.deepEqual(calls, ["begin", "query", "commit", "end"]);
});

test("Worker rejeita banco sem Hyperdrive em vez de abrir conexão insegura", async () => {
  const { pool } = database(() => assert.fail("não deve conectar"), {});
  await assert.rejects(pool.query("SELECT 1"), { status: 503 });
});
