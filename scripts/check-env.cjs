const fs = require('node:fs');
const path = require('node:path');
const { X509Certificate } = require('node:crypto');
const dotenv = require('dotenv');
const root = path.resolve(__dirname, '..');
function validate(env, base = root) {
  const errors = [];
  const required = ['PORT','NODE_ENV','CORS_ORIGIN','DB_HOST','DB_PORT','DB_USER','DB_PASSWORD','DB_NAME','MP_ACCESS_TOKEN','MP_WEBHOOK_SECRET','JWT_SECRET','API_GAME_SECRET','ENCRYPTION_KEY','SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS'];
  for (const key of required) {
    if (!env[key] || /^(SEU_|SUA_|GERE_|PREENCHA|CHANGE_ME)/i.test(env[key])) errors.push(`${key}: ausente ou exemplo.`);
  }
  for (const key of ['PORT','DB_PORT','SMTP_PORT']) if (!/^\d+$/.test(env[key] || '') || +env[key]<1 || +env[key]>65535) errors.push(`${key}: porta inválida.`);
  for (const key of ['JWT_SECRET','API_GAME_SECRET']) if ((env[key] || '').length < 32) errors.push(`${key}: use pelo menos 32 caracteres.`);
  if ((env.ENCRYPTION_KEY || '').length < 16) errors.push('ENCRYPTION_KEY: inválida. Preserve a chave original de dados existentes.');
  for (const key of ['CORS_ORIGIN','BACKEND_ORIGIN']) {
    if (!env[key] && key === 'BACKEND_ORIGIN') continue;
    try { const u = new URL(env[key]); if (!['http:','https:'].includes(u.protocol) || u.username || u.password || u.pathname !== '/' || u.search || u.hash || (env.NODE_ENV==='production' && u.protocol!=='https:')) throw Error(); }
    catch { errors.push(`${key}: origem HTTP/HTTPS inválida (HTTPS obrigatório em produção).`); }
  }
  if (!['development','test','production'].includes(env.NODE_ENV)) errors.push('NODE_ENV: ambiente inválido.');
  for (const key of ['DB_SSL_REJECT_UNAUTHORIZED','SMTP_TLS_REJECT_UNAUTHORIZED']) if (env[key] !== 'true') errors.push(`${key}: deve ser true para verificar certificados.`);
  if (env.DB_SSL_CA_FILE) {
    try {
      const cert = new X509Certificate(fs.readFileSync(path.resolve(base,env.DB_SSL_CA_FILE)));
      if (Date.now() > Date.parse(cert.validTo) || Date.now() < Date.parse(cert.validFrom)) errors.push('DB_SSL_CA_FILE: certificado fora da validade.');
    } catch { errors.push('DB_SSL_CA_FILE: certificado ausente ou inválido. Obtenha o CA original no provedor do banco.'); }
  }
  return errors;
}
if (require.main === module) {
  if (!fs.existsSync(path.join(root,'.env'))) { console.error('Falta .env na raiz.'); process.exitCode=1; }
  else {
    const env={...dotenv.parse(fs.readFileSync(path.join(root,'.env'))),...process.env};
    const errors=validate(env);
    for(const message of errors) console.error('ERRO: '+message);
    if(errors.length) process.exitCode=1;
    else console.log('Configuração local válida. Credenciais e serviços externos ainda precisam de verificação.');
  }
}
module.exports={validate};
