const {
  MercadoPagoConfig,
  Payment,
  WebhookSignatureValidator,
} = require("mercadopago");

const config =
  require("../config/env");

const logger =
  require("../config/logger");

const usuarioModel =
  require("../models/usuarioModel");

const pagamentoModel =
  require("../models/pagamentoModel");

const whatsappService =
  require("../services/whatsappService");

const emailService =
  require("../services/emailService");

const cupomModel =
  require("../models/cupomModel");

const planoModel =
  require("../models/planoModel");

const { verifyPaymentReference } =
  require("../helpers/security");

const {
  pool,
} = require("../models/db");

const mpClient = new MercadoPagoConfig({
  accessToken: config.mpAccessToken,
});

const notificarUsuario = async (
  usuario,
  valor,
  moedas,
) => {
  if (usuario.telefone) {
    const msg =
      `✅ Olá ${usuario.nome}! ` +
      `Seu pagamento de R$ ${valor} foi aprovado! 🎉\n\n` +
      `Creditamos ${moedas} moedas na sua conta da Moeda Arena.`;

    whatsappService
      .enviarMensagem(
        usuario.telefone,
        msg,
      )
      .catch((err) => {
        logger.error(
          "Falha ao enviar WhatsApp.",
          {
            erro: err.message,
          },
        );
      });
  }

  if (usuario.email) {
    emailService
      .enviarEmailRecibo(
        usuario.email,
        usuario.nome,
        valor,
        moedas,
      )
      .catch((err) => {
        logger.error(
          "Falha ao enviar e-mail de recibo.",
          {
            erro: err.message,
          },
        );
      });
  }
};

const processarAfiliado = async (
  usuarioId,
  tokensComprados,
) => {
  try {
    const usuario =
      await usuarioModel.buscarPorId(
        usuarioId,
      );

    if (
      !usuario ||
      !usuario.indicado_por
    ) {
      return;
    }

    const comissao =
      Math.floor(tokensComprados * 0.05);

    if (comissao <= 0) {
      return;
    }

    await usuarioModel.adicionarMoedas(
      usuario.indicado_por,
      comissao,
    );

    await pool.query(
      `
        UPDATE usuarios
        SET ganhos_afiliado =
          ganhos_afiliado + ?
        WHERE id = ?
      `,
      [
        comissao,
        usuario.indicado_por,
      ],
    );

    logger.info(
      "Comissão de afiliado paga.",
      {
        indicador:
          usuario.indicado_por,
        comissao,
      },
    );
  } catch (err) {
    logger.error(
      "Erro não fatal ao processar comissão de afiliado.",
      {
        erro: err.message,
        usuarioId,
      },
    );
  }
};

