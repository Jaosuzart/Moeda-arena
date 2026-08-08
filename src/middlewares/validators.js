/**
 * @module middlewares/validators
 * @description 
 */
const { body, validationResult } = require('express-validator');
const { erro } = require('../helpers/apiResponse');


const tratarErrosValidacao = (req, res, next) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    const mensagens = erros.array().map(e => e.msg).join('; ');
    return erro(res, mensagens, 400, 'VALIDACAO_FALHOU');
  }
  next();
};

const validarCompra = [
  body('planoId')
    .notEmpty().withMessage('O ID do plano é obrigatório.')
    .isString().withMessage('O ID do plano deve ser texto.')
    .trim(),
  body('metodoPagamento')
    .optional()
    .isString().withMessage('O método de pagamento deve ser texto.')
    .isIn(['Pix', 'Cartão Virtual']).withMessage('Método de pagamento inválido. Use "Pix" ou "Cartão Virtual".'),
  body('isGratis')
    .isBoolean().withMessage('O campo isGratis deve ser verdadeiro ou falso.'),
  tratarErrosValidacao
];

const validarRegistro = [
  body('nome')
    .trim()
    .notEmpty().withMessage('O nome é obrigatório.')
    .isLength({ min: 2, max: 100 }).withMessage('O nome deve ter entre 2 e 100 caracteres.'),
  body('email')
    .trim()
    .notEmpty().withMessage('O email é obrigatório.')
    .isEmail().withMessage('Formato de email inválido.'),
  body('senha')
    .notEmpty().withMessage('A senha é obrigatória.')
    .isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres.'),
  tratarErrosValidacao
];

const validarLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('O email é obrigatório.')
    .isEmail().withMessage('Formato de email inválido.'),
  body('senha')
    .notEmpty().withMessage('A senha é obrigatória.'),
  tratarErrosValidacao
];

module.exports = { validarCompra, validarRegistro, validarLogin, tratarErrosValidacao };
