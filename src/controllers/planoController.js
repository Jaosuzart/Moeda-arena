const planoModel = require("../models/planoModel");
const usuarioModel = require("../models/usuarioModel");
const { sucesso } = require("../helpers/apiResponse");
const listarPlanos = (req, res) => {
  const planos = planoModel.obterTodosOsPlanos();
  return sucesso(res, planos);
};
const obterEstatisticas = async (req, res, next) => {
  try {
    const stats = await usuarioModel.obterEstatisticaPlataforma();
    return sucesso(res, stats);
  } catch (err) {
    next(err);
  }
};
module.exports = { listarPlanos, obterEstatisticas };
