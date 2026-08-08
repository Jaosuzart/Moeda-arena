/**
 * @module routes/webhookRoutes
 * @description Rota do webhook do Mercado Pago.
 *              Não requer autenticação JWT (chamada pelo MP diretamente).
 */
const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.post('/mercadopago', webhookController.processarNotificacao);

module.exports = router;
