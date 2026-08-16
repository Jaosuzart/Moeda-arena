
const express = require('express');
const router = express.Router();
const planoController = require('../controllers/planoController');

router.get('/planos', planoController.listarPlanos);

module.exports = router;
