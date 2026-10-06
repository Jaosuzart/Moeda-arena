const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Altera o diretório de cache para dentro da pasta do projeto
  // Isso resolve o erro do Render.com que apaga/não encontra a pasta /opt/render/.cache
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
