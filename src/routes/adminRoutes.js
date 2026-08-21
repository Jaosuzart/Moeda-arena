const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { autenticar } = require("../middlewares/auth");
router.use(autenticar, adminController.isAdmin);
router.get("/usuarios", adminController.listarUsuarios);
router.post("/usuarios/tokens", adminController.adicionarTokensManualmente);
router.post("/usuarios/status", adminController.alterarStatusUsuario);
module.exports = router;
