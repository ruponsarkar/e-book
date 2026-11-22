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
  // Admin panel tokens carry web: true and use the admin's separate browser session.
  const session = payload.web ? user.role === 'admin' && user.webSession : user.activeSession;
  if (!session || session.id !== payload.sid) {
    return res.status(401).json({
      code: 'SESSION_REPLACED',
      message: payload.web
        ? 'You were signed out of the admin panel because it was opened in another browser.'
        : 'You were logged out because this account was signed in on another device.',
    });
  }

  // "Last seen", written at most once a minute per user.
  const now = Date.now();
  if (!payload.web && (!user.lastSeenAt || now - user.lastSeenAt.getTime() > 60 * 1000)) {
    user.lastSeenAt = new Date(now);
    User.updateOne({ _id: user._id }, { $set: { lastSeenAt: user.lastSeenAt } }).catch(() => {});
  }

  req.user = user;
  req.isWeb = Boolean(payload.web);
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
