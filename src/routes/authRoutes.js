/**
 * @module routes/authRoutes
 * @description 
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { autenticar } = require('../middlewares/auth');
const { validarRegistro, validarLogin } = require('../middlewares/validators');
const config = require('../config/env');

router.post('/registrar', validarRegistro, authController.registrar);
router.post('/login', validarLogin, authController.login);
router.post('/google', authController.loginGoogle);

router.get('/google/client-id', (req, res) => {
  res.json({ clientId: config.googleClientId });
});

router.get('/perfil', autenticar, authController.perfil);
router.put('/perfil', autenticar, authController.atualizarPerfil);
router.get('/verificar-email', authController.verificarEmail);

module.exports = router;
