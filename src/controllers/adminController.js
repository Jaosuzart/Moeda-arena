const usuarioModel = require("../models/usuarioModel");
const { sucesso, erro } = require("../helpers/apiResponse");
const config = require("../config/env");
const isAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.email !== config.adminEmail) {
    return erro(
      res,
      "Acesso negado. Apenas administradores podem acessar esta rota.",
      403,
      "FORBIDDEN",
    );
  }
  next();
};
const listarUsuarios = async (req, res, next) => {
  try {
    const usuarios = await usuarioModel.listarTodos();
    return sucesso(res, usuarios);
  } catch (err) {
    next(err);
  }
};
const adicionarTokensManualmente = async (req, res, next) => {
  try {
    const { usuarioId, quantidade } = req.body;
    if (!usuarioId || !quantidade || isNaN(quantidade)) {
      return erro(res, "ID do usuário e quantidade são obrigatórios.", 400);
    }
    const sucessoDb = await usuarioModel.adicionarTokens(
      usuarioId,
      Number(quantidade),
    );
    if (!sucessoDb) {
      return erro(res, "Usuário não encontrado.", 404);
    }
    return sucesso(res, {
      mensagem: `${quantidade} tokens adicionados com sucesso ao usuário ID ${usuarioId}.`,
    });
  } catch (err) {
    next(err);
  }
};
const alterarStatusUsuario = async (req, res, next) => {
  try {
    const { usuarioId, status } = req.body;
    if (!usuarioId || !["ativo", "banido"].includes(status)) {
      return erro(res, 'Status inválido. Use "ativo" ou "banido".', 400);
    }
    const sucessoDb = await usuarioModel.atualizarStatus(usuarioId, status);
    if (!sucessoDb) {
      return erro(res, "Usuário não encontrado.", 404);
    }
    return sucesso(res, {
      mensagem: `Usuário ${usuarioId} agora está ${status}.`,
    });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  isAdmin,
  listarUsuarios,
  adicionarTokensManualmente,
  alterarStatusUsuario,
};
