const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const config = require("../config/env");
const usuarioModel = require("../models/usuarioModel");
const emailService = require("../services/emailService");
const { sucesso, erro } = require("../helpers/apiResponse");
const logger = require("../config/logger");

const googleClient = new OAuth2Client(config.googleClientId);

const gerarJwt = (usuario) =>
  jwt.sign(
    { id: usuario.id, email: usuario.email, nome: usuario.nome },
    config.jwtSecret,
    { expiresIn: "7d" },
  );

const formatarUsuarioPublico = (usuario) => ({
  id: usuario.id,
  nome: usuario.nome,
  email: usuario.email,
  saldo_tokens: usuario.saldo_tokens,
  isAdmin: usuario.email === config.adminEmail,
});

const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  });
};

const registrar = async (req, res, next) => {
  try {
    const { nome, email, senha, telefone, convite } = req.body;

    let indicadoPor = null;
    if (convite) {
      const indicador = await usuarioModel.buscarPorCodigoConvite(convite);
      if (indicador) indicadoPor = indicador.id;
    }

    const senhaHash = await bcrypt.hash(senha, 12);
    const usuario = await usuarioModel.criarUsuario(
      nome,
      email,
      senhaHash,
      telefone,
      indicadoPor,
    );

    if (usuario.token_verificacao) {
      emailService
        .enviarEmailVerificacao(usuario.email, usuario.nome, usuario.token_verificacao)
        .catch((err) =>
          logger.error("Falha ao enviar e-mail de verificação.", { erro: err.message }),
        );
    }

    const token = gerarJwt(usuario);
    setTokenCookie(res, token);
    logger.info("Novo registro realizado.", { usuarioId: usuario.id, email });

    return sucesso(res, { usuario: formatarUsuarioPublico(usuario) }, 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    const usuario = await usuarioModel.buscarPorEmail(email);

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
      return erro(res, "Email ou senha incorretos.", 401, "CREDENCIAIS_INVALIDAS");
    }

    if (usuario.ativo_2fa) {
      const codigo2FA = Math.floor(100000 + Math.random() * 900000).toString();
      const expira = new Date(Date.now() + 10 * 60000); // 10 minutos
      await usuarioModel.salvarCodigo2FA(usuario.id, codigo2FA, expira);
      
      emailService.enviarEmail2FA(usuario.email, usuario.nome, codigo2FA).catch((err) => {
        logger.error("Falha ao enviar email 2FA", { erro: err.message });
      });
      
      logger.info("Login aguardando 2FA.", { usuarioId: usuario.id });
      return res.status(200).json({ sucesso: false, codigo: "REQUIRE_2FA", usuarioId: usuario.id, mensagem: "Código enviado por email." });
    }

    const token = gerarJwt(usuario);
    setTokenCookie(res, token);
    logger.info("Login realizado.", { usuarioId: usuario.id });
    return sucesso(res, { usuario: formatarUsuarioPublico(usuario) });
  } catch (err) {
    next(err);
  }
};

const loginGoogle = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return erro(res, "Token do Google não fornecido.", 400);

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: config.googleClientId,
    });
    const { email, name: nome } = ticket.getPayload();

    let usuario = await usuarioModel.buscarPorEmail(email);
    if (!usuario) {
      const senhaAleatoria = crypto.randomBytes(20).toString("hex");
      const senhaHash = await bcrypt.hash(senhaAleatoria, 12);
      usuario = await usuarioModel.criarUsuario(nome || "Usuário Google", email, senhaHash, null, null, false);
      logger.info("Novo registro via Google.", { usuarioId: usuario.id, email });
    } else {
      logger.info("Login via Google.", { usuarioId: usuario.id });
    }

    const jwtToken = gerarJwt(usuario);
    setTokenCookie(res, jwtToken);
    return sucesso(res, { usuario: formatarUsuarioPublico(usuario) });
  } catch (err) {
    logger.error("Erro no login via Google.", { erro: err.message });
    return erro(res, "Falha ao autenticar com o Google.", 401);
  }
};

