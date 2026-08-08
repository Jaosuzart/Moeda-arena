/**
 * @module controllers/compraController
 * @description Controller de compras.
 *              Processa resgates gratuitos e gera preferências de pagamento
 *              no Mercado Pago, incluindo external_reference para identificar
 *              o usuário no webhook.
 */
const planoModel = require('../models/planoModel');
const usuarioModel = require('../models/usuarioModel');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const config = require('../config/env');
const logger = require('../config/logger');
const { sucesso, erro } = require('../helpers/apiResponse');

const client = new MercadoPagoConfig({ accessToken: config.mpAccessToken });
const processarCompra = async (req, res, next) => {
  const { planoId, metodoPagamento, isGratis } = req.body;
  const usuarioId = req.usuario.id;

  try {
    const planoEscolhido = planoModel.obterPlanoPorId(planoId);

    if (!planoEscolhido) {
      return erro(res, 'Plano não encontrado.', 404, 'PLANO_NAO_ENCONTRADO');
    }

    if (isGratis && planoEscolhido.isGratis) {
      await usuarioModel.adicionarTokens(usuarioId, planoEscolhido.tokens);

      logger.info('Resgate de plano gratuito concluído.', {
        usuarioId,
        planoId,
        tokens: planoEscolhido.tokens
      });

      return sucesso(res, {
        mensagem: `Resgate do ${planoEscolhido.nome} concluído! ${planoEscolhido.tokens} tokens creditados na sua conta.`
      }, 201);
    }

    if (!metodoPagamento) {
      return erro(res, 'Método de pagamento é obrigatório para planos pagos.', 400, 'PAGAMENTO_OBRIGATORIO');
    }

    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: [{
          id: planoEscolhido.id,
          title: planoEscolhido.nome,
          quantity: 1,
          unit_price: planoEscolhido.precoMensal,
          currency_id: 'BRL'
        }],
        external_reference: JSON.stringify({
          usuarioId: usuarioId,
          planoId: planoEscolhido.id,
          tokens: planoEscolhido.tokens
        }),
        back_urls: {
          success: config.corsOrigin,
          failure: config.corsOrigin,
          pending: config.corsOrigin
        },
        auto_return: config.corsOrigin.startsWith('https') ? 'approved' : undefined
      }
    });

    logger.info('Preferência de pagamento criada no Mercado Pago.', {
      preferenceId: response.id,
      usuarioId,
      planoId: planoEscolhido.id,
      valor: planoEscolhido.precoMensal
    });

    return sucesso(res, {
      mensagem: 'Redirecionando para o ambiente seguro do Mercado Pago...',
      urlCheckout: response.init_point
    });

  } catch (err) {
    logger.error('Erro ao processar compra:', {
      erro: err.message,
      usuarioId,
      planoId
    });
    next(err);
  }
};

module.exports = { processarCompra };
