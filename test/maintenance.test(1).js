const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { EventEmitter } = require("node:events");

const logger = { info() {}, warn() {}, error() {} };
function load(file, dependencies, globals = {}) {
  const filename = path.resolve(__dirname, "..", file);
  const context = {
    module: { exports: {} },
    __dirname: path.dirname(filename),
    require(name) {
      assert.ok(name in dependencies, `Dependência não simulada: ${name}`);
      return dependencies[name];
    },
    ...globals,
  };
  vm.runInNewContext(fs.readFileSync(filename, "utf8"), context, { filename });
  return context.module.exports;
}

function environment(overrides = {}) {
  let dotenvPath;
  const config = load(
    "src/config/env.js",
    {
      path,
      dotenv: {
        config(options) {
          dotenvPath = options.path;
        },
      },
    },
    {
      process: {
        env: {
          PORT: "3001",
          MP_ACCESS_TOKEN: "test",
          DB_HOST: "localhost",
          DB_USER: "test",
          DB_NAME: "test",
          JWT_SECRET: "test",
          API_GAME_SECRET: "test",
          ENCRYPTION_KEY: "test",
          ...overrides,
        },
        stderr: { write() {} },
        exit() {
          throw new Error("configuração inválida");
        },
      },
    },
  );
  return { config, dotenvPath };
}

test("configuração usa o .env da raiz e portas válidas", () => {
  const { config, dotenvPath } = environment();
  assert.equal(dotenvPath, path.resolve(__dirname, "../.env"));
  assert.equal(config.db.port, 3306);
  assert.equal(config.port, 3001);
});

test("configuração rejeita portas parciais, fora do intervalo e limite inválido", () => {
  for (const value of ["3001abc", "0", "65536", "-1", "1.5", ""]) {
    assert.throws(() => environment({ PORT: value }), /inválida/);
    assert.throws(() => environment({ DB_PORT: value }), /inválida/);
  }
  assert.throws(() => environment({ DB_CONN_LIMIT: "-10" }), /inválida/);
});

test("erros HTTP preservam 400/413, ocultam falhas internas e delegam respostas iniciadas", () => {
  const handler = load("src/middlewares/errorHandler.js", {
    "../config/logger": logger,
  });
  const req = { path: "/api/test", method: "POST" };
  const res = {
    status(code) {
      this.code = code;
      return this;
    },
    json(body) {
      this.body = body;
    },
  };
  handler(
    { status: 400, type: "entity.parse.failed", message: "dado sensível" },
    req,
    res,
  );
  assert.equal(res.code, 400);
  assert.match(res.body.erro, /JSON inválido/);
  handler({ status: 413, type: "entity.too.large" }, req, res);
  assert.equal(res.code, 413);
  handler({ status: 503, message: "credenciais internas" }, req, res);
  assert.equal(res.code, 503);
  assert.doesNotMatch(res.body.erro, /credenciais/);
  handler({ statusCode: 999 }, req, res);
  assert.equal(res.code, 500);
  const error = new Error("resposta iniciada");
  handler(error, req, { headersSent: true }, (received) =>
    assert.equal(received, error),
  );
});

test("banco libera a conexão tanto no sucesso quanto em falhas", async () => {
  for (const code of [null, "ER_TABLEACCESS_DENIED_ERROR", "SELECT_FAILED"]) {
    let released = 0;
    const connection = {
      async query(sql) {
        if (sql !== "SELECT 1" || code)
          throw Object.assign(new Error("simulada"), { code });
      },
      release() {
        released++;
      },
    };
    const db = load("src/models/db.js", {
      fs,
      path,
      "mysql2/promise": {
        createPool: () => ({ getConnection: async () => connection }),
      },
      "../config/env": { db: {} },
      "../config/logger": logger,
    });
    if (code === null)
      assert.equal(await db.testarConexao(), true);
    else await assert.rejects(db.testarConexao(), { code });
    assert.equal(released, 1);
  }
});

