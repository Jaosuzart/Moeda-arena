const nodemailer = require("nodemailer");
const config = require("../config/env");
const logger = require("../config/logger");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const enviarEmailVerificacao = async (paraEmail, nome, token) => {
  try {
    const link = `${config.corsOrigin}/api/auth/verificar-email?token=${token}`;
    const mailOptions = {
      from: `"Moeda Arena" <${process.env.EMAIL_USER}>`,
      to: paraEmail,
      subject: "Bem-vindo(a) à Moeda Arena! Confirme seu E-mail",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px; border-radius: 8px; text-align: center; max-width: 600px; margin: auto;">
          <img src="https://i.imgur.com/your-logo.png" alt="Moeda Arena" style="max-width: 150px; margin-bottom: 20px;">
          <h2 style="color: #f59e0b;">🎮 Bem-vindo(a), ${nome}!</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">Falta só mais um passo para você começar a aproveitar seus Tokens e subidas no Ranking.</p>
          <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">Por favor, confirme seu endereço de e-mail clicando no botão abaixo:</p>
          <a href="${link}" style="display: inline-block; background-color: #f59e0b; color: #000; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; margin-top: 20px; font-size: 16px;">
            Verificar Meu E-mail
          </a>
          <hr style="border-color: #334155; margin: 30px 0;">
          <p style="font-size: 12px; color: #94a3b8;">Se o botão não funcionar, copie e cole este link no seu navegador:<br><a href="${link}" style="color: #60a5fa;">${link}</a></p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    logger.info(`E-mail de verificação enviado para ${paraEmail}`);
    return true;
  } catch (error) {
    logger.error("Erro ao enviar e-mail de verificação:", error);
    return false;
  }
};

const enviarEmailRecuperacao = async (paraEmail, nome, token) => {
  try {
    const link = `${config.corsOrigin}/?resetToken=${token}`;
    const mailOptions = {
      from: `"Moeda Arena" <${process.env.EMAIL_USER}>`,
      to: paraEmail,
      subject: "Recupere sua Senha - Moeda Arena",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px; border-radius: 8px; text-align: center; max-width: 600px; margin: auto;">
          <h2 style="color: #f59e0b;">🔑 Recuperação de Senha</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">Olá, ${nome}. Recebemos uma solicitação para redefinir a senha da sua conta.</p>
          <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">Clique no botão abaixo para escolher uma nova senha de segurança:</p>
          <a href="${link}" style="display: inline-block; background-color: #f59e0b; color: #000; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; margin-top: 20px; font-size: 16px;">
            Redefinir Minha Senha
          </a>
          <hr style="border-color: #334155; margin: 30px 0;">
          <p style="font-size: 12px; color: #94a3b8;">Este link expira em 1 hora.<br>Se o botão não funcionar, copie e cole este link no seu navegador:<br><a href="${link}" style="color: #60a5fa;">${link}</a></p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    logger.info(`E-mail de recuperação enviado para ${paraEmail}`);
    return true;
  } catch (error) {
    logger.error("Erro ao enviar e-mail de recuperação de senha:", error);
    return false;
  }
};

const enviarEmailRecibo = async (paraEmail, nome, valor, tokens) => {
  try {
    const mailOptions = {
      from: `"Moeda Arena" <${process.env.EMAIL_USER}>`,
      to: paraEmail,
      subject: "Pagamento Aprovado! Seus Tokens chegaram 🚀",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px; border-radius: 8px; text-align: center; max-width: 600px; margin: auto; border: 1px solid #334155;">
          <h2 style="color: #10b981;">✅ Pagamento Aprovado!</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">Olá, <strong>${nome}</strong>! Que excelente notícia.</p>
          <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">Seu pagamento de <strong>R$ ${valor}</strong> foi processado com sucesso e os tokens já estão na sua conta!</p>
          
          <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin: 0; color: #f59e0b;">+${tokens} TOKENS</h3>
            <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 14px;">Creditados na Moeda Arena</p>
          </div>

          <a href="${config.corsOrigin}" style="display: inline-block; background-color: #f59e0b; color: #000; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px;">
            Acessar Minha Conta
          </a>
          <hr style="border-color: #334155; margin: 30px 0;">
          <p style="font-size: 12px; color: #94a3b8;">Obrigado por comprar na Moeda Arena! Precisando de ajuda, responda este e-mail.</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    logger.info(`Recibo enviado para ${paraEmail}`);
    return true;
  } catch (error) {
    logger.error("Erro ao enviar recibo:", error);
    return false;
  }
};

module.exports = {
  enviarEmailVerificacao,
  enviarEmailRecuperacao,
  enviarEmailRecibo,
};
