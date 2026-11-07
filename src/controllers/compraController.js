const planoModel = require("../models/planoModel");
const usuarioModel = require("../models/usuarioModel");
const cupomModel = require("../models/cupomModel");
const { MercadoPagoConfig, Preference } = require("mercadopago");
const crypto = require("crypto");
const config = require("../config/env");
const logger = require("../config/logger");
const { sucesso, erro } = require("../helpers/apiResponse");
const pagamentoModel = require("../models/pagamentoModel");
const { pool } = require("../models/db");
const { signPaymentReference } = require("../helpers/security");
const client = new MercadoPagoConfig({ accessToken: config.mpAccessToken });
const validarCupom = async (req, res, next) => {
  const { codigo } = req.body;
  if (!codigo || typeof codigo !== "string" || codigo.trim().length === 0 || codigo.trim().length > 30) {
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
  const { planoId, metodoPagamento, cupom } = req.body;
  const usuarioId = req.usuario.id;
  try {
    const planoEscolhido = planoModel.obterPlanoPorId(planoId);
    if (!planoEscolhido) {
      return erro(res, "Plano não encontrado.", 404, "PLANO_NAO_ENCONTRADO");
    }
    if (planoEscolhido.isGratis) {
      const conexao = await pool.getConnection();
      try {
        await conexao.beginTransaction();
        await pagamentoModel.registrarPagamento(
          `gratis:${usuarioId}`,
          usuarioId,
          planoEscolhido.id,
          planoEscolhido.moedas,
          0,
          "approved",
          conexao,
        );
        const [resultado] = await conexao.query(
          "UPDATE usuarios SET saldo_moedas = saldo_moedas + ? WHERE id = ?",
          [planoEscolhido.moedas, usuarioId],
        );
        if (resultado.affectedRows !== 1) throw new Error("Usuário não encontrado para resgate.");
        await conexao.commit();
      } catch (err) {
        await conexao.rollback();
        if (err.code === "ER_DUP_ENTRY") {
          return erro(res, "O benefício grátis já foi resgatado nesta conta.", 409, "GRATIS_JA_RESGATADO");
        }
        throw err;
      } finally {
        conexao.release();
      }
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
    if (cupom && typeof cupom === "string" && cupom.trim().length > 0 && cupom.trim().length <= 30) {
      const cupomDb = await cupomModel.buscarPorCodigo(cupom);
      if (cupomDb) {
        const percentual = Number(cupomDb.desconto_percentual);
        if (!Number.isFinite(percentual) || percentual < 0 || percentual > 100) {
          return erro(res, "Cupom com desconto inválido.", 400, "CUPOM_INVALIDO");
        }
        const desconto = Math.round((precoFinal * percentual) / 100);
        precoFinal = precoFinal - desconto;
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
    if (!Number.isSafeInteger(precoFinal) || precoFinal < 1) {
      return erro(res, "O valor final da compra é inválido.", 400, "VALOR_INVALIDO");
    }
    const referenciaAssinada = signPaymentReference({
      usuarioId,
      planoId: planoEscolhido.id,
      valorCentavos: precoFinal,
      moeda: "BRL",
      cupom: cupomAplicado,
      nonce: crypto.randomBytes(16).toString("hex"),
    });
    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: [
          {
            id: planoEscolhido.id,
            title: planoEscolhido.nome,
            quantity: 1,
            unit_price: precoFinal / 100,
            currency_id: "BRL",
          },
        ],
        external_reference: referenciaAssinada,
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