const processarNotificacao = async (
  req,
  res,
) => {
  const evento = req.body;

  const {
    topic,
    id,
  } = req.query;

  const tipoEvento =
    topic || evento?.type;

  const idPagamento =
    req.query["data.id"] || id || evento?.data?.id;

  if (
    tipoEvento !== "payment" ||
    !idPagamento
  ) {
    logger.debug(
      "Webhook ignorado: tipo não é payment.",
      {
        tipo: tipoEvento,
      },
    );

    return res
      .status(200)
      .send("Ignorado");
  }

  if (!config.mpWebhookSecret) {
    logger.error(
      "Erro crítico: mpWebhookSecret não configurado no servidor.",
    );

    return res
      .status(500)
      .send(
        "Internal Server Error",
      );
  }

  try {
    WebhookSignatureValidator.validate({
      xSignature: req.headers["x-signature"],
      xRequestId: req.headers["x-request-id"],
      dataId: String(idPagamento),
      secret: config.mpWebhookSecret,
    });
  } catch {
    logger.warn("Assinatura do webhook inválida.", { paymentId: String(idPagamento) });
    return res.status(401).send("Invalid signature");
  }

  try {
    logger.info(
      "Webhook de pagamento recebido.",
      {
        paymentId:
          idPagamento,
      },
    );

    const paymentApi =
      new Payment(mpClient);

    const pagamento =
      await paymentApi.get({
        id: idPagamento,
      });

    if (
      pagamento.status !==
      "approved"
    ) {
      logger.info(
        "Pagamento não aprovado. Nenhuma ação necessária.",
        {
          paymentId:
            idPagamento,
          status:
            pagamento.status,
        },
      );

      return res
        .status(200)
        .send(
          "Ignorado - Nao aprovado",
        );
    }

    const referencia = verifyPaymentReference(pagamento.external_reference);
    if (!referencia) {
      logger.error(
        "Referência de pagamento inválida ou sem assinatura.",
        {
          paymentId:
            idPagamento,
        },
      );

      return res.status(400).send("Referencia invalida");
    }

    const {
      usuarioId,
      planoId,
      cupom,
      valorCentavos,
      moeda,
    } = referencia;

    const plano =
      planoModel.obterPlanoPorId(
        planoId,
      );

    if (!plano) {
      logger.error(
        "Plano inválido fornecido no webhook.",
        {
          planoId,
        },
      );

      return res
        .status(400)
        .send(
          "Plano invalido",
        );
    }

    const valorRecebidoCentavos = Math.round(Number(pagamento.transaction_amount) * 100);
    if (
      !Number.isSafeInteger(valorRecebidoCentavos) ||
      valorRecebidoCentavos !== valorCentavos ||
      pagamento.currency_id !== moeda
    ) {
      logger.error("Pagamento recusado por divergência de valor ou moeda.", {
        paymentId: idPagamento,
        valorEsperadoCentavos: valorCentavos,
        valorRecebidoCentavos,
        moedaEsperada: moeda,
        moedaRecebida: pagamento.currency_id,
      });
      return res.status(400).send("Pagamento divergente");
    }

    const moedas =
      plano.moedas;

    const conexao =
      await pool.getConnection();

    try {
      await conexao.beginTransaction();

      await pagamentoModel.registrarPagamento(
        idPagamento,
        usuarioId,
        planoId,
        moedas,
        pagamento.transaction_amount || 0,
        "approved",
        conexao,
      );

      const [resultadoCredito] =
        await conexao.query(
          `
            UPDATE usuarios
            SET saldo_moedas =
              saldo_moedas + ?
            WHERE id = ?
          `,
          [
            moedas,
            usuarioId,
          ],
        );

      if (
        resultadoCredito.affectedRows === 0
      ) {
        throw new Error(
          "Usuário não encontrado para creditar moedas.",
        );
      }

      await conexao.commit();
    } catch (err) {
      await conexao.rollback();

      if (
        err.code ===
        "ER_DUP_ENTRY"
      ) {
        logger.info(
          "Pagamento já processado. Ignorando duplicata.",
          {
            paymentId:
              idPagamento,
          },
        );

        return res
          .status(200)
          .send(
            "Duplicata",
          );
      }

      throw err;
    } finally {
      conexao.release();
    }

    if (cupom) {
      cupomModel
        .incrementarUso(
          cupom,
        )
        .catch((err) => {
          logger.error(
            "Erro ao registrar uso do cupom (não crítico).",
            {
              cupom,
              erro: err.message,
            },
          );
        });
    }

    await processarAfiliado(
      usuarioId,
      moedas,
    );

    const usuario =
      await usuarioModel.buscarPorId(
        usuarioId,
      );

    if (usuario) {
      await notificarUsuario(
        usuario,
        pagamento.transaction_amount,
        moedas,
      );
    }

    logger.info(
      "Pagamento processado e moedas creditadas.",
      {
        paymentId:
          idPagamento,
        usuarioId,
        planoId,
        moedas,
      },
    );

    return res
      .status(200)
      .send("OK");
  } catch (err) {
    logger.error(
      "Erro crítico ao processar webhook.",
      {
        erro:
          err.message,
        stack:
          err.stack,
      },
    );

    return res
      .status(500)
      .send(
        "Internal Server Error",
      );
  }
};

module.exports = {
  processarNotificacao,
};
