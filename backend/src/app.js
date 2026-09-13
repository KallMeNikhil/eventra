const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { corsOrigin } = require('./config/env');

const MONGOOSE_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req, res) => {
    const readyState = mongoose.connection.readyState;
    const dbStatus = MONGOOSE_STATES[readyState] || 'unknown';
    const isReady = readyState === 1;
    res.status(isReady ? 200 : 503).json({ status: isReady ? 'ok' : 'unavailable', db: dbStatus });
  });
  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
