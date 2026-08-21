const { MercadoPagoConfig, Preference } = require("mercadopago");
const config = require("./src/config/env");
const logger = require("./src/config/logger");
const client = new MercadoPagoConfig({ accessToken: config.mpAccessToken });
const preference = new Preference(client);
preference
  .create({
    body: {
      items: [
        {
          id: "premium",
          title: "Profissional",
          quantity: 1,
          unit_price: 29.9,
          currency_id: "BRL",
        },
      ],
      external_reference: JSON.stringify({
        usuarioId: 6,
        planoId: "premium",
        tokens: 250,
      }),
      back_urls: {
        success: "https://www.google.com",
        failure: "https://www.google.com",
        pending: "https://www.google.com",
      },
      auto_return: "approved",
    },
  })
  .then((res) => {
    logger.info("Preferência criada com sucesso.", { preferenceId: res.id });
  })
  .catch((err) => {
    logger.error("Erro ao criar preferência no Mercado Pago:", {
      erro: JSON.stringify(err, null, 2),
    });
  });
