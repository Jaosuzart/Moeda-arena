const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const config = require("../config/env");
const usuarioModel = require("../models/usuarioModel");
const emailService = require("../services/emailService");
const { sucesso, erro } = require("../helpers/apiResponse");
const logger = require("../config/logger");
const {
  hashTwoFactorCode,
  sessionVersion,
  timingSafeTextEqual,
} = require("../helpers/security");

const googleClient = new OAuth2Client(config.googleClientId);
const tentativas2fa = new Map();
const BLOQUEIO_2FA_MS = 10 * 60 * 1000;

const gerarJwt = (usuario) =>
  jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      sv: sessionVersion(usuario.senha_hash),
    },
    config.jwtSecret,
    {
      algorithm: "HS256",
      audience: "moeda-arena-web",
      issuer: "moeda-arena",
      expiresIn: "7d",
    },
  );

const gerarDesafio2fa = (usuarioId) =>
  jwt.sign(
    { usuarioId, finalidade: "login-2fa", nonce: crypto.randomBytes(16).toString("hex") },
    config.jwtSecret,
    {
      algorithm: "HS256",
      audience: "moeda-arena-2fa",
      issuer: "moeda-arena",
      expiresIn: "10m",
    },
  );

const formatarUsuarioPublico = (usuario) => ({
  id: usuario.id,
  nome: usuario.nome,
  email: usuario.email,
  saldo_moedas: usuario.saldo_moedas,
  email_verificado: Number(usuario.email_verificado || 0),
  has_password: !!usuario.has_password,
  isAdmin: usuario.email === config.adminEmail && !!usuario.email_verificado,
});

const formatarPerfilSeguro = (usuario) => {
  const { codigo_2fa: _codigo2fa, codigo_2fa_expira: _codigo2faExpira, ...seguro } = usuario;
  return { ...seguro, isAdmin: usuario.email === config.adminEmail && !!usuario.email_verificado };
};

const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  });
};

