export async function fetchAutenticado(url, opcoes = {}) {
  const headers = { "Content-Type": "application/json", ...opcoes.headers };
  return fetch(url, { ...opcoes, headers });
}
