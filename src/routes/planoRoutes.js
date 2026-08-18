
const express = require('express');
const router = express.Router();
const planoController = require('../controllers/planoController');

router.get('/planos', planoController.listarPlanos);
router.get('/estatisticas', planoController.obterEstatisticas);

module.exports = router;
