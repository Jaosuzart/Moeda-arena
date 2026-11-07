function apiError(status, codigo, erro) {
  return Response.json({ sucesso: false, codigo, erro }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function handleRequest(request, env, fetchBackend = fetch) {
  const incoming = new URL(request.url);
  if (incoming.pathname !== "/api" && !incoming.pathname.startsWith("/api/")) {
    return env.ASSETS.fetch(request);
  }

  let origin;
  try {
    origin = new URL(env.BACKEND_ORIGIN);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
    if ((origin.protocol !== "https:" && !(local && origin.protocol === "http:")) ||
        origin.username || origin.password || origin.pathname !== "/" ||
        origin.search || origin.hash || origin.hostname === incoming.hostname) {
      throw new Error("Invalid backend origin");
    }
  } catch {
    return apiError(503, "BACKEND_NAO_CONFIGURADO",
      "Configure BACKEND_ORIGIN com a origem do servidor Node/Express.");
  }
  origin.pathname = incoming.pathname;
  origin.search = incoming.search;
  const headers = new Headers(request.headers);
  headers.delete("Host");
  headers.set("X-Forwarded-Host", incoming.host);
  headers.set("X-Forwarded-Proto", incoming.protocol.slice(0, -1));
  headers.delete("X-Forwarded-For");
  const clientIp = request.headers.get("CF-Connecting-IP");
  if (clientIp) headers.set("X-Forwarded-For", clientIp);

  try {
    const upstream = await fetchBackend(new Request(origin, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      duplex: "half",
      redirect: "manual",
    }), { cf: { cacheTtl: 0, cacheEverything: false } });
    const response = new Response(upstream.body, upstream);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return apiError(502, "BACKEND_INDISPONIVEL",
      "Nao foi possivel conectar ao servidor da API.");
  }
}

export default { fetch: (request, env) => handleRequest(request, env) };