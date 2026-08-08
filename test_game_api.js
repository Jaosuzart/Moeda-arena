const http = require('http');

const SECRET = 'minha_senha_secreta_jogos_123';
const EMAIL = 'joaomarcelosuzartcastro@gmail.com'; 

const reqGet = http.request(`http://localhost:3001/api/games/saldo/${EMAIL}?api_key=${SECRET}`, { method: 'GET' }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('\n--- GET SALDO ---');
    console.log(`Status: ${res.statusCode}`);
    console.log(data);

    const postData = JSON.stringify({ email: EMAIL, quantidade: 1 });
    const reqPost = http.request('http://localhost:3001/api/games/consumir', {
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
        console.log('\n--- POST CONSUMIR ---');
        console.log(`Status: ${resPost.statusCode}`);
        console.log(dataPost);
      });
    });
    
    reqPost.write(postData);
    reqPost.end();

  });
});

reqGet.end();
