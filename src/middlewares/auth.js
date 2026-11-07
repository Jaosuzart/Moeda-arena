const jwt = require("jsonwebtoken");
const config = require("../config/env");
const { erro } = require("../helpers/apiResponse");
const usuarioModel = require("../models/usuarioModel");
const { sessionVersion, timingSafeTextEqual } = require("../helpers/security");

const autenticar = async (req, res, next) => {
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return erro(res, "Token de autenticação não fornecido. Faça login primeiro.", 401, "NAO_AUTENTICADO");
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret, {
      algorithms: ["HS256"],
      issuer: "moeda-arena",
      audience: "moeda-arena-web",
    });
    const usuario = await usuarioModel.buscarAutenticacaoPorId(payload.id);
    if (!usuario || usuario.status === "banido") {
      return erro(res, "Conta indisponível.", 403, "CONTA_BLOQUEADA");
    }
    if (!payload.sv || !timingSafeTextEqual(payload.sv, sessionVersion(usuario.senha_hash))) {
      return erro(res, "Sessão revogada. Faça login novamente.", 401, "SESSAO_REVOGADA");
    }
    req.usuario = {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      emailVerificado: !!usuario.email_verificado,
      hasPassword: !!usuario.has_password,
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return erro(res, "Sessão expirada. Faça login novamente.", 401, "TOKEN_EXPIRADO");
    }
    if (err.name === "JsonWebTokenError" || err.name === "NotBeforeError") {
      return erro(res, "Token inválido.", 401, "TOKEN_INVALIDO");
    }
    return next(err);
  }
};

const exigirEmailVerificado = (req, res, next) => {
  if (!req.usuario?.emailVerificado) {
    return erro(res, "Confirme seu e-mail antes de continuar.", 403, "EMAIL_NAO_VERIFICADO");
  }
  next();
};

module.exports = { autenticar, exigirEmailVerificado };
