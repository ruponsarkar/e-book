const express = require('express');
const Query = require('../models/Query');
const { logActivity } = require('../models/Activity');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const CATEGORIES = ['problem', 'content', 'account', 'suggestion', 'other'];
const clip = (s, n) => String(s || '').trim().slice(0, n);

function view(q) {
  return {
    id: q._id,
    category: q.category,
    subject: q.subject,
    status: q.status,
    messages: q.messages,
    unread: q.studentUnread,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  };
}

router.get('/', async (req, res) => {
  const rows = await Query.find({ userId: req.user._id }).sort({ updatedAt: -1 }).limit(50).lean();
  res.json({ queries: rows.map(view) });
});

router.post('/', async (req, res) => {
  const { category, subject, message, context = {} } = req.body || {};
  const text = clip(message, 4000);
  if (!text) return res.status(400).json({ code: 'BAD_REQUEST', message: 'Please write your message.' });
  const q = await Query.create({
    userId: req.user._id,
    category: CATEGORIES.includes(category) ? category : 'other',
    subject: clip(subject, 120) || text.slice(0, 60),
    messages: [{ from: 'student', text }],
    context: {
      bookSlug: clip(context.bookSlug, 80),
      sectionKey: clip(context.sectionKey, 120),
      appVersion: clip(context.appVersion, 30),
      device: clip(context.device, 120),
    },
  });
  logActivity(req.user._id, 'query', { detail: q.subject });
  res.status(201).json({ query: view(q) });
});

router.get('/:id', async (req, res) => {
  const q = await Query.findOne({ _id: req.params.id, userId: req.user._id }).catch(() => null);
  if (!q) return res.status(404).json({ code: 'NOT_FOUND', message: 'Not found.' });
  if (q.studentUnread) {
    q.studentUnread = false;
    await q.save();
  }
  res.json({ query: view(q) });
});

// A follow-up from the student re-opens the conversation.
router.post('/:id/messages', async (req, res) => {
  const text = clip(req.body?.message, 4000);
  if (!text) return res.status(400).json({ code: 'BAD_REQUEST', message: 'Please write your message.' });
  const q = await Query.findOne({ _id: req.params.id, userId: req.user._id }).catch(() => null);
  if (!q) return res.status(404).json({ code: 'NOT_FOUND', message: 'Not found.' });
  q.messages.push({ from: 'student', text });
  q.status = 'open';
  await q.save();
  res.json({ query: view(q) });
});

module.exports = router;
