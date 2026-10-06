const express = require("express");
const { body, validationResult } = require("express-validator");
const { enviarEmailContato } = require("../services/emailService");
const logger = require("../config/logger");

const router = express.Router();

router.post(
  "/contato",
  [
    body("nome").trim().notEmpty().isLength({ max: 100 }).withMessage("Nome inválido."),
    body("email").isEmail().withMessage("E-mail inválido."),
    body("mensagem").trim().notEmpty().isLength({ max: 5000 }).withMessage("Mensagem inválida."),
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

router.get("/whatsapp", (req, res) => {
  const telefone = process.env.WHATSAPP_NUMBER || "5511999999999"; 
  const mensagem = "olá, seja bem-vindo ao moeda arena";
  
  const mensagemCodificada = encodeURIComponent(mensagem);
  const linkWhatsApp = `https://wa.me/${telefone}?text=${mensagemCodificada}`;
    res.redirect(linkWhatsApp);
});

module.exports = router;
