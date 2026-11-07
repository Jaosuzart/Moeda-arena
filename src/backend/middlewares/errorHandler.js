const logger = require("../config/logger");
const errorHandler = (err, req, res, _next) => {
  if (res.headersSent) return _next(err);
  logger.error("Erro não tratado capturado pelo errorHandler:", {
    mensagem: err.message,
    stack: err.stack,
    url: req.path,
    metodo: req.method,
    ip: req.ip,
  });
  const statusRecebido = err.statusCode || err.status;
  const status =
    Number.isInteger(statusRecebido) &&
    statusRecebido >= 400 &&
    statusRecebido <= 599
      ? statusRecebido
      : 500;
  const mensagem =
    status >= 500
      ? "Erro interno do servidor. Tente novamente mais tarde."
      : err.type === "entity.parse.failed"
        ? "O corpo da requisição contém JSON inválido."
        : err.type === "entity.too.large"
          ? "O conteúdo enviado excede o tamanho permitido."
          : err.message;
  res.status(status).json({
    sucesso: false,
    erro: mensagem,
    codigo: err.codigo || "ERRO_INTERNO",
  });
};
module.exports = errorHandler;
