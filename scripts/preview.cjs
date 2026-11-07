const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../public');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server = http.createServer((req,res) => {
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end('Invalid URL'); }
  if (pathname.startsWith('/api/')) { res.writeHead(503, {'Content-Type':'application/json'}); return res.end(JSON.stringify({message:'Previa visual: inicie o sistema completo para usar esta funcao.'})); }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  fs.stat(file, (err,stat) => {
    if (err || !stat.isFile()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
    if (req.method === 'HEAD') return res.end();
    const stream = fs.createReadStream(file);
    stream.on('error', () => res.destroy()); stream.pipe(res);
  });
});
server.on('error', err => { console.error('Nao foi possivel abrir a previa:', err.message); process.exitCode = 1; });
server.listen(0, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${server.address().port}`;
  console.log(`Moeda Arena - previa visual: ${url}\nLogin e pagamentos exigem o sistema completo. Ctrl+C para encerrar.`);
  if (process.platform === 'win32' && !process.env.PREVIEW_NO_OPEN) require('node:child_process').spawn('cmd.exe', ['/c','start','',url], {stdio:'ignore'});
});