const registrar = async (req, res, next) => {
  try {
    const { nome, senha, telefone, convite } = req.body;
    const email = req.body.email.trim().toLowerCase();

    if (!senha || senha.length < 8 || Buffer.byteLength(senha, "utf8") > 72) {
      return erro(res, "A senha deve ter entre 8 e 72 bytes.", 400);
    }

    let indicadoPor = null;
    if (convite) {
      const indicador = await usuarioModel.buscarPorCodigoConvite(convite);
      if (indicador) indicadoPor = indicador.id;
    }

    const senhaHash = await bcrypt.hash(senha, 12);
    const usuario = await usuarioModel.criarUsuario(nome, email, senhaHash, telefone, indicadoPor);
    usuario.senha_hash = senhaHash;

    if (usuario.token_verificacao) {
      emailService
        .enviarEmailVerificacao(usuario.email, usuario.nome, usuario.token_verificacao)
        .catch((err) => logger.error("Falha ao enviar e-mail de verificação.", { erro: err.message }));
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
    const email = req.body.email.trim().toLowerCase();
    const { senha } = req.body;
    const usuario = await usuarioModel.buscarPorEmail(email);

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
      return erro(res, "Email ou senha incorretos.", 401, "CREDENCIAIS_INVALIDAS");
    }

    if (usuario.status === "banido") {
      return erro(res, "Esta conta está bloqueada.", 403, "CONTA_BLOQUEADA");
    }

    if (usuario.ativo_2fa) {
      const estadoTentativas = tentativas2fa.get(usuario.id);
      if (estadoTentativas?.bloqueadoAte > Date.now()) {
        return erro(res, "Muitas tentativas de código. Aguarde 10 minutos.", 429, "2FA_BLOQUEADO");
      }
      const falhasAtuais =
        estadoTentativas && estadoTentativas.expiraEm > Date.now() && !estadoTentativas.bloqueadoAte
          ? estadoTentativas.falhas
          : 0;
      const codigo2FA = crypto.randomInt(100000, 1000000).toString();
      const expira = new Date(Date.now() + 10 * 60000); // 10 minutos
      await usuarioModel.salvarCodigo2FA(usuario.id, hashTwoFactorCode(usuario.id, codigo2FA), expira);
      tentativas2fa.set(usuario.id, {
        falhas: falhasAtuais,
        expiraEm: expira.getTime(),
        bloqueadoAte: 0,
      });

      emailService.enviarEmail2FA(usuario.email, usuario.nome, codigo2FA).catch((err) => {
        logger.error("Falha ao enviar email 2FA", { erro: err.message });
      });

      logger.info("Login aguardando 2FA.", { usuarioId: usuario.id });
      return res
        .status(200)
        .json({
          sucesso: false,
          codigo: "REQUIRE_2FA",
          desafio: gerarDesafio2fa(usuario.id),
          mensagem: "Código enviado por email.",
        });
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
    if (!token) return erro(res, "Moeda do Google não fornecido.", 400);

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: config.googleClientId,
    });
    const { email, name: nome, email_verified: emailVerificado } = ticket.getPayload();
    if (!email || !emailVerificado) return erro(res, "O Google não confirmou este e-mail.", 401);
    const emailNormalizado = email.trim().toLowerCase();

    let usuario = await usuarioModel.buscarPorEmail(emailNormalizado);
    if (!usuario) {
      const senhaAleatoria = crypto.randomBytes(20).toString("hex");
      const senhaHash = await bcrypt.hash(senhaAleatoria, 12);
      usuario = await usuarioModel.criarUsuario(
        nome || "Usuário Google",
        emailNormalizado,
        senhaHash,
        null,
        null,
        false,
        true,
      );
      usuario.senha_hash = senhaHash;
      logger.info("Novo registro via Google.", { usuarioId: usuario.id, email: emailNormalizado });
    } else {
      if (usuario.status === "banido") return erro(res, "Esta conta está bloqueada.", 403, "CONTA_BLOQUEADA");
      if (!usuario.email_verificado) {
        await usuarioModel.confirmarEmail(usuario.id);
        usuario.email_verificado = 1;
      }
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
    
    // Proteção de dados sensíveis (Mascaramento)
    if (usuario.cpf) {
      const d = usuario.cpf.replace(/\D/g, "");
      if (d.length === 11) usuario.cpf = `${d.slice(0,3)}.***.***-${d.slice(-2)}`;
      else usuario.cpf = "***";
    }
    if (usuario.chave_pix) {
      usuario.chave_pix = usuario.chave_pix.length > 5 ? `${usuario.chave_pix.slice(0,3)}***` : "***";
    }
    if (usuario.cartao_final) {
      usuario.cartao_final = `**** **** **** ${usuario.cartao_final.slice(-4)}`;
    }

    return sucesso(res, { usuario: formatarPerfilSeguro(usuario) });
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
    const payload = jwt.verify(token, config.jwtSecret, {
      algorithms: ["HS256"],
      issuer: "moeda-arena",
      audience: "moeda-arena-web",
    });
    const autenticacao = await usuarioModel.buscarAutenticacaoPorId(payload.id);
    if (
      !autenticacao ||
      autenticacao.status === "banido" ||
      !payload.sv ||
      !timingSafeTextEqual(payload.sv, sessionVersion(autenticacao.senha_hash))
    ) {
      return res.json({ sucesso: true, autenticado: false });
    }
    const usuario = await usuarioModel.buscarPorId(payload.id);
    return sucesso(res, { autenticado: true, usuario: formatarUsuarioPublico(usuario) });
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

    const senhaValida = await bcrypt.compare(senhaConfirmacao, usuarioCompleto.senha_hash);

    if (!senhaValida) return erro(res, "Senha de confirmação incorreta.", 403, "SENHA_INCORRETA");

    if (!nome || !nome.trim()) return erro(res, "O nome não pode ficar vazio.", 400);

    const updateData = {
      nome: nome.trim(),
      localidade: localidade?.trim() || null,
      telefone: telefone?.trim() || null,
    };

    if (cpf && !cpf.includes("*")) updateData.cpf = cpf.trim();
    else updateData.cpf = usuarioDb.cpf;

    if (chave_pix && !chave_pix.includes("*")) updateData.chave_pix = chave_pix.trim();
    else updateData.chave_pix = usuarioDb.chave_pix;

    if (cartao_final && !cartao_final.includes("*")) updateData.cartao_final = cartao_final.trim();
    else updateData.cartao_final = usuarioDb.cartao_final;

    await usuarioModel.atualizarPerfil(req.usuario.id, updateData);

    return sucesso(res, { mensagem: "Perfil salvo com sucesso!" });
  } catch (err) {
    next(err);
  }
};

