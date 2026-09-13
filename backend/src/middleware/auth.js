const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { jwtSecret } = require('../config/env');

const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Authentication token required');
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token');
  }
});

module.exports = { requireAuth };
