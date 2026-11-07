import { DurableObject } from "cloudflare:workers";

export class RateLimitCounter extends DurableObject {
  async fetch(request) {
    const { operation, windowMs } = await request.json();
    if (!["increment", "decrement", "reset"].includes(operation) ||
        !Number.isSafeInteger(windowMs) || windowMs < 1) {
      return new Response("Invalid counter operation", { status: 400 });
    }
    const result = await this.ctx.storage.transaction(async (storage) => {
      const now = Date.now();
      let counter = await storage.get("counter");
      if (!counter || counter.resetTime <= now || operation === "reset") {
        counter = { totalHits: 0, resetTime: now + windowMs };
      }
      if (operation === "increment") counter.totalHits++;
      if (operation === "decrement") counter.totalHits = Math.max(0, counter.totalHits - 1);
      await storage.put("counter", counter);
      await storage.setAlarm(counter.resetTime);
      return counter;
    });
    return Response.json(result);
  }
  async alarm() {
    const counter = await this.ctx.storage.get("counter");
    if (counter && counter.resetTime > Date.now()) {
      await this.ctx.storage.setAlarm(counter.resetTime);
    } else {
      await this.ctx.storage.deleteAll();
    }
  }
}
