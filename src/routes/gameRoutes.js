const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");
const { body, param } = require("express-validator");
const { tratarErrosValidacao } = require("../middlewares/validators");
router.get(
  "/saldo/:email",
  [param("email").isEmail().withMessage("O e-mail fornecido é inválido.")],
  tratarErrosValidacao,
  gameController.validarApiKey,
  gameController.getSaldo,
);
router.post(
  "/consumir",
  [
    body("email").isEmail().withMessage("Um e-mail válido é obrigatório."),
    body("quantidade").isInt({ min: 1 }).withMessage("A quantidade deve ser um número inteiro maior que 0."),
  ],
  tratarErrosValidacao,
  gameController.validarApiKey,
  gameController.consumirMoedas,
);
router.get("/ranking", gameController.getRanking);
router.post(
  "/stats",
  [
    body("email").isEmail().withMessage("Um e-mail válido é obrigatório."),
    body("trofeus").optional().isInt({ min: 0, max: 1000000 }),
    body("vitorias").optional().isInt({ min: 0, max: 1000000 }),
    body("xp").optional().isInt({ min: 0, max: 1000000 }),
  ],
  tratarErrosValidacao,
  gameController.validarApiKey,
  gameController.salvarEstatisticas,
);
module.exports = router;
