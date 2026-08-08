const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: 'TEST-5516404168104326-080714-b490a46b2472983a08f665e71680d7e8-635609201' });

const preference = new Preference(client);

preference.create({
  body: {
    items: [{
      id: 'premium',
      title: 'Profissional',
      quantity: 1,
      unit_price: 29.90,
      currency_id: 'BRL'
    }],
    external_reference: JSON.stringify({
      usuarioId: 6,
      planoId: 'premium',
      tokens: 250
    }),
    back_urls: {
      success: 'https://www.google.com',
      failure: 'https://www.google.com',
      pending: 'https://www.google.com'
    },
    auto_return: 'approved'
  }
}).then(res => {
  console.log("SUCESSO:", res.id);
}).catch(err => {
  console.error("ERRO COMPLETO:", JSON.stringify(err, null, 2));
});
