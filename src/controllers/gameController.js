
const usuarioModel = require('../models/usuarioModel');
const { sucesso, erro } = require('../helpers/apiResponse');
const config = require('../config/env');
const validarApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  if (!apiKey || apiKey !== config.apiGameSecret) {
    return erro(res, 'Acesso negado. Chave da API inválida ou ausente.', 401, 'UNAUTHORIZED_GAME_API');
  }
  next();
};
const getSaldo = async (req, res, next) => {
  try {
    const email = req.params.email;
    const usuario = await usuarioModel.buscarPorEmail(email);

    if (!usuario) {
      return erro(res, 'Jogador não encontrado.', 404, 'JOGADOR_NAO_ENCONTRADO');
    }

    return sucesso(res, {
      email: usuario.email,
      nome: usuario.nome,
      saldo: usuario.saldo_tokens
    });
  } catch (err) {
    next(err);
  }
};
const consumirTokens = async (req, res, next) => {
  try {
    const { email, quantidade } = req.body;

    if (!email || !quantidade || isNaN(quantidade) || quantidade <= 0) {
      return erro(res, 'E-mail e quantidade válida são obrigatórios.', 400, 'PARAMETROS_INVALIDOS');
    }

    const usuario = await usuarioModel.buscarPorEmail(email);

    if (!usuario) {
      return erro(res, 'Jogador não encontrado.', 404, 'JOGADOR_NAO_ENCONTRADO');
    }

    if (usuario.saldo_tokens < quantidade) {
      return erro(res, 'Saldo insuficiente.', 400, 'SALDO_INSUFICIENTE');
    }

    const debitado = await usuarioModel.debitarTokens(usuario.id, quantidade);

    if (!debitado) {
      return erro(res, 'Falha ao debitar tokens (verifique o saldo).', 400, 'FALHA_DEBITO');
    }

    return sucesso(res, {
      mensagem: `${quantidade} tokens debitados com sucesso.`,
      saldo_restante: usuario.saldo_tokens - quantidade
    });
  } catch (err) {
    next(err);
  }
};

const getRanking = async (req, res, next) => {
  try {
    const limite = req.query.limite ? parseInt(req.query.limite) : 10;
    const ranking = await usuarioModel.buscarRanking(limite);
    return sucesso(res, ranking);
  } catch (err) {
    next(err);
  }
};

const salvarEstatisticas = async (req, res, next) => {
  try {
    const { email, trofeus = 0, vitorias = 0, xp = 0 } = req.body;

    if (!email) {
      return erro(res, 'E-mail é obrigatório.', 400, 'PARAMETROS_INVALIDOS');
    }

    const usuario = await usuarioModel.buscarPorEmail(email);
    if (!usuario) {
      return erro(res, 'Jogador não encontrado.', 404, 'JOGADOR_NAO_ENCONTRADO');
    }

    const sucessoAt = await usuarioModel.adicionarEstatisticas(usuario.id, trofeus, vitorias, xp);
    if (!sucessoAt) {
      return erro(res, 'Falha ao atualizar estatísticas.', 500, 'ERRO_INTERNO');
    }

    return sucesso(res, { mensagem: 'Estatísticas salvas com sucesso!' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  validarApiKey,
  getSaldo,
  consumirTokens,
  getRanking,
  salvarEstatisticas
};
