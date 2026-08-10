const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('../config/logger');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const enviarEmailVerificacao = async (paraEmail, nome, token) => {
  try {
    const link = `https://token-arena.onrender.com/api/auth/verificar-email?token=${token}`;
    
    const mailOptions = {
      from: `"Token Arena" <${process.env.EMAIL_USER}>`,
      to: paraEmail,
      subject: 'Bem-vindo(a) ao Token Arena! Confirme seu E-mail',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center;">
          <h2 style="color: #3b82f6;">🎮 Bem-vindo(a) ao Token Arena, ${nome}!</h2>
          <p>Falta só mais um passo para você começar a aproveitar seus Tokens e subidas no Ranking.</p>
          <p>Por favor, confirme seu endereço de e-mail clicando no botão abaixo:</p>
          <a href="${link}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; margin-top: 15px;">
            Verificar Meu E-mail
          </a>
          <p style="margin-top: 25px; font-size: 12px; color: #94a3b8;">
            Se o botão não funcionar, copie e cole este link no seu navegador:<br>
            <a href="${link}" style="color: #60a5fa;">${link}</a>
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`E-mail de verificação enviado para ${paraEmail}`);
    return true;
  } catch (error) {
    logger.error('Erro ao enviar e-mail de verificação:', error);
    return false;
  }
};

module.exports = { enviarEmailVerificacao };
