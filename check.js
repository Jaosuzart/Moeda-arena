const mysql = require('mysql2/promise');
const config = require('./src/config/env');

async function test() {
  const pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port,
    ssl: { rejectUnauthorized: false }
  });

  const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = 1');
  console.log(rows[0]);
  process.exit(0);
}
test();
