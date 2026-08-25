const jwt = require("jsonwebtoken");
const config = require("../config/env");
const { erro } = require("../helpers/apiResponse");
const autenticar = (req, res, next) => {
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return erro(
      res,
      "Token de autenticação não fornecido. Faça login primeiro.",
      401,
      "NAO_AUTENTICADO",
    );
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.usuario = {
      id: payload.id,
      email: payload.email,
      nome: payload.nome,
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return erro(
        res,
        "Sessão expirada. Faça login novamente.",
        401,
        "TOKEN_EXPIRADO",
      );
    }
    return erro(res, "Token inválido.", 401, "TOKEN_INVALIDO");
  }
};
module.exports = { autenticar };
