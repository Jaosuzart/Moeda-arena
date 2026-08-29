const express = require("express");
const router = express.Router();
const compraController = require("../controllers/compraController");
const { autenticar } = require("../middlewares/auth");
const { validarCompra } = require("../middlewares/validators");
router.post("/comprar", autenticar, validarCompra, compraController.processarCompra);
router.post("/compra/validar-cupom", autenticar, compraController.validarCupom);
module.exports = router;