const definirSenha = async (req, res, next) => {
  try {
    const { novaSenha } = req.body;
    if (!novaSenha || novaSenha.length < 8 || Buffer.byteLength(novaSenha, "utf8") > 72) {
      return erro(res, "A senha deve ter entre 8 e 72 bytes.", 400);
    }

    const usuarioDb = await usuarioModel.buscarPorId(req.usuario.id);
    if (usuarioDb.has_password) return erro(res, "Você já possui uma senha definida.", 400);

    const senhaHash = await bcrypt.hash(novaSenha, 12);
    await usuarioModel.definirSenha(req.usuario.id, senhaHash);
    setTokenCookie(res, gerarJwt({ ...usuarioDb, senha_hash: senhaHash }));

    return sucesso(res, { mensagem: "Senha definida com sucesso!" });
  } catch (err) {
    next(err);
  }
};

const verificarEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send("<h2>Moeda inválido ou ausente.</h2>");

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

    emailService.enviarEmailRecuperacao(usuario.email, usuario.nome, token).catch((err) => {
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
    if (!token || !novaSenha) return erro(res, "Moeda e nova senha são obrigatórios.", 400);
    if (novaSenha.length < 8 || Buffer.byteLength(novaSenha, "utf8") > 72) {
      return erro(res, "A nova senha deve ter entre 8 e 72 bytes.", 400);
    }

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
  res.clearCookie("token", {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "strict",
    path: "/",
  });
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
    const { ativar, senhaConfirmacao } = req.body;
    if (!req.usuario || !req.usuario.id) return erro(res, "Não autenticado", 401);
    if (typeof ativar !== "boolean") return erro(res, "Estado do 2FA inválido.", 400);
    const usuario = await usuarioModel.buscarAutenticacaoPorId(req.usuario.id);
    if (!usuario?.has_password) {
      return erro(res, "Defina uma senha antes de alterar o 2FA.", 403, "REQUIRE_PASSWORD");
    }
    if (!senhaConfirmacao || !(await bcrypt.compare(senhaConfirmacao, usuario.senha_hash))) {
      return erro(res, "Confirme sua senha para alterar o 2FA.", 403, "SENHA_INCORRETA");
    }
    const result = await usuarioModel.atualizarStatus2FA(req.usuario.id, ativar ? 1 : 0);
    await usuarioModel.limparCodigo2FA(req.usuario.id);
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
    const { desafio, codigo } = req.body;
    if (!desafio || !/^\d{6}$/.test(String(codigo || ""))) return erro(res, "Dados incompletos.", 400);

    let desafioPayload;
    try {
      desafioPayload = jwt.verify(desafio, config.jwtSecret, {
        algorithms: ["HS256"],
        audience: "moeda-arena-2fa",
        issuer: "moeda-arena",
      });
    } catch {
      return erro(res, "Desafio de segurança inválido ou expirado.", 401, "DESAFIO_INVALIDO");
    }
    if (desafioPayload.finalidade !== "login-2fa") {
      return erro(res, "Desafio de segurança inválido.", 401, "DESAFIO_INVALIDO");
    }

    const usuario = await usuarioModel.buscarAutenticacaoPorId(desafioPayload.usuarioId);
    if (!usuario || usuario.status === "banido" || !usuario.ativo_2fa) {
      return erro(res, "Código inválido.", 401);
    }

    if (new Date(usuario.codigo_2fa_expira) < new Date()) {
      await usuarioModel.limparCodigo2FA(usuario.id);
      tentativas2fa.delete(usuario.id);
      return erro(res, "Código expirado.", 401);
    }

    const codigoEsperado = hashTwoFactorCode(usuario.id, String(codigo));
    if (!timingSafeTextEqual(usuario.codigo_2fa || "", codigoEsperado)) {
      const estado = tentativas2fa.get(usuario.id) || { falhas: 0, expiraEm: Date.now() + BLOQUEIO_2FA_MS };
      estado.falhas += 1;
      if (estado.falhas >= 5) {
        estado.bloqueadoAte = Date.now() + BLOQUEIO_2FA_MS;
        await usuarioModel.limparCodigo2FA(usuario.id);
        tentativas2fa.set(usuario.id, estado);
        return erro(res, "Muitas tentativas de código. Aguarde 10 minutos.", 429, "2FA_BLOQUEADO");
      }
      tentativas2fa.set(usuario.id, estado);
      return erro(res, "Código inválido.", 401);
    }

    await usuarioModel.limparCodigo2FA(usuario.id);
    tentativas2fa.delete(usuario.id);

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
