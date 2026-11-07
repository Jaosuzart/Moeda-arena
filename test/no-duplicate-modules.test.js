const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../src/backend');
test('não manter camadas legadas duplicadas', () => {
  for (const legacy of ['models', 'helpers', 'services/emailService.js', 'services/whatsappService.js', 'runtime/background.js']) {
    assert.equal(fs.existsSync(path.join(root, legacy)), false, `Módulo duplicado: ${legacy}`);
  }
  for (const current of ['repositories/usuarioRepository.js','database/db.js','domain/paymentAmounts.js','integrations/emailService.js','integrations/whatsappService.js','services/paymentSettlement.js']) {
    assert.equal(fs.existsSync(path.join(root,current)),true,`Módulo principal ausente: ${current}`);
  }
});
