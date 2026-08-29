const planoModel = require("../models/planoModel");
const usuarioModel = require("../models/usuarioModel");
const cupomModel = require("../models/cupomModel");
const { MercadoPagoConfig, Preference } = require("mercadopago");
const config = require("../config/env");
const logger = require("../config/logger");
const { sucesso, erro } = require("../helpers/apiResponse");
const client = new MercadoPagoConfig({ accessToken: config.mpAccessToken });
const validarCupom = async (req, res, next) => {
  const { codigo } = req.body;
  if (!codigo || typeof codigo !== "string" || codigo.trim().length === 0) {
    return erro(res, "Informe um código de cupom válido.", 400, "CUPOM_INVALIDO");
  }
  try {
    const cupom = await cupomModel.buscarPorCodigo(codigo);
    if (!cupom) {
      return erro(res, "Cupom não encontrado ou expirado.", 404, "CUPOM_NAO_ENCONTRADO");
    }
    logger.info("Cupom validado com sucesso.", {
      codigo: cupom.codigo,
      desconto: cupom.desconto_percentual,
    });
    return sucesso(res, {
      codigo: cupom.codigo,
      desconto_percentual: cupom.desconto_percentual,
      mensagem: `Cupom "${cupom.codigo}" aplicado! Você ganhou ${cupom.desconto_percentual}% de desconto.`,
    });
  } catch (err) {
    logger.error("Erro ao validar cupom:", { erro: err.message, codigo });
    next(err);
  }
};
const processarCompra = async (req, res, next) => {
  const { planoId, metodoPagamento, isGratis, cupom } = req.body;
  const usuarioId = req.usuario.id;
  try {
    const planoEscolhido = planoModel.obterPlanoPorId(planoId);
    if (!planoEscolhido) {
      return erro(res, "Plano não encontrado.", 404, "PLANO_NAO_ENCONTRADO");
    }
    if (isGratis && planoEscolhido.isGratis) {
      await usuarioModel.adicionarMoedas(usuarioId, planoEscolhido.moedas);
      logger.info("Resgate de plano gratuito concluído.", {
        usuarioId,
        planoId,
        moedas: planoEscolhido.moedas,
      });
      return sucesso(
        res,
        {
          mensagem: `Resgate do ${planoEscolhido.nome} concluído! ${planoEscolhido.moedas} moedas creditados na sua conta.`,
        },
        201,
      );
    }
    if (!metodoPagamento) {
      return erro(res, "Método de pagamento é obrigatório para planos pagos.", 400, "PAGAMENTO_OBRIGATORIO");
    }
    let precoFinal = planoEscolhido.precoMensal;
    let cupomAplicado = null;
    if (cupom && typeof cupom === "string" && cupom.trim().length > 0) {
      const cupomDb = await cupomModel.buscarPorCodigo(cupom);
      if (cupomDb) {
        const desconto = (precoFinal * cupomDb.desconto_percentual) / 100;
        precoFinal = parseFloat((precoFinal - desconto).toFixed(2));
        cupomAplicado = cupomDb.codigo;
        logger.info("Cupom de desconto aplicado na compra.", {
          cupom: cupomAplicado,
          descontoPercent: cupomDb.desconto_percentual,
          precoOriginal: planoEscolhido.precoMensal,
          precoFinal,
          usuarioId,
        });
      }
    }
    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: [
          {
            id: planoEscolhido.id,
            title: planoEscolhido.nome,
            quantity: 1,
            unit_price: precoFinal,
            currency_id: "BRL",
          },
        ],
        external_reference: JSON.stringify({
          usuarioId: usuarioId,
          planoId: planoEscolhido.id,
          moedas: planoEscolhido.moedas,
          cupom: cupomAplicado,
        }),
        back_urls: {
          success: config.corsOrigin,
          failure: config.corsOrigin,
          pending: config.corsOrigin,
        },
        auto_return: config.corsOrigin.startsWith("https") ? "approved" : undefined,
      },
    });
    logger.info("Preferência de pagamento criada no Mercado Pago.", {
      preferenceId: response.id,
      usuarioId,
      planoId: planoEscolhido.id,
      valor: precoFinal,
      cupom: cupomAplicado,
    });
    return sucesso(res, {
      mensagem: "Redirecionando para o ambiente seguro do Mercado Pago...",
      urlCheckout: response.init_point,
    });
  } catch (err) {
    logger.error("Erro ao processar compra:", {
      erro: err.message,
      usuarioId,
      planoId,
    });
    next(err);
  }
};
module.exports = { processarCompra, validarCupom };
