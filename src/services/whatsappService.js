const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const logger = require('../config/logger');

let client;
let isReady = false;

const initWhatsApp = () => {
  try {
    client = new Client({
      authStrategy: new LocalAuth({ dataPath: '.whatsapp_auth' }),
      puppeteer: { 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    client.on('qr', (qr) => {
      logger.info('📱 Escaneie o QR Code abaixo para conectar o WhatsApp Bot:');
      qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
      isReady = true;
      logger.info('✅ WhatsApp Bot conectado e pronto para enviar mensagens!');
    });

    client.on('authenticated', () => {
      logger.info('WhatsApp Autenticado com sucesso.');
    });

    client.on('auth_failure', msg => {
      logger.error('Falha na autenticação do WhatsApp', { error: msg });
    });

    client.on('disconnected', (reason) => {
      isReady = false;
      logger.warn('WhatsApp desconectado', { reason });
    });

    client.initialize().catch(err => {
      logger.error('Erro ao inicializar WhatsApp:', err);
    });
  } catch (error) {
    logger.error('Falha crítica ao iniciar serviço de WhatsApp', { error: error.message });
  }
};

/**
 * Envia uma mensagem de texto para um número.
 * @param {string} telefone - Número com DDD (ex: 11999999999). Pode conter código do país ou caracteres não numéricos.
 * @param {string} mensagem - Texto da mensagem.
 */
const enviarMensagem = async (telefone, mensagem) => {
  if (!isReady || !client) {
    logger.warn('Tentativa de envio de WhatsApp ignorada. Bot não está pronto.', { telefone });
    return false;
  }

  if (!telefone) {
    logger.warn('Tentativa de envio sem número de telefone fornecido.');
    return false;
  }

  try {
    // Limpa o número de caracteres não numéricos
    let numeroLimpo = telefone.replace(/\D/g, '');
    
    // Adiciona o código do Brasil se não tiver
    if (numeroLimpo.length >= 10 && !numeroLimpo.startsWith('55')) {
      numeroLimpo = '55' + numeroLimpo;
    }

    const chatId = `${numeroLimpo}@c.us`;
    await client.sendMessage(chatId, mensagem);
    logger.info('Mensagem de WhatsApp enviada com sucesso.', { telefone: numeroLimpo });
    return true;
  } catch (error) {
    logger.error('Erro ao enviar mensagem no WhatsApp', { telefone, error: error.message });
    return false;
  }
};

module.exports = {
  initWhatsApp,
  enviarMensagem
};