const flush = () => new Promise((resolve) => setImmediate(resolve));
test("porta ocupada encerra recursos sem iniciar WhatsApp nem executar comandos externos", async () => {
  const server = new EventEmitter();
  const processMock = new EventEmitter();
  const exits = [];
  processMock.exit = (code) => exits.push(code);
  let stopped = 0;
  let closed = 0;
  let initialized = 0;
  load(
    "server.js",
    {
      "./src/config/env": { port: 3001, nodeEnv: "development" },
      "./src/config/logger": logger,
      "./src/app": { listen: () => server },
      "./src/models/db": {
        testarConexao: async () => {},
        encerrarPool: async () => {
          closed++;
        },
      },
      "./src/services/whatsappService": {
        initWhatsApp: async () => {
          initialized++;
        },
        stopWhatsApp: async () => {
          stopped++;
        },
      },
    },
    { process: processMock, setTimeout, clearTimeout },
  );
  await flush();
  server.emit(
    "error",
    Object.assign(new Error("ocupada"), { code: "EADDRINUSE" }),
  );
  await flush();
  assert.deepEqual(exits, [1]);
  assert.equal(initialized, 0);
  assert.equal(stopped, 1);
  assert.equal(closed, 1);
});

test("WhatsApp cancela reconexão ao encerrar e não gera URL externa para QR", async () => {
  const events = new EventEmitter();
  const timers = new Set();
  let sockets = 0;
  const messages = [];
  const service = load(
    "src/services/whatsappService.js",
    {
      "@whiskeysockets/baileys": {
        default: () => {
          sockets++;
          return {
            ev: events,
            end() {
              events.emit("connection.update", { connection: "close" });
            },
          };
        },
        useMultiFileAuthState: async () => ({
          state: {},
          saveCreds: async () => {},
        }),
        DisconnectReason: { loggedOut: 401 },
      },
      "qrcode-terminal": { generate() {} },
      "../config/logger": {
        ...logger,
        info(message) {
          messages.push(message);
        },
      },
      pino: () => ({}),
      path,
    },
    {
      setTimeout(fn) {
        timers.add(fn);
        return fn;
      },
      clearTimeout(fn) {
        timers.delete(fn);
      },
    },
  );
  await service.initWhatsApp();
  events.emit("connection.update", { qr: "secret-qr" });
  assert.ok(
    messages.every(
      (message) =>
        !message.includes("secret-qr") && !message.includes("https://"),
    ),
  );
  events.emit("connection.update", { connection: "close" });
  assert.equal(timers.size, 1);
  await service.stopWhatsApp();
  assert.equal(timers.size, 0);
  await service.initWhatsApp();
  assert.equal(sockets, 1);
});

test("plano grátis registra idempotência antes de creditar moedas", async () => {
  const calls = [];
  const connection = {
    async beginTransaction() {
      calls.push("begin");
    },
    async query(sql, values) {
      calls.push({ sql, values });
      return [{ affectedRows: 1 }];
    },
    async commit() {
      calls.push("commit");
    },
    async rollback() {
      calls.push("rollback");
    },
    release() {
      calls.push("release");
    },
  };
  const controller = load("src/controllers/compraController.js", {
    "../models/planoModel": {
      obterPlanoPorId: () => ({ id: "gratis", nome: "Grátis", moedas: 100, isGratis: true }),
    },
    "../models/usuarioModel": {
      adicionarMoedas() {
        throw new Error("crédito não pode ocorrer fora da transação");
      },
    },
    "../models/cupomModel": {},
    mercadopago: { MercadoPagoConfig: class {}, Preference: class {} },
    crypto: require("crypto"),
    "../config/env": { mpAccessToken: "test" },
    "../config/logger": logger,
    "../helpers/apiResponse": {
      sucesso(_res, dados, status = 200) {
        return { status, dados };
      },
      erro(_res, mensagem, status = 400, codigo) {
        return { status, mensagem, codigo };
      },
    },
    "../models/pagamentoModel": {
      async registrarPagamento(paymentId, usuarioId, _planoId, _moedas, _valor, _status, executor) {
        calls.push({ paymentId, usuarioId, executor });
      },
    },
    "#database": { pool: { getConnection: async () => connection } },
    "../helpers/security": { signPaymentReference() {} },
  });

  const response = await controller.processarCompra(
    { body: { planoId: "gratis", isGratis: true }, usuario: { id: 7 } },
    {},
    (err) => {
      throw err;
    },
  );

  assert.equal(response.status, 201);
  assert.ok(calls.some((call) => call.paymentId === "gratis:7"));
  assert.ok(calls.includes("commit"));
  assert.ok(calls.includes("release"));
  assert.ok(!calls.includes("rollback"));
});