const perfil = async (req, res, next) => {
  try {
    const usuario = await usuarioModel.buscarPorId(req.usuario.id);
    if (!usuario) return erro(res, "Usuário não encontrado.", 404, "USUARIO_NAO_ENCONTRADO");
    return sucesso(res, { usuario: { ...usuario, isAdmin: usuario.email === config.adminEmail } });
  } catch (err) {
    next(err);
  }
};

const status = async (req, res) => {
  let token = null;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.json({ sucesso: true, autenticado: false });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const usuario = await usuarioModel.buscarPorId(payload.id);
    if (!usuario) {
      return res.json({ sucesso: true, autenticado: false });
    }
    return sucesso(res, { autenticado: true, usuario: { ...usuario, isAdmin: usuario.email === config.adminEmail } });
  } catch (err) {
    return res.json({ sucesso: true, autenticado: false });
  }
};

const atualizarPerfil = async (req, res, next) => {
  try {
    const { nome, cpf, localidade, telefone, chave_pix, cartao_final, senhaConfirmacao } = req.body;

    const usuarioDb = await usuarioModel.buscarPorId(req.usuario.id);
    if (!usuarioDb) return erro(res, "Usuário não encontrado.", 404);

    if (!usuarioDb.has_password) {
      return erro(res, "Defina uma senha antes de atualizar o perfil.", 403, "REQUIRE_PASSWORD");
    }

    if (!senhaConfirmacao) {
      return erro(res, "A senha de confirmação é obrigatória.", 403, "SENHA_OBRIGATORIA");
    }

    const usuarioCompleto = await usuarioModel.buscarPorEmail(usuarioDb.email);
    
    // DEBUG LOG
    console.log("[DEBUG 2FA PERFIL] Email:", usuarioDb.email);
    console.log("[DEBUG 2FA PERFIL] Senha digitada length:", senhaConfirmacao.length);
    console.log("[DEBUG 2FA PERFIL] Hash do DB length:", usuarioCompleto.senha_hash ? usuarioCompleto.senha_hash.length : 'NULL');

    const senhaValida = await bcrypt.compare(senhaConfirmacao, usuarioCompleto.senha_hash);
    
    console.log("[DEBUG 2FA PERFIL] bcrypt.compare result:", senhaValida);

    if (!senhaValida) return erro(res, "Senha de confirmação incorreta.", 403, "SENHA_INCORRETA");

    if (!nome || !nome.trim()) return erro(res, "O nome não pode ficar vazio.", 400);

    await usuarioModel.atualizarPerfil(req.usuario.id, {
      nome: nome.trim(),
      cpf: cpf?.trim() || null,
      localidade: localidade?.trim() || null,
      telefone: telefone?.trim() || null,
      chave_pix: chave_pix?.trim() || null,
      cartao_final: cartao_final?.trim() || null,
    });

    return sucesso(res, { mensagem: "Perfil salvo com sucesso!" });
  } catch (err) {
    next(err);
  }
};

const definirSenha = async (req, res, next) => {
  try {
    const { novaSenha } = req.body;
    if (!novaSenha || novaSenha.length < 6) {
      return erro(res, "A senha deve ter pelo menos 6 caracteres.", 400);
    }

    const usuarioDb = await usuarioModel.buscarPorId(req.usuario.id);
    if (usuarioDb.has_password) return erro(res, "Você já possui uma senha definida.", 400);

    const senhaHash = await bcrypt.hash(novaSenha, 12);
    await usuarioModel.definirSenha(req.usuario.id, senhaHash);

    return sucesso(res, { mensagem: "Senha definida com sucesso!" });
  } catch (err) {
    next(err);
  }
};

const verificarEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send("<h2>Token inválido ou ausente.</h2>");

    const usuario = await usuarioModel.buscarPorTokenVerificacao(token);
    if (!usuario) return res.status(404).send("<h2>Link inválido ou já utilizado.</h2>");

    await usuarioModel.confirmarEmail(usuario.id);
    return res.send(`
      <div style="font-family:Arial,sans-serif;text-align:center;margin-top:50px">
        <h1 style="color:#f59e0b">✅ E-mail Verificado!</h1>
        <p>Sua conta na Moeda Arena está confirmada.</p>
        <a href="/" style="background:#f59e0b;color:#000;padding:10px 20px;text-decoration:none;border-radius:5px">Voltar para o site</a>
      </div>
    `);
  } catch (err) {
    next(err);
  }
};

