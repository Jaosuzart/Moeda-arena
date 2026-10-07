const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadAdmin(responses) {
  function element() {
    return {
      children: [],
      append(...children) { this.children.push(...children); },
      replaceChildren() { this.children = []; },
      insertRow() { const row = element(); this.append(row); return row; },
      insertCell() { const cell = element(); this.append(cell); return cell; },
      addEventListener(_event, listener) { this.click = listener; },
    };
  }
  const tbody = element();
  tbody.append({ textContent: "Carregando..." });
  const window = { location: { href: "/admin.html" } };
  const context = vm.createContext({
    document: {
      addEventListener() {},
      querySelector: () => tbody,
      createElement: element,
      createTextNode: (textContent) => ({ textContent }),
    },
    window,
    Swal: { fire: async () => ({}) },
    fetch: async () => responses.shift(),
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../src/frontend/admin.js"), "utf8"), context);
  return { context, tbody, window };
}

test("admin mostra erro e permite recuperar a lista após HTTP 500", async () => {
  const { context, tbody } = loadAdmin([
    { ok: false, status: 500, json: async () => ({ sucesso: false }) },
    { ok: true, status: 200, json: async () => ({ sucesso: true, dados: [] }) },
  ]);
  await context.carregarUsuarios();
  const cell = tbody.children[0].children[0];
  assert.match(cell.children[0].textContent, /Não foi possível/);
  assert.equal(cell.colSpan, 7);
  const retry = cell.children[1];
  assert.equal(retry.textContent, "Tentar novamente");
  await retry.click();
  assert.equal(tbody.children[0].children[0].textContent, "Nenhum usuário encontrado.");
});

test("admin trata resposta inválida sem deixar a tabela carregando", async () => {
  const { context, tbody } = loadAdmin([
    { ok: true, status: 200, json: async () => ({ sucesso: true, dados: null }) },
  ]);
  await context.carregarUsuarios();
  assert.match(tbody.children[0].children[0].children[0].textContent, /Não foi possível/);
});

test("admin redireciona usuários sem permissão", async () => {
  const { context, window } = loadAdmin([{ status: 403 }]);
  await context.carregarUsuarios();
  assert.equal(window.location.href, "/");
});
