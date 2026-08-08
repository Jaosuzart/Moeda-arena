/**
 * @module server
 * @description Ponto de entrada da aplicação.
 *              Configura middleware de segurança, rotas, error handler,
 *              testa conexão com o banco e implementa graceful shutdown.
 */
const config = require('./src/config/env');
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./src/config/logger');
const { testarConexao, encerrarPool } = require('./src/models/db');
const errorHandler = require('./src/middlewares/errorHandler');

const authRoutes = require('./src/routes/authRoutes');
const planoRoutes = require('./src/routes/planoRoutes');
const compraRoutes = require('./src/routes/compraRoutes');
const webhookRoutes = require('./src/routes/webhookRoutes');
const gameRoutes = require('./src/routes/gameRoutes');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false  
}));

app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    sucesso: false,
    erro: 'Muitas requisições. Tente novamente em 1 minuto.',
    codigo: 'RATE_LIMIT_EXCEDIDO'
  }
});
app.use('/api', limiter);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api', planoRoutes);
app.use('/api', compraRoutes);
app.use('/webhook', webhookRoutes);
app.use('/api/games', gameRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    ambiente: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

const iniciar = async () => {
  try {
    await testarConexao();

    const server = app.listen(config.port, () => {
      logger.info(`Servidor rodando em http://localhost:${config.port}`, {
        ambiente: config.nodeEnv,
        porta: config.port
      });
    });

    const encerrar = async (sinal) => {
      logger.info(`Sinal ${sinal} recebido. Iniciando shutdown gracioso...`);

      server.close(async () => {
        logger.info('Servidor HTTP encerrado. Fechando conexões com o banco...');
        await encerrarPool();
        logger.info('Shutdown completo. Até logo!');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Shutdown gracioso excedeu o tempo limite. Forçando encerramento.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => encerrar('SIGTERM'));
    process.on('SIGINT', () => encerrar('SIGINT'));

  } catch (err) {
    logger.error('Falha crítica ao iniciar o servidor:', { erro: err.message });
    logger.error('Verifique as configurações do .env e se o banco de dados está acessível.');
    process.exit(1);
  }
};

iniciar();
