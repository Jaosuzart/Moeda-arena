
const planoModel = require('../models/planoModel');
const { sucesso } = require('../helpers/apiResponse');
const listarPlanos = (req, res) => {
  const planos = planoModel.obterTodosOsPlanos();
  return sucesso(res, planos);
};

module.exports = { listarPlanos };
