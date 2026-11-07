_moeda_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
_moeda_node="$_moeda_root/.cache/node-v24.19.0-win-x64"
if [[ -f "$_moeda_node/node.exe" ]]; then
  export PATH="$_moeda_node:$PATH"
elif ! command -v node >/dev/null 2>&1; then
  for _moeda_candidate in '/c/Program Files/nodejs' "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin"; do
    if [[ -f "$_moeda_candidate/node.exe" ]]; then
      export PATH="$_moeda_candidate:$PATH"
      break
    fi
  done
fi
hash -r
unset _moeda_root _moeda_node _moeda_candidate
if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' 'Node.js ausente. Instale Node.js LTS: https://nodejs.org/' >&2
  return 1
fi
node --version
if command -v npm >/dev/null 2>&1; then
  npm --version
else
  printf '%s\n' 'Node pronto. Inicie com: node server.js. Para usar npm, instale Node.js LTS com npm.'
fi
