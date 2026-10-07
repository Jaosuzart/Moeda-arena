# Execute with: source ./scripts/activate-node.sh
_moeda_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
_moeda_node="$_moeda_root/.local-tools/node-v24.21.0-win-x64"
if [[ ! -f "$_moeda_node/node.exe" ]]; then
  printf '%s\n' 'Node local ausente. Instale Node.js LTS: https://nodejs.org/' >&2
  return 1
fi
export PATH="$_moeda_node:$PATH"
hash -r
unset _moeda_root _moeda_node
node --version
npm --version
