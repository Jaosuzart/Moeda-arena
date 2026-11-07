const rateLimit = require("express-rate-limit");
const { env } = require("./bindings.mjs");

class DurableStore {
  constructor(identifier) {
    this.identifier = identifier;
  }
  init(options) {
    this.windowMs = options.windowMs;
  }
  async call(key, operation) {
    const id = env.RATE_LIMITS.idFromName(`${this.identifier}:${key}`);
    const response = await env.RATE_LIMITS.get(id).fetch("https://counter/", {
      method: "POST",
      body: JSON.stringify({ operation, windowMs: this.windowMs }),
    });
    if (!response.ok) throw new Error("Falha no limitador de requisições.");
    return response.json();
  }
  async increment(key) {
    const result = await this.call(key, "increment");
    return { totalHits: result.totalHits, resetTime: new Date(result.resetTime) };
  }
  async decrement(key) { await this.call(key, "decrement"); }
  async resetKey(key) { await this.call(key, "reset"); }
}

module.exports = ({ identifier, ...options }) => rateLimit({
  ...options,
    keyGenerator: options.keyGenerator || ((req) => req.headers["x-forwarded-for"] || "unknown"),
  store: new DurableStore(identifier),
});
