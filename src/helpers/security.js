const crypto = require("crypto");
const config = require("../config/env");

const deriveKey = (purpose) =>
  crypto.createHmac("sha256", config.jwtSecret).update(`moeda-arena:${purpose}:v1`).digest();

const timingSafeTextEqual = (left, right) => {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const sessionVersion = (passwordHash) =>
  crypto.createHmac("sha256", deriveKey("session-version")).update(String(passwordHash)).digest("base64url");

const hashResetToken = (token) => crypto.createHash("sha256").update(String(token)).digest("hex");

// A coluna legada possui seis caracteres. Um HMAC truncado protege o código
// contra leitura direta do banco e ainda oferece mais combinações que o OTP.
const hashTwoFactorCode = (userId, code) =>
  crypto
    .createHmac("sha256", deriveKey("two-factor-code"))
    .update(`${userId}:${code}`)
    .digest("hex")
    .slice(0, 6);

const signPaymentReference = (payload) => {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", deriveKey("payment-reference"))
    .update(encoded)
    .digest("base64url");
  return `v1.${encoded}.${signature}`;
};

const verifyPaymentReference = (reference) => {
  const [version, encoded, receivedSignature, ...extra] = String(reference || "").split(".");
  if (version !== "v1" || !encoded || !receivedSignature || extra.length) return null;

  const expectedSignature = crypto
    .createHmac("sha256", deriveKey("payment-reference"))
    .update(encoded)
    .digest("base64url");
  if (!timingSafeTextEqual(receivedSignature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (
      !Number.isSafeInteger(payload.usuarioId) ||
      payload.usuarioId < 1 ||
      typeof payload.planoId !== "string" ||
      !Number.isSafeInteger(payload.valorCentavos) ||
      payload.valorCentavos < 1 ||
      payload.moeda !== "BRL" ||
      typeof payload.nonce !== "string" ||
      payload.nonce.length < 16
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

module.exports = {
  hashResetToken,
  hashTwoFactorCode,
  sessionVersion,
  signPaymentReference,
  timingSafeTextEqual,
  verifyPaymentReference,
};
