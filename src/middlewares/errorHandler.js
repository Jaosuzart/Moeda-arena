/**
 * @module middlewares/errorHandler
 * @description 
 */
const logger = require('../config/logger');
const errorHandler = (err, req, res, _next) => {
  logger.error('Erro não tratado capturado pelo errorHandler:', {
    mensagem: err.message,
    stack: err.stack,
    url: req.originalUrl,
    metodo: req.method,
    ip: req.ip
  });

  const status = err.statusCode || 500;

  const mensagem = status === 500
    ? 'Erro interno do servidor. Tente novamente mais tarde.'
    : err.message;

  res.status(status).json({
    sucesso: false,
    erro: mensagem,
    codigo: err.codigo || 'ERRO_INTERNO'
  });
};

module.exports = errorHandler;
