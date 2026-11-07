// Executa apenas localmente, com credenciais fictícias e sem conexão ao banco real.
const requireWrangler = require("node:module").createRequire(require.resolve("wrangler"));
const { Miniflare, convertV4MiniflareOptions } = requireWrangler("miniflare");
const assert = require("node:assert/strict");
const path = require("node:path");

async function main() {
  const options = {
    modules: true,
    scriptPath: path.resolve(".cache/worker/worker.js"),
    compatibilityDate: "2026-09-27",
    compatibilityFlags: ["nodejs_compat"],
    bindings: {
      NODE_ENV: "production",
      CORS_ORIGIN: "https://moedaarena.com.br",
      CLIENT_ID_GOOGLE: "test.apps.googleusercontent.com",
      JWT_SECRET: "test-only-not-a-real-secret",
      API_GAME_SECRET: "test-only",
      ENCRYPTION_KEY: "test-only-encryption-key",
      MP_ACCESS_TOKEN: "test-only",
    },
    durableObjects: { RATE_LIMITS: { className: "RateLimitCounter", useSQLite: true } },
    assets: {
      directory: path.resolve("public"),
      binding: "ASSETS",
      run_worker_first: ["/api", "/api/*"],
      routerConfig: { has_user_worker: true },
    },
  };
  const mf = new Miniflare(convertV4MiniflareOptions ? convertV4MiniflareOptions(options) : options);
  try {
    for (const endpoint of ["/api/health", "/api/auth/config", "/api/auth/status", "/api/planos"]) {
      const response = await mf.dispatchFetch(`https://moedaarena.com.br${endpoint}`);
      const body = await response.text();
      assert.equal(response.status, 200, `${endpoint}: ${body}`);
      assert.equal(response.headers.get("cache-control"), "no-store");
      const data = JSON.parse(body);
      if (endpoint.endsWith("/config")) assert.equal(data.clientId, "test.apps.googleusercontent.com");
      if (endpoint.endsWith("/status")) assert.equal(data.autenticado, false);
      if (endpoint.endsWith("/planos")) assert.equal(data.sucesso, true);
      console.log(`OK ${endpoint}`);
    }
    const unavailable = await mf.dispatchFetch("https://moedaarena.com.br/api/estatisticas");
    assert.equal(unavailable.status, 503);
    assert.equal((await unavailable.json()).codigo, "CONFIGURACAO_INCOMPLETA");
    console.log("OK banco ausente retorna 503 explícito, sem 404 de arquivo estático");
    const homepage = await mf.dispatchFetch("https://moedaarena.com.br/");
    assert.equal(homepage.status, 200);
    assert.match(await homepage.text(), /Moeda Arena/);
    console.log("OK página inicial");
    const counter = await mf.getDurableObjectNamespace("RATE_LIMITS");
    const stub = counter.get(counter.idFromName("smoke-counter"));
    const hits = await Promise.all(Array.from({ length: 12 }, async () => {
      const response = await stub.fetch("https://counter/", {
        method: "POST", body: JSON.stringify({ operation: "increment", windowMs: 60000 }),
      });
      return (await response.json()).totalHits;
    }));
    assert.deepEqual(hits.sort((a, b) => a - b), Array.from({ length: 12 }, (_, i) => i + 1));
    console.log("OK contador de tentativas concorrentes");

    // Binding fictício somente para testar validações que terminam ANTES de consultar o banco.
    options.bindings.HYPERDRIVE = { host: "database.invalid" };
    await mf.setOptions(convertV4MiniflareOptions ? convertV4MiniflareOptions(options) : options);
    const missingRoute = await mf.dispatchFetch("https://moedaarena.com.br/api/inexistente");
    assert.equal(missingRoute.status, 404);
    assert.equal((await missingRoute.json()).codigo, "ROTA_NAO_ENCONTRADA");
    const malformed = await mf.dispatchFetch("https://moedaarena.com.br/api/auth/google", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{",
    });
    assert.equal(malformed.status, 400);
    await malformed.text();
    const invalidToken = await mf.dispatchFetch("https://moedaarena.com.br/api/auth/google", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: "invalid" }),
    });
    assert.equal(invalidToken.status, 401);
    await invalidToken.text();
    for (let i = 0; i < 10; i++) {
      const response = await mf.dispatchFetch("https://moedaarena.com.br/api/auth/google", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
      });
      assert.equal(response.status, i === 9 ? 429 : 400);
      await response.text();
    }
    console.log("OK JSON inválido, token Google inválido e bloqueio após limite de tentativas");
  } finally {
    await mf.dispose();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
