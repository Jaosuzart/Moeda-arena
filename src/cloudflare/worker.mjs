import { handleAsNodeRequest } from "cloudflare:node";
import app from "../app.js";

export { RateLimitCounter } from "./rateLimitCounter.mjs";

app.listen(3001);

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path !== "/api" && !path.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }
    const publicPaths = ["/api/health", "/api/auth/config", "/api/auth/status", "/api/planos", "/api/whatsapp"];
    if (!publicPaths.includes(path)) {
      const missing = ["HYPERDRIVE", "JWT_SECRET", "API_GAME_SECRET", "ENCRYPTION_KEY", "MP_ACCESS_TOKEN"]
        .filter((name) => !env[name]);
      if (missing.length) {
        console.error("Configuração incompleta do Worker:", missing.join(", "));
        return Response.json({ sucesso: false, erro: "Serviço temporariamente indisponível.", codigo: "CONFIGURACAO_INCOMPLETA" },
          { status: 503, headers: { "Cache-Control": "no-store" } });
      }
    }
    const headers = new Headers(request.headers);
    headers.set("x-forwarded-for", request.headers.get("cf-connecting-ip") || "127.0.0.1");
    headers.set("x-forwarded-proto", new URL(request.url).protocol.slice(0, -1));
    headers.delete("forwarded");
    const response = await handleAsNodeRequest(3001, new Request(request, { headers }));
    const result = new Response(response.body, response);
    result.headers.set("Cache-Control", "no-store");
    return result;
  },
};
