const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
let failed = false;
function scan(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(file);
    else if (/\.(?:js|cjs|mjs)$/.test(file)) {
      const result = spawnSync(process.execPath, ['--check',file], {stdio:'inherit'});
      if (result.status !== 0) failed = true;
    }
  }
}
for (const dir of ['src','scripts','test']) scan(path.join(root,dir));
if (spawnSync(process.execPath,['--check',path.join(root,'server.js')],{stdio:'inherit'}).status !== 0) failed = true;
process.exitCode = failed ? 1 : 0;
