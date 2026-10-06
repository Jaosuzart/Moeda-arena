const mysql = require("mysql2/promise");
const { env, waitUntil } = require("./bindings.mjs");

async function getConnection() {
  if (!env.HYPERDRIVE) {
    throw Object.assign(new Error("Configure o binding HYPERDRIVE."), { status: 503 });
  }
  const { host, port, user, password, database } = env.HYPERDRIVE;
  const connection = await mysql.createConnection({
    host, port, user, password, database,
    disableEval: true,
    connectTimeout: 10000,
  });
  let released = false;
  connection.release = () => {
    if (released) return;
    released = true;
    waitUntil(connection.end().catch(() => connection.destroy()));
  };
  return connection;
}

async function execute(method, args) {
  const connection = await getConnection();
  try {
    return await connection[method](...args);
  } finally {
    connection.release();
  }
}

const pool = {
  getConnection,
  query: (...args) => execute("query", args),
  execute: (...args) => execute("execute", args),
};

module.exports = { pool };
