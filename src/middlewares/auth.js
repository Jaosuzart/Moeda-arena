
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { erro } = require('../helpers/apiResponse');

const autenticar = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return erro(res, 'Token de autenticação não fornecido. Faça login primeiro.', 401, 'NAO_AUTENTICADO');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.usuario = {
      id: payload.id,
      email: payload.email,
      nome: payload.nome
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return erro(res, 'Sessão expirada. Faça login novamente.', 401, 'TOKEN_EXPIRADO');
    }
    return erro(res, 'Token inválido.', 401, 'TOKEN_INVALIDO');
  }
};

module.exports = { autenticar };
