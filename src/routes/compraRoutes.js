const express = require("express");
const router = express.Router();
const compraController = require("../controllers/compraController");
const { autenticar, exigirEmailVerificado } = require("../middlewares/auth");
const { validarCompra } = require("../middlewares/validators");
router.post("/comprar", autenticar, exigirEmailVerificado, validarCompra, compraController.processarCompra);
router.post("/compra/validar-cupom", autenticar, exigirEmailVerificado, compraController.validarCupom);
module.exports = router;
