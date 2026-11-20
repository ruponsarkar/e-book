const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

// Verifies the token AND that its session is still the user's active one.
// If the user has since logged in on another phone, this phone gets SESSION_REPLACED.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ code: 'NO_TOKEN', message: 'Please log in.' });

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    return res.status(401).json({ code: 'INVALID_TOKEN', message: 'Your login has expired. Please log in again.' });
  }

  const user = await User.findById(payload.sub);
  if (!user || user.disabled) {
    return res.status(401).json({ code: 'ACCOUNT_DISABLED', message: 'This account is not active.' });
  }
  if (!user.activeSession || user.activeSession.id !== payload.sid) {
    return res.status(401).json({
      code: 'SESSION_REPLACED',
      message: 'You were logged out because this account was signed in on another device.',
    });
  }

  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ code: 'FORBIDDEN', message: 'Admins only.' });
  next();
}

function canReadBook(user, slug) {
  return user.role === 'admin' || user.books.includes(slug);
}

module.exports = { requireAuth, requireAdmin, canReadBook };
