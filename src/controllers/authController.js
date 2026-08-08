/**
 * @module controllers/authController
 * @description Controller de autenticação.
 *              Gerencia registro, login e consulta de perfil do usuário.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const config = require('../config/env');
const usuarioModel = require('../models/usuarioModel');
const { sucesso, erro } = require('../helpers/apiResponse');
const logger = require('../config/logger');

const CLIENT_ID = config.googleClientId;
const client = new OAuth2Client(CLIENT_ID);

const registrar = async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body;

    const senhaHash = await bcrypt.hash(senha, 12);
    const usuario = await usuarioModel.criarUsuario(nome, email, senhaHash);

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nome: usuario.nome },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    logger.info('Novo registro realizado.', { usuarioId: usuario.id, email });

    return sucesso(res, {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        saldo_tokens: usuario.saldo_tokens
      }
    }, 201);
  } catch (err) {
    next(err);
  }
};
const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    const usuario = await usuarioModel.buscarPorEmail(email);
    if (!usuario) {
      return erro(res, 'Email ou senha incorretos.', 401, 'CREDENCIAIS_INVALIDAS');
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return erro(res, 'Email ou senha incorretos.', 401, 'CREDENCIAIS_INVALIDAS');
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nome: usuario.nome },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    logger.info('Login realizado.', { usuarioId: usuario.id });

    return sucesso(res, {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        saldo_tokens: usuario.saldo_tokens
      }
    });
  } catch (err) {
    next(err);
  }
};
const perfil = async (req, res, next) => {
  try {
    const usuario = await usuarioModel.buscarPorId(req.usuario.id);
    if (!usuario) {
      return erro(res, 'Usuário não encontrado.', 404, 'USUARIO_NAO_ENCONTRADO');
    }
    return sucesso(res, { usuario });
  } catch (err) {
    next(err);
  }
};
const loginGoogle = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return erro(res, 'Token do Google não fornecido.', 400);
    }

    // Verifica o token com o Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    const email = payload.email;
    const nome = payload.name || 'Usuário Google';

    let usuario = await usuarioModel.buscarPorEmail(email);

    if (!usuario) {
      const senhaAleatoria = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const senhaHash = await bcrypt.hash(senhaAleatoria, 12);
      usuario = await usuarioModel.criarUsuario(nome, email, senhaHash);
      logger.info('Novo registro via Google realizado.', { usuarioId: usuario.id, email });
    } else {
      logger.info('Login via Google realizado.', { usuarioId: usuario.id });
    }

    const jwtToken = jwt.sign(
      { id: usuario.id, email: usuario.email, nome: usuario.nome },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return sucesso(res, {
      token: jwtToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        saldo_tokens: usuario.saldo_tokens
      }
    });
  } catch (err) {
    logger.error('Erro no login via Google', { erro: err.message });
    return erro(res, 'Falha ao autenticar com o Google.', 401);
  }
};
const atualizarPerfil = async (req, res, next) => {
  try {
    const { nome, cpf, localidade, chave_pix, cartao_final } = req.body;
    
    if (!nome) {
      return erro(res, 'O nome não pode ficar vazio.', 400);
    }
    
    const sucessoAtualizacao = await usuarioModel.atualizarPerfil(req.usuario.id, {
      nome: nome.trim(),
      cpf: cpf ? cpf.trim() : null,
      localidade: localidade ? localidade.trim() : null,
      chave_pix: chave_pix ? chave_pix.trim() : null,
      cartao_final: cartao_final ? cartao_final.trim() : null
    });
    
    if (!sucessoAtualizacao) {
      return erro(res, 'Erro ao salvar o perfil.', 500);
    }
    
    return sucesso(res, { mensagem: 'Perfil salvo com sucesso!' });
  } catch (err) {
    next(err);
  }
};

module.exports = { registrar, login, loginGoogle, perfil, atualizarPerfil };
