const express = require("express");
const { body, validationResult } = require("express-validator");
const { enviarEmailContato } = require("../services/emailService");
const logger = require("../config/logger");

const router = express.Router();

router.post(
  "/contato",
  [
    body("nome").trim().notEmpty().withMessage("Nome é obrigatório."),
    body("email").isEmail().withMessage("E-mail inválido."),
    body("mensagem").trim().notEmpty().withMessage("Mensagem é obrigatória."),
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ sucesso: false, erro: erros.array()[0].msg });
    }

    const { nome, email, mensagem } = req.body;

    try {
      const enviado = await enviarEmailContato(nome, email, mensagem);
      if (enviado) {
        return res.json({ sucesso: true, mensagem: "Mensagem enviada com sucesso." });
      } else {
        return res.status(500).json({ sucesso: false, erro: "Falha ao enviar mensagem. Tente novamente mais tarde." });
      }
    } catch (error) {
      logger.error("Erro interno na rota de contato", { error: error.message });
      return res.status(500).json({ sucesso: false, erro: "Erro interno no servidor." });
    }
  },
);

module.exports = router;
