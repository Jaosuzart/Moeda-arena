// Valores exclusivos dos testes; não dependem de credenciais do .env.
Object.assign(process.env, {
  NODE_ENV: "test", PORT: "3001", MP_ACCESS_TOKEN: "test-only",
  DB_HOST: "localhost", DB_USER: "test", DB_NAME: "test",
  JWT_SECRET: "test-only-security-secret", API_GAME_SECRET: "test-only-game-secret",
  ENCRYPTION_KEY: "test-only-encryption-secret",
});

const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  hashResetToken,
  hashTwoFactorCode,
  sessionVersion,
  signPaymentReference,
  timingSafeTextEqual,
  verifyPaymentReference,
<<<<<<< HEAD
} = require("../src/backend/security/security");
=======
} = require("../src/helpers/security");
>>>>>>> 16517a57767f8530fe1a419d706e317705ca7966

test("referência de pagamento assinada detecta adulteração", () => {
  const payload = {
    usuarioId: 7,
    planoId: "premium",
    valorCentavos: 1000,
    moeda: "BRL",
    cupom: null,
    nonce: "1234567890abcdef1234567890abcdef",
  };
  const reference = signPaymentReference(payload);
  assert.deepEqual(verifyPaymentReference(reference), payload);

  const parts = reference.split(".");
  const changedPayload = { ...payload, planoId: "vip" };
  parts[1] = Buffer.from(JSON.stringify(changedPayload)).toString("base64url");
  assert.equal(verifyPaymentReference(parts.join(".")), null);
});

test("tokens sensíveis e sessões usam derivações não reversíveis", () => {
  const resetToken = "token-de-recuperacao-secreto";
  assert.notEqual(hashResetToken(resetToken), resetToken);
  assert.equal(hashResetToken(resetToken).length, 64);

  const otpHash = hashTwoFactorCode(42, "123456");
  assert.equal(otpHash.length, 6);
  assert.notEqual(otpHash, "123456");

  assert.ok(timingSafeTextEqual(sessionVersion("hash-a"), sessionVersion("hash-a")));
  assert.ok(!timingSafeTextEqual(sessionVersion("hash-a"), sessionVersion("hash-b")));
});
<<<<<<< HEAD

test("referência compacta preserva snapshot e cabe no checkout", () => {
  const payload = { usuarioId: 2147483647, planoId: "iniciante", valorCentavos: 299,
    moedas: 1000, moeda: "BRL", periodo: "avulso", cupom: "A".repeat(30), nonce: "f".repeat(32) };
  const signed = signPaymentReference(payload);
  assert.ok(signed.startsWith("v2."));
  assert.ok(signed.length <= 256);
  assert.deepEqual(verifyPaymentReference(signed), payload);
  assert.equal(verifyPaymentReference(signed.replace("v2.", "v3.")), null);
});
=======
>>>>>>> 16517a57767f8530fe1a419d706e317705ca7966
