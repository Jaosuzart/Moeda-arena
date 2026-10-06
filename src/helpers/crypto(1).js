"use strict";
const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const KEY_LENGTH = 32;
const SALT = Buffer.from("moeda-arena-enc-v1", "utf8");
const PREFIX = "enc:v1:";

let _cachedKey = null;

const getDerivedKey = () => {
  if (_cachedKey) return _cachedKey;
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw || raw.length < 16) {
    throw new Error("[crypto] ENCRYPTION_KEY ausente ou muito curta.");
  }
  _cachedKey = crypto.scryptSync(raw, SALT, KEY_LENGTH, { N: 16384 });
  return _cachedKey;
};

const encrypt = (text) => {
  if (text == null) return text;
  const str = String(text);
  if (str.startsWith(PREFIX)) return str;
  const key = getDerivedKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(str, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return PREFIX + iv.toString("hex") + ":" + authTag.toString("hex") + ":" + ciphertext.toString("hex");
};

const decrypt = (encryptedText) => {
  if (encryptedText == null) return encryptedText;
  const str = String(encryptedText);
  if (!str.startsWith(PREFIX)) return str;
  const key = getDerivedKey();
  const payload = str.slice(PREFIX.length);
  const parts = payload.split(":");
  if (parts.length !== 3) throw new Error("[crypto] Formato de dado criptografado invalido.");
  const [ivHex, authTagHex, cipherHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(cipherHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
};
const isEncrypted = (text) => text != null && String(text).startsWith(PREFIX);
module.exports = { encrypt, decrypt, isEncrypted };
