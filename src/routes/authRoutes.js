
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { autenticar } = require('../middlewares/auth');
const { validarRegistro, validarLogin } = require('../middlewares/validators');
const config = require('../config/env');

router.post('/registrar', validarRegistro, authController.registrar);
router.post('/login', validarLogin, authController.login);
router.post('/google', authController.loginGoogle);

router.get('/config', (req, res) => {
  res.json({ 
    clientId: config.googleClientId,
    telegramUrl: config.telegramUrl,
    whatsappUrl: config.whatsappUrl
  });
});

router.get('/perfil', autenticar, authController.perfil);
router.put('/perfil', autenticar, authController.atualizarPerfil);
router.post('/definir-senha', autenticar, authController.definirSenha);
router.get('/verificar-email', authController.verificarEmail);

router.post('/recuperar-senha', authController.solicitarRecuperarSenha);
router.post('/redefinir-senha', authController.redefinirSenhaConfirmar);

module.exports = router;
