const { test } = require('node:test');
const assert = require('node:assert/strict');
Object.assign(process.env, { NODE_ENV: 'test', PORT: '3001', MP_ACCESS_TOKEN: 'test-only',
  DB_HOST: 'localhost', DB_USER: 'test', DB_NAME: 'test', JWT_SECRET: 'test-only-jwt-secret',
  API_GAME_SECRET: 'test-only-game-secret', ENCRYPTION_KEY: 'test-only-encryption-secret', SENTRY_DSN: '' });
// Consultas externas são proibidas neste teste de montagem HTTP real do Express.
const dbPath = require.resolve('../src/backend/database/db');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: {
  pool: { query() { throw new Error('Este teste não deve acessar MySQL.'); } },
} };
const app = require('../src/backend/app');

test('Express serve página, bundles, catálogo e autenticação sem acessar provedores', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    const home = await fetch(origin);
    assert.equal(home.status, 200);
    const html = await home.text();
    assert.match(html, /Compra avulsa/);
    assert.doesNotMatch(html, /<<<<<<<|>>>>>>>|renovação\s+automática da assinatura/);
    for (const endpoint of ['/main.min.js', '/admin.min.js', '/style.min.css', '/api/health', '/api/auth/config', '/api/auth/status', '/api/planos']) {
      const response = await fetch(origin + endpoint);
      assert.equal(response.status, 200, endpoint);
      if (endpoint === '/api/planos') {
        const body = await response.json();
        assert.equal(body.dados.find(plan => plan.id === 'premium').precoMensal, 499);
        assert.equal(body.dados.find(plan => plan.id === 'premium').precoAnual, undefined);
      } else await response.text();
    }
    const buy = await fetch(origin + '/api/comprar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planoId: 'premium' }) });
    assert.equal(buy.status, 401);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