const solicitarRecuperarSenha = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return erro(res, "O e-mail é obrigatório.", 400);

    const mensagemGenerica = {
      mensagem: "Se o e-mail estiver cadastrado, um link de redefinição será enviado em instantes.",
    };

    const usuario = await usuarioModel.buscarPorEmail(email);
    if (!usuario) return sucesso(res, mensagemGenerica);

    const token = crypto.randomBytes(32).toString("hex");
    const expira = new Date(Date.now() + 3_600_000);

    await usuarioModel.salvarTokenResetSenha(usuario.id, token, expira);
    
    // Envio assíncrono para não travar a resposta da API
    emailService.enviarEmailRecuperacao(usuario.email, usuario.nome, token).catch(err => {
      logger.error("Erro no envio em background de recuperação de senha", { erro: err.message });
    });

    logger.info("Solicitação de recuperação de senha gerada.", { usuarioId: usuario.id });
    return sucesso(res, mensagemGenerica);
  } catch (err) {
    next(err);
  }
};

const redefinirSenhaConfirmar = async (req, res, next) => {
  try {
    const { token, novaSenha } = req.body;
    if (!token || !novaSenha) return erro(res, "Token e nova senha são obrigatórios.", 400);
    if (novaSenha.length < 6) return erro(res, "A nova senha deve ter pelo menos 6 caracteres.", 400);

    const usuario = await usuarioModel.buscarPorTokenResetSenha(token);
    if (!usuario) return erro(res, "Link inválido ou já utilizado.", 400, "TOKEN_INVALIDO");

    if (new Date() > new Date(usuario.reset_senha_expira)) {
      return erro(res, "O link de redefinição expirou. Solicite um novo.", 400, "TOKEN_EXPIRADO");
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 12);
    await usuarioModel.atualizarSenhaPorReset(usuario.id, novaSenhaHash);

    logger.info("Senha redefinida com sucesso.", { usuarioId: usuario.id });
    return sucesso(res, { mensagem: "Senha redefinida! Você já pode fazer login." });
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  return sucesso(res, { mensagem: "Logout realizado com sucesso." });
};

const status2fa = async (req, res, next) => {
  try {
    if (!req.usuario || !req.usuario.id) return erro(res, "Não autenticado", 401);
    const usuario = await usuarioModel.buscarPorId(req.usuario.id);
    return sucesso(res, { ativo2fa: !!usuario.ativo_2fa });
  } catch (err) {
    next(err);
  }
};

const toggle2fa = async (req, res, next) => {
  try {
    const { ativar } = req.body;
    if (!req.usuario || !req.usuario.id) return erro(res, "Não autenticado", 401);
    const result = await usuarioModel.atualizarStatus2FA(req.usuario.id, ativar ? 1 : 0);
    if (result) {
      return sucesso(res, { mensagem: ativar ? "2FA ativado com sucesso!" : "2FA desativado." });
    }
    return erro(res, "Falha ao alterar status 2FA.");
  } catch (err) {
    next(err);
  }
};

const verificar2fa = async (req, res, next) => {
  try {
    const { usuarioId, codigo } = req.body;
    if (!usuarioId || !codigo) return erro(res, "Dados incompletos.");
    
    const usuario = await usuarioModel.buscarPorId(usuarioId);
    if (!usuario) return erro(res, "Usuário não encontrado.");
    
    if (usuario.codigo_2fa !== codigo) {
      return erro(res, "Código inválido.", 401);
    }
    
    if (new Date(usuario.codigo_2fa_expira) < new Date()) {
      return erro(res, "Código expirado.", 401);
    }
    
    await usuarioModel.limparCodigo2FA(usuario.id);
    
    const token = gerarJwt(usuario);
    setTokenCookie(res, token);
    logger.info("Login 2FA realizado.", { usuarioId: usuario.id });
    return sucesso(res, { usuario: formatarUsuarioPublico(usuario) });
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
  definirSenha,
  verificarEmail,
  solicitarRecuperarSenha,
  redefinirSenhaConfirmar,
  logout,
  status,
  status2fa,
  toggle2fa,
  verificar2fa,
};
