import { test } from "node:test";
import assert from "node:assert/strict";
import { handleRequest } from "../src/worker.mjs";

const env = { BACKEND_ORIGIN: "https://backend.example" };
const request = (path, options) => new Request(`https://arena.example${path}`, options);

test("static files use ASSETS without contacting the API", async () => {
  const response = await handleRequest(request("/index.html"), {
    ASSETS: { fetch: () => new Response("site") },
  }, () => assert.fail("unexpected backend request"));
  assert.equal(await response.text(), "site");
});

test("all reported API paths reach the backend with query strings", async () => {
  for (const path of ["/api/auth/status", "/api/estatisticas", "/api/planos", "/api/auth/config", "/api/game/ranking?limite=10"]) {
    const response = await handleRequest(request(path), env, async (forwarded) => {
      assert.equal(forwarded.url, `https://backend.example${path}`);
      return Response.json({ sucesso: true });
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
});

test("POST preserves body and authentication, and returns login cookies", async () => {
  const response = await handleRequest(request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: "token=session", Authorization: "Bearer session", "CF-Connecting-IP": "192.0.2.1", "X-Forwarded-For": "spoofed" },
    body: JSON.stringify({ email: "test@example.com", senha: "test" }),
  }), env, async (forwarded) => {
    assert.equal(forwarded.method, "POST");
    assert.equal(forwarded.headers.get("cookie"), "token=session");
    assert.equal(forwarded.headers.get("authorization"), "Bearer session");
    assert.equal(forwarded.headers.get("x-forwarded-for"), "192.0.2.1");
    assert.equal(forwarded.headers.get("x-forwarded-proto"), "https");
    assert.equal(forwarded.redirect, "manual");
    assert.deepEqual(await forwarded.json(), { email: "test@example.com", senha: "test" });
    return new Response("ok", { status: 201, headers: { "Set-Cookie": "token=new; HttpOnly; Secure; SameSite=Strict; Path=/" } });
  });
  assert.equal(response.status, 201);
  assert.match(response.headers.get("set-cookie"), /token=new/);
});

test("invalid or recursive origins return 503 without calling the backend", async () => {
  for (const origin of [undefined, "invalid", "http://backend.example", "https://arena.example", "https://user:pass@backend.example", "https://backend.example/api", "https://backend.example?x=1"]) {
    const response = await handleRequest(request("/api/planos"), { BACKEND_ORIGIN: origin }, () => assert.fail("invalid origin forwarded"));
    assert.equal(response.status, 503);
    assert.equal((await response.json()).codigo, "BACKEND_NAO_CONFIGURADO");
  }
});

test("unavailable backend returns a JSON 502", async () => {
  const response = await handleRequest(request("/api/planos"), env, () => { throw new Error("offline"); });
  assert.equal(response.status, 502);
  assert.equal((await response.json()).codigo, "BACKEND_INDISPONIVEL");
});

test("backend errors and redirects are preserved", async () => {
  for (const status of [401, 404, 429, 500, 302]) {
    const response = await handleRequest(request("/api/test"), env, () => new Response("upstream", { status, headers: { Location: "/login" } }));
    assert.equal(response.status, status);
    assert.equal(await response.text(), "upstream");
    assert.equal(response.headers.get("location"), "/login");
  }
});

test("double slashes cannot change the configured backend host", async () => {
  await handleRequest(request("/api//other.example/test"), env, (forwarded) => {
    assert.equal(new URL(forwarded.url).host, "backend.example");
    return new Response("ok");
  });
});