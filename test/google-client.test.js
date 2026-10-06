const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../src/frontend/main.js"), "utf8");
const handlers = [
  source.slice(source.indexOf("  let googleScriptCarregado"), source.indexOf("  DOM.btnAbrirLogin.addEventListener")),
  source.slice(source.indexOf("  const handleGoogleClick"), source.indexOf("  if (DOM.btnGoogleLogin) DOM.btnGoogleLogin.addEventListener")),
  source.slice(source.indexOf("  function initGoogleAuth()"), source.indexOf("  DOM.navAvatar.addEventListener")),
].join("\n");

function setup(fetch) {
  let initialized = 0;
  let prompted = 0;
  const scripts = [];
  const element = () => ({ setAttribute() {}, appendChild() {}, replaceChildren() {}, remove() {}, disabled: false });
  const sdk = { accounts: { id: {
    initialize(options) { assert.ok(options.client_id); initialized++; },
    prompt() { prompted++; },
  } } };
  const context = {
    window: { google: sdk }, google: sdk,
    document: { createElement: element, createElementNS: element, head: { appendChild: (script) => scripts.push(script) } },
    DOM: { btnGoogleLogin: element(), btnGoogleRegistro: element(), tabLogin: { classList: { contains: () => true } } },
    estado: {}, fetch, console: { error() {} },
    mostrarFeedback() {}, handleGoogleCallback() {},
  };
  vm.createContext(context);
  vm.runInContext(`${handlers}\nthis.api = { initGoogleAuth, handleGoogleClick };`, context);
  return { ...context.api, scripts, context, counts: () => ({ initialized, prompted }) };
}

test("Google: HTTP 404 na configuração não inicializa nem abre o login", async () => {
  const page = setup(async () => ({ ok: false, status: 404 }));
  await page.initGoogleAuth();
  page.handleGoogleClick();
  page.scripts[0].onload();
  await page.initGoogleAuth();
  assert.deepEqual(page.counts(), { initialized: 0, prompted: 0 });
  assert.equal(page.context.DOM.btnGoogleLogin.disabled, false);
});

test("Google: configuração sem Client ID não inicializa o SDK", async () => {
  const page = setup(async () => ({ ok: true, json: async () => ({ clientId: "" }) }));
  await page.initGoogleAuth();
  assert.deepEqual(page.counts(), { initialized: 0, prompted: 0 });
});

test("Google: chamadas concorrentes compartilham configuração e inicialização", async () => {
  let requests = 0;
  const page = setup(async () => {
    requests++;
    return { ok: true, json: async () => ({ clientId: "test.apps.googleusercontent.com" }) };
  });
  await Promise.all([page.initGoogleAuth(), page.initGoogleAuth()]);
  page.handleGoogleClick();
  assert.equal(requests, 1);
  assert.deepEqual(page.counts(), { initialized: 1, prompted: 1 });
});

test("Google: permite tentar novamente após recuperação da API", async () => {
  let requests = 0;
  const page = setup(async () => ++requests === 1
    ? { ok: false, status: 503 }
    : { ok: true, json: async () => ({ clientId: "test.apps.googleusercontent.com" }) });
  await page.initGoogleAuth();
  await page.initGoogleAuth();
  page.handleGoogleClick();
  assert.deepEqual(page.counts(), { initialized: 1, prompted: 1 });
});
