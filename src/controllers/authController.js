
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const config = require('../config/env');
const usuarioModel = require('../models/usuarioModel');
const { sucesso, erro } = require('../helpers/apiResponse');
const logger = require('../config/logger');

const CLIENT_ID = config.googleClientId;
const client = new OAuth2Client(CLIENT_ID);

const emailService = require('../services/emailService');

const registrar = async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body;

    const senhaHash = await bcrypt.hash(senha, 12);
    const usuario = await usuarioModel.criarUsuario(nome, email, senhaHash);

    if (usuario.token_verificacao) {
      emailService.enviarEmailVerificacao(usuario.email, usuario.nome, usuario.token_verificacao);
    }

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
        saldo_tokens: usuario.saldo_tokens,
        email_verificado: 0,
        isAdmin: usuario.email === config.adminEmail
      }
    }, 201);
  } catch (err) {
    next(err);
  }
};

const verificarEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send('<h2>Token inválido ou ausente.</h2>');
    }

    const usuario = await usuarioModel.buscarPorTokenVerificacao(token);
    if (!usuario) {
      return res.status(404).send('<h2>Link inválido ou já utilizado.</h2>');
    }

    await usuarioModel.confirmarEmail(usuario.id);

    return res.send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
        <h1 style="color: #3b82f6;">✅ E-mail Verificado com Sucesso!</h1>
        <p>Sua conta no Jogo Arena agora está 100% segura e confirmada.</p>
        <p><a href="/" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Voltar para o site</a></p>
      </div>
    `);
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
        saldo_tokens: usuario.saldo_tokens,
        isAdmin: usuario.email === config.adminEmail
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
    const isAdmin = usuario.email === config.adminEmail;
    return sucesso(res, { usuario: { ...usuario, isAdmin } });
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
      usuario = await usuarioModel.criarUsuario(nome, email, senhaHash, false);
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
        saldo_tokens: usuario.saldo_tokens,
        isAdmin: usuario.email === config.adminEmail
      }
    });
  } catch (err) {
    logger.error('Erro no login via Google', { erro: err.message });
    return erro(res, 'Falha ao autenticar com o Google.', 401);
  }
};
const atualizarPerfil = async (req, res, next) => {
  try {
    const { nome, cpf, localidade, chave_pix, cartao_final, senhaConfirmacao } = req.body;

    const usuarioDb = await usuarioModel.buscarPorId(req.usuario.id);
    if (!usuarioDb) return erro(res, 'Usuário não encontrado', 404);

    if (!usuarioDb.has_password) {
      return res.status(403).json({
        sucesso: false,
        erro: 'Você fez login pelo Google e não tem uma senha. Por favor, defina uma senha primeiro.',
        codigo: 'REQUIRE_PASSWORD'
      });
    }

    if (!senhaConfirmacao) {
      return erro(res, 'A senha de confirmação é obrigatória para salvar as alterações.', 403, 'SENHA_OBRIGATORIA');
    }

    const usuarioCompleto = await usuarioModel.buscarPorEmail(usuarioDb.email);
    const senhaValida = await bcrypt.compare(senhaConfirmacao, usuarioCompleto.senha_hash);

    if (!senhaValida) {
      return erro(res, 'Senha de confirmação incorreta.', 403, 'SENHA_INCORRETA');
    }

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

const definirSenha = async (req, res, next) => {
  try {
    const { novaSenha } = req.body;
    if (!novaSenha || novaSenha.length < 6) {
      return erro(res, 'A senha deve ter pelo menos 6 caracteres.', 400);
    }

    const usuarioDb = await usuarioModel.buscarPorId(req.usuario.id);
    if (usuarioDb.has_password) {
      return erro(res, 'Você já possui uma senha definida.', 400);
    }

    const senhaHash = await bcrypt.hash(novaSenha, 12);
    await usuarioModel.definirSenha(req.usuario.id, senhaHash);

    return sucesso(res, { mensagem: 'Senha de segurança definida com sucesso! Agora você pode atualizar seu perfil.' });
  } catch (err) {
    next(err);
  }
};

const solicitarRecuperarSenha = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return erro(res, 'O e-mail é obrigatório.', 400);
    }

    const usuario = await usuarioModel.buscarPorEmail(email);
    if (!usuario) {
      return sucesso(res, { mensagem: 'Se o e-mail estiver cadastrado, um link de redefinição de senha será enviado em instantes.' });
    }

    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 3600000); 

    await usuarioModel.salvarTokenResetSenha(usuario.id, token, expira);
    await emailService.enviarEmailRecuperacao(usuario.email, usuario.nome, token);

    logger.info('Solicitação de recuperação de senha gerada.', { usuarioId: usuario.id });

    return sucesso(res, { mensagem: 'Se o e-mail estiver cadastrado, um link de redefinição de senha será enviado em instantes.' });
  } catch (err) {
    next(err);
  }
};

const redefinirSenhaConfirmar = async (req, res, next) => {
  try {
    const { token, novaSenha } = req.body;
    if (!token || !novaSenha) {
      return erro(res, 'Token e nova senha são obrigatórios.', 400);
    }

    if (novaSenha.length < 6) {
      return erro(res, 'A nova senha deve ter pelo menos 6 caracteres.', 400);
    }

    const usuario = await usuarioModel.buscarPorTokenResetSenha(token);
    if (!usuario) {
      return erro(res, 'Link de redefinição inválido ou já utilizado.', 400, 'TOKEN_INVALIDO');
    }

    const agora = new Date();
    const dataExpira = new Date(usuario.reset_senha_expira);
    if (agora > dataExpira) {
      return erro(res, 'O link de redefinição expirou. Solicite um novo link.', 400, 'TOKEN_EXPIRADO');
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 12);
    await usuarioModel.atualizarSenhaPorReset(usuario.id, novaSenhaHash);

    logger.info('Senha redefinida com sucesso via token.', { usuarioId: usuario.id });

    return sucesso(res, { mensagem: 'Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  registrar, 
  login, 
  loginGoogle, 
  perfil, 
  atualizarPerfil, 
  verificarEmail, 
  definirSenha,
  solicitarRecuperarSenha,
  redefinirSenhaConfirmar
};
