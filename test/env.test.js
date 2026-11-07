const {test}=require('node:test');
const assert=require('node:assert/strict');
const {validate}=require('../scripts/check-env.cjs');
const fixture={PORT:'3001',NODE_ENV:'production',CORS_ORIGIN:'https://example.com',DB_HOST:'localhost',DB_PORT:'3306',DB_USER:'test',DB_PASSWORD:'test',DB_NAME:'test',MP_ACCESS_TOKEN:'test',MP_WEBHOOK_SECRET:'test',JWT_SECRET:'a'.repeat(64),API_GAME_SECRET:'b'.repeat(64),ENCRYPTION_KEY:'c'.repeat(64),SMTP_HOST:'localhost',SMTP_PORT:'587',SMTP_USER:'test',SMTP_PASS:'test',DB_SSL_REJECT_UNAUTHORIZED:'true',SMTP_TLS_REJECT_UNAUTHORIZED:'true'};
test('environment check rejects missing CA without disclosing values',()=>{
 const errors=validate({...fixture,DB_SSL_CA_FILE:'missing-cert.pem',DB_PASSWORD:'private-password'});
 assert.ok(errors.some(e=>e.startsWith('DB_SSL_CA_FILE:')));
 assert.ok(!errors.join('').includes('private-password'));
});
test('environment check rejects unsafe TLS, placeholder and invalid origin',()=>{
 const errors=validate({...fixture,DB_SSL_REJECT_UNAUTHORIZED:'false',MP_ACCESS_TOKEN:'SEU_TOKEN',CORS_ORIGIN:'http://example.com'});
 for(const key of ['DB_SSL_REJECT_UNAUTHORIZED','MP_ACCESS_TOKEN','CORS_ORIGIN']) assert.ok(errors.some(e=>e.startsWith(key+':')));
});
test('environment check accepts structurally valid configuration',()=>assert.deepEqual(validate(fixture),[]));
