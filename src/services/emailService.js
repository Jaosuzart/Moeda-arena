const nodemailer = require("nodemailer");
const config = require("../config/env");
const logger = require("../config/logger");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_PORT == 465 || !process.env.SMTP_PORT, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
  },
});

const BASE_URL = config.corsOrigin;

const enviarEmail = async (para, assunto, html) => {
  try {
    await transporter.sendMail({
      from: `"Moeda Arena" <${process.env.EMAIL_USER}>`,
      to: para,
      subject: assunto,
      html,
    });
    logger.info("E-mail enviado.", { para, assunto });
    return true;
  } catch (err) {
    logger.error("Erro ao enviar e-mail.", { para, assunto, erro: err.message });
    return false;
  }
};

const layoutBase = (conteudo) => `
  <div style="font-family:Arial,sans-serif;background:#0f172a;color:#f8fafc;padding:30px;border-radius:8px;max-width:600px;margin:auto;border:1px solid #1e293b;">
    ${conteudo}
    <hr style="border-color:#334155;margin:30px 0;">
    <p style="font-size:12px;color:#64748b;text-align:center;">© Moeda Arena — Todos os direitos reservados</p>
  </div>
`;

const enviarEmailVerificacao = (paraEmail, nome, token) => {
  const link = `${BASE_URL}/api/auth/verificar-email?token=${token}`;
  const html = layoutBase(`
    <h2 style="color:#f59e0b;text-align:center;">🎮 Bem-vindo(a), ${nome}!</h2>
    <p>Falta só confirmar seu e-mail para acessar seus Tokens e o Ranking.</p>
    <div style="text-align:center;margin:25px 0;">
      <a href="${link}" style="background:#f59e0b;color:#000;padding:14px 28px;text-decoration:none;font-weight:bold;border-radius:8px;font-size:16px;">Verificar Meu E-mail</a>
    </div>
    <p style="font-size:12px;color:#94a3b8;">Link: <a href="${link}" style="color:#60a5fa;">${link}</a></p>
  `);
  return enviarEmail(paraEmail, "Bem-vindo(a) à Moeda Arena! Confirme seu E-mail", html);
};

const enviarEmailRecuperacao = (paraEmail, nome, token) => {
  const link = `${BASE_URL}/?resetToken=${token}`;
  const html = layoutBase(`
    <h2 style="color:#f59e0b;text-align:center;">🔑 Recuperação de Senha</h2>
    <p>Olá, ${nome}. Recebemos um pedido de redefinição de senha.</p>
    <div style="text-align:center;margin:25px 0;">
      <a href="${link}" style="background:#f59e0b;color:#000;padding:14px 28px;text-decoration:none;font-weight:bold;border-radius:8px;font-size:16px;">Redefinir Minha Senha</a>
    </div>
    <p style="font-size:12px;color:#94a3b8;">Este link expira em 1 hora. Se não foi você, ignore este e-mail.</p>
  `);
  return enviarEmail(paraEmail, "Recupere sua Senha - Moeda Arena", html);
};

const enviarEmailRecibo = (paraEmail, nome, valor, tokens) => {
  const html = layoutBase(`
    <h2 style="color:#10b981;text-align:center;">✅ Pagamento Aprovado!</h2>
    <p>Olá, <strong>${nome}</strong>! Seu pagamento foi processado com sucesso.</p>
    <div style="background:#1e293b;padding:20px;border-radius:8px;text-align:center;margin:20px 0;">
      <h3 style="color:#f59e0b;margin:0;">+${tokens} TOKENS</h3>
      <p style="color:#94a3b8;margin:5px 0 0;">Valor pago: R$ ${valor}</p>
    </div>
    <div style="text-align:center;">
      <a href="${BASE_URL}" style="background:#f59e0b;color:#000;padding:14px 28px;text-decoration:none;font-weight:bold;border-radius:8px;font-size:16px;">Acessar Minha Conta</a>
    </div>
  `);
  return enviarEmail(paraEmail, "Pagamento Aprovado! Seus Tokens chegaram 🚀", html);
};

const enviarEmailContato = (nome, emailCliente, mensagem) => {
  const adminEmail = process.env.EMAIL_USER || process.env.SMTP_USER || "suporte@moedaarena.com.br";
  const html = layoutBase(`
    <h2 style="color:#f59e0b;text-align:center;">✉️ Nova Mensagem de Contato</h2>
    <p><strong>Nome:</strong> ${nome}</p>
    <p><strong>E-mail do Cliente:</strong> <a href="mailto:${emailCliente}" style="color:#60a5fa;">${emailCliente}</a></p>
    <div style="background:#1e293b;padding:20px;border-radius:8px;margin:20px 0;">
      <p style="white-space: pre-wrap; margin:0;">${mensagem}</p>
    </div>
    <div style="text-align:center;">
      <a href="mailto:${emailCliente}" style="background:#f59e0b;color:#000;padding:10px 20px;text-decoration:none;font-weight:bold;border-radius:8px;font-size:14px;">Responder ao Cliente</a>
    </div>
  `);
  return enviarEmail(adminEmail, `Contato: ${nome} - Moeda Arena`, html);
};

module.exports = { enviarEmailVerificacao, enviarEmailRecuperacao, enviarEmailRecibo, enviarEmailContato };
