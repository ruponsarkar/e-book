const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Slow down password guessing: 10 attempts per 15 minutes per IP.
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, books: user.books, offlineDays: config.offlineDays };
}

function startSession(user, { deviceId, deviceName, platform }) {
  const sid = crypto.randomUUID();
  // Replacing activeSession signs out whichever device held the previous one.
  user.activeSession = { id: sid, deviceId, deviceName: deviceName || '', platform: platform || '' };
  const token = jwt.sign({ sub: String(user._id), sid }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  return token;
}

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password, deviceId, deviceName, platform } = req.body || {};
  if (!email || !password || !deviceId) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'Email, password and device id are required.' });
  }
  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  const ok = user && (await bcrypt.compare(String(password), user.passwordHash));
  if (!ok) return res.status(401).json({ code: 'BAD_CREDENTIALS', message: 'Wrong email or password.' });
  if (user.disabled) return res.status(403).json({ code: 'ACCOUNT_DISABLED', message: 'This account is not active.' });

  const replacedOtherDevice = Boolean(user.activeSession && user.activeSession.deviceId !== deviceId);
  const token = startSession(user, { deviceId, deviceName, platform });
  await user.save();
  res.json({ token, user: publicUser(user), replacedOtherDevice });
});

router.post('/signup', loginLimiter, async (req, res) => {
  if (!config.allowSignup) return res.status(403).json({ code: 'SIGNUP_CLOSED', message: 'Accounts are created by the publisher.' });
  const { name, email, password, deviceId, deviceName, platform } = req.body || {};
  if (!email || !password || String(password).length < 8 || !deviceId) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'Email, a password of 8+ characters and device id are required.' });
  }
  const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (exists) return res.status(409).json({ code: 'EMAIL_TAKEN', message: 'An account with this email already exists.' });
  const user = new User({ name, email, passwordHash: await bcrypt.hash(String(password), 12) });
  const token = startSession(user, { deviceId, deviceName, platform });
  await user.save();
  res.status(201).json({ token, user: publicUser(user) });
});

// The app calls this on start, on returning to the foreground and every minute,
// so a phone that was replaced is signed out quickly.
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.post('/logout', requireAuth, async (req, res) => {
  req.user.activeSession = null;
  await req.user.save();
  res.json({ ok: true });
});

module.exports = router;
