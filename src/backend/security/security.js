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
  const compact = payload.moedas !== undefined;
  const version = compact ? "v2" : "v1";
  const data = compact ? [payload.usuarioId, payload.planoId, payload.valorCentavos, payload.moedas,
    payload.cupom || null, payload.nonce] : payload;
  const encoded = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", deriveKey("payment-reference"))
    .update(encoded)
    .digest("base64url");
  const reference = `${version}.${encoded}.${signature}`;
  if (reference.length > 256) throw new Error("Referência de pagamento excede o limite.");
  return reference;
};

const verifyPaymentReference = (reference) => {
  const [version, encoded, receivedSignature, ...extra] = String(reference || "").split(".");
  if (!["v1", "v2"].includes(version) || !encoded || !receivedSignature || extra.length) return null;

  const expectedSignature = crypto
    .createHmac("sha256", deriveKey("payment-reference"))
    .update(encoded)
    .digest("base64url");
  if (!timingSafeTextEqual(receivedSignature, expectedSignature)) return null;

  try {
    const data = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (version === "v2" && (!Array.isArray(data) || data.length !== 6)) return null;
    const payload = version === "v2" ? {
      usuarioId: data[0], planoId: data[1], valorCentavos: data[2], moedas: data[3],
      cupom: data[4], nonce: data[5], periodo: "avulso", moeda: "BRL",
    } : data;
    if (!payload || typeof payload !== "object") return null;
    if (
      !Number.isSafeInteger(payload.usuarioId) ||
      payload.usuarioId < 1 ||
      typeof payload.planoId !== "string" ||
      !Number.isSafeInteger(payload.valorCentavos) ||
      payload.valorCentavos < 1 ||
      payload.moeda !== "BRL" ||
      typeof payload.nonce !== "string" ||
      payload.nonce.length < 16 ||
      (payload.moedas !== undefined && (!Number.isSafeInteger(payload.moedas) || payload.moedas < 1)) ||
      (payload.periodo !== undefined && payload.periodo !== "avulso")
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
