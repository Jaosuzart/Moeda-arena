const http = require('http');
const config = require('./src/config/env');
const logger = require('./src/config/logger');

const SECRET = config.apiGameSecret;
const EMAIL = config.adminEmail; 

const reqGet = http.request(`http://localhost:${config.port}/api/games/saldo/${EMAIL}?api_key=${SECRET}`, { method: 'GET' }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    logger.info('--- GET SALDO ---', { status: res.statusCode, resposta: data });

    const postData = JSON.stringify({ email: EMAIL, quantidade: 1 });
    const reqPost = http.request(`http://localhost:${config.port}/api/games/consumir`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SECRET,
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (resPost) => {
      let dataPost = '';
      resPost.on('data', chunk => dataPost += chunk);
      resPost.on('end', () => {
        logger.info('--- POST CONSUMIR ---', { status: resPost.statusCode, resposta: dataPost });
      });
    });

    reqPost.write(postData);
    reqPost.end();

  });
});

reqGet.on('error', (err) => {
  logger.error('Erro na requisição GET:', { erro: err.message });
});

reqGet.end();
