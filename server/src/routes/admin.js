const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ScreenshotEvent } = require('../models/Book');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get('/users', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).select('-passwordHash').lean();
  res.json({ users });
});

// Create a student account and give it access to books, e.g. { "books": ["assam-gk"] }.
router.post('/users', async (req, res) => {
  const { name, email, password, books = [] } = req.body || {};
  if (!email || !password || String(password).length < 8) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'Email and a password of 8+ characters are required.' });
  }
  const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (exists) return res.status(409).json({ code: 'EMAIL_TAKEN', message: 'An account with this email already exists.' });
  const user = await User.create({ name, email, books, passwordHash: await bcrypt.hash(String(password), 12) });
  res.status(201).json({ user: { id: user._id, email: user.email, books: user.books } });
});

router.patch('/users/:id', async (req, res) => {
  const { books, disabled, password } = req.body || {};
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ code: 'NOT_FOUND', message: 'User not found.' });
  if (Array.isArray(books)) user.books = books;
  if (typeof disabled === 'boolean') {
    user.disabled = disabled;
    if (disabled) user.activeSession = null;
  }
  if (password) {
    if (String(password).length < 8) return res.status(400).json({ code: 'BAD_REQUEST', message: 'Password must be 8+ characters.' });
    user.passwordHash = await bcrypt.hash(String(password), 12);
    user.activeSession = null;
  }
  await user.save();
  res.json({ ok: true });
});

// Signs the user out everywhere (for a lost phone, for example).
router.post('/users/:id/reset-session', async (req, res) => {
  await User.updateOne({ _id: req.params.id }, { $set: { activeSession: null } });
  res.json({ ok: true });
});

router.get('/screenshot-events', async (req, res) => {
  const events = await ScreenshotEvent.find().sort({ createdAt: -1 }).limit(500).populate('userId', 'email name').lean();
  res.json({ events });
});

module.exports = router;
