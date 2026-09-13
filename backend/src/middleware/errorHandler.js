const ApiError = require('../utils/ApiError');

function notFoundHandler(_req, _res, next) {
  next(new ApiError(404, 'Route not found'));
}

function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: { message: err.message, code: err.code } });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: { message: err.message, code: 'BAD_REQUEST' } });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: { message: 'Invalid identifier', code: 'BAD_REQUEST' } });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: { message: 'Duplicate resource', code: 'CONFLICT' } });
  }

  console.error(err);
  return res.status(500).json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } });
}

module.exports = { notFoundHandler, errorHandler };
