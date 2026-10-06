const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { autenticar } = require("../middlewares/auth");
const { validarRegistro, validarLogin } = require("../middlewares/validators");
const config = require("../config/env");
const rateLimit = require("#rate-limit");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const authLimiter = rateLimit({
  identifier: "auth",
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { sucesso: false, erro: "Muitas tentativas. Tente novamente mais tarde.", codigo: "RATE_LIMIT_EXCEDIDO" },
});

const twoFactorLimiter = rateLimit({
  identifier: "two-factor",
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    let key;
    try {
      const payload = jwt.verify(req.body?.desafio, config.jwtSecret, {
        algorithms: ["HS256"], audience: "moeda-arena-2fa", issuer: "moeda-arena",
      });
      if (payload.finalidade !== "login-2fa" || !payload.usuarioId) throw new Error("Desafio inválido");
      key = `usuario:${payload.usuarioId}`;
    } catch {
      key = `invalido:${req.ip}`;
    }
    return crypto.createHash("sha256").update(key).digest("hex");
  },
  message: { sucesso: false, erro: "Muitas tentativas de código. Aguarde 10 minutos.", codigo: "RATE_LIMIT_EXCEDIDO" },
});

const recoveryLimiter = rateLimit({
  identifier: "recovery",
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { sucesso: false, erro: "Muitas solicitações. Tente novamente mais tarde.", codigo: "RATE_LIMIT_EXCEDIDO" },
});

router.post("/registrar", authLimiter, validarRegistro, authController.registrar);
router.post("/login", authLimiter, validarLogin, authController.login);
router.post("/google", authLimiter, authController.loginGoogle);
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
router.post("/recuperar-senha", recoveryLimiter, authController.solicitarRecuperarSenha);
router.post("/redefinir-senha", recoveryLimiter, authController.redefinirSenhaConfirmar);
router.get("/2fa/status", autenticar, authController.status2fa);
router.post("/2fa/toggle", authLimiter, autenticar, authController.toggle2fa);
router.post("/login/2fa", twoFactorLimiter, authController.verificar2fa);

module.exports = router;
