const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { body, param } = require('express-validator');
const { tratarErrosValidacao } = require('../middlewares/validators');

router.use(gameController.validarApiKey);

router.get('/saldo/:email', [
  param('email').isEmail().withMessage('O e-mail fornecido é inválido.')
], tratarErrosValidacao, gameController.getSaldo);

router.post('/consumir', [
  body('email').isEmail().withMessage('Um e-mail válido é obrigatório.'),
  body('quantidade').isInt({ min: 1 }).withMessage('A quantidade deve ser um número inteiro maior que 0.')
], tratarErrosValidacao, gameController.consumirTokens);

router.get('/ranking', gameController.getRanking);

router.post('/stats', [
  body('email').isEmail().withMessage('Um e-mail válido é obrigatório.'),
  body('trofeus').optional().isInt(),
  body('vitorias').optional().isInt(),
  body('xp').optional().isInt()
], tratarErrosValidacao, gameController.salvarEstatisticas);

module.exports = router;
