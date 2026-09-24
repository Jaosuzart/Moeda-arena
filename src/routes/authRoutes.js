const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { autenticar } = require("../middlewares/auth");
const { validarRegistro, validarLogin } = require("../middlewares/validators");
const config = require("../config/env");
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { sucesso: false, erro: "Muitas tentativas. Tente novamente mais tarde.", codigo: "RATE_LIMIT_EXCEDIDO" },
});

router.post("/registrar", authLimiter, validarRegistro, authController.registrar);
router.post("/login", authLimiter, validarLogin, authController.login);
router.post("/google", authController.loginGoogle);
router.post("/logout", authController.logout);
router.get("/config", (req, res) => {
  res.json({
    clientId: config.googleClientId,
    telegramUrl: config.telegramUrl,
    whatsappUrl: config.whatsappUrl,
    mixpanelToken: config.mixpanelToken,
  });
});
router.get("/status", authController.status);
router.get("/perfil", autenticar, authController.perfil);
router.put("/perfil", autenticar, authController.atualizarPerfil);
router.post("/definir-senha", autenticar, authController.definirSenha);
router.get("/verificar-email", authController.verificarEmail);
router.post("/recuperar-senha", authController.solicitarRecuperarSenha);
router.get("/2fa/status", autenticar, authController.status2fa);
router.post("/2fa/toggle", autenticar, authController.toggle2fa);
router.post("/login/2fa", authController.verificar2fa);

module.exports = router;
