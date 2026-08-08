/**
 * @module config/logger
 * @description Logger estruturado com Winston.
 *              - Desenvolvimento: formato colorido e legível no console.
 *              - Produção: formato JSON para ferramentas como Datadog/ELK.
 */
const winston = require('winston');
const config = require('./env');

const formatoDesenvolvimento = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

const formatoProducao = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: config.nodeEnv === 'production' ? formatoProducao : formatoDesenvolvimento,
  transports: [
    new winston.transports.Console()
  ]
});

module.exports = logger;
