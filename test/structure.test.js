const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
test('deployment and preview point to existing project resources', () => {
  const deployment = JSON.parse(fs.readFileSync(path.join(root,'wrangler.jsonc'),'utf8'));
  assert.ok(fs.statSync(path.resolve(root,deployment.main)).isFile());
  assert.ok(fs.statSync(path.resolve(root,deployment.assets.directory,'index.html')).isFile());
  const html = fs.readFileSync(path.join(root,'public/index.html'),'utf8');
  for (const [,resource] of html.matchAll(/(?:src|href)="(\/[^"?#]+)"/g)) {
    if (resource === '/' || resource.startsWith('/api/')) continue;
    assert.ok(fs.statSync(path.join(root,'public',resource)).isFile(),resource);
  }
});
test('all relative source imports resolve after moving the backend and infrastructure', () => {
 function visit(dir) {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
   const file = path.join(dir,entry.name);
   if (entry.isDirectory()) { visit(file); continue; }
   if (!/\.(js|cjs|mjs)$/.test(file)) continue;
   const source = fs.readFileSync(file,'utf8');
   for (const match of source.matchAll(/(?:require\(\s*|from\s+)["'](\.[^"']+)["']/g)) {
    const target = path.resolve(path.dirname(file),match[1]);
    assert.ok([target,target+'.js',target+'.cjs',target+'.mjs',path.join(target,'index.js')].some(f=>fs.existsSync(f)), file+': '+match[1]);
   }
  }
 }
 visit(path.join(root,'src'));
});

test('layer boundaries and dependency graph stay valid', () => {
  const graph = new Map();
  function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) { scan(file); continue; }
      if (!/\.(js|cjs|mjs)$/.test(file)) continue;
      const edges = [];
      const relative = path.relative(root, file).split(path.sep).join('/');
      for (const [, specifier] of fs.readFileSync(file, 'utf8').matchAll(/(?:require\(\s*|from\s+|import\(\s*)["'](\.[^"']+)["']/g)) {
        const base = path.resolve(path.dirname(file), specifier);
        const target = [base, base+'.js', base+'.mjs', base+'.cjs', path.join(base,'index.js')].find(p => fs.existsSync(p) && fs.statSync(p).isFile());
        assert.ok(target, `${relative}: missing ${specifier}`);
        edges.push(target);
        const destination = path.relative(root, target).split(path.sep).join('/');
        if (relative.startsWith('src/frontend/')) assert.ok(destination.startsWith('src/frontend/'), `${relative} imports server code`);
        if (relative.startsWith('src/backend/')) assert.ok(!destination.startsWith('src/frontend/'), `${relative} imports browser code`);
        if (relative.startsWith('src/backend/domain/')) assert.ok(destination.startsWith('src/backend/domain/'), `${relative} domain depends on infrastructure`);
        if (/^src\/backend\/(repositories|database|integrations)\//.test(relative)) assert.ok(!/^src\/backend\/(controllers|routes|middlewares|services)\//.test(destination), `${relative} has inverted dependency`);
      }
      graph.set(file, edges);
    }
  }
  scan(path.join(root,'src'));
  scan(path.join(root,'scripts'));
  const visiting = new Set(), visited = new Set();
  function visit(file) {
    assert.ok(!visiting.has(file), `Circular import: ${path.relative(root,file)}`);
    if (visited.has(file)) return;
    visiting.add(file);
    for (const target of graph.get(file) || []) visit(target);
    visiting.delete(file); visited.add(file);
  }
  for (const file of graph.keys()) visit(file);
});
