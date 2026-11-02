const jwt = require('jsonwebtoken');

function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'devsync-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'devsync-secret', {
    expiresIn: process.env.REFRESH_TOKEN_TTL || '7d'
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || 'devsync-secret');
}

module.exports = { signAccessToken, signRefreshToken, verifyToken };
