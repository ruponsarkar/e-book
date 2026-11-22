const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Query = require('../../models/Query');
const TestAttempt = require('../../models/TestAttempt');
const { Book, Section, ScreenshotEvent } = require('../../models/Book');
const { Activity } = require('../../models/Activity');
const { NotificationRead } = require('../../models/Notification');
const config = require('../../config');
const { daysAgo } = require('../../lib/time');
const { describeEvents } = require('./activity');

const bad = (res, message, status = 400) => res.status(status).json({ code: 'BAD_REQUEST', message });

function row(u, extra = {}) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    books: u.books,
    disabled: u.disabled,
    createdAt: u.createdAt,
    lastSeenAt: u.lastSeenAt,
    device: u.activeSession ? [u.activeSession.deviceName, u.activeSession.platform].filter(Boolean).join(' · ') : '',
    signedIn: Boolean(u.activeSession),
    ...extra,
  };
}

async function validBooks(slugs) {
  if (!Array.isArray(slugs)) return null;
  const found = new Set((await Book.find({ slug: { $in: slugs } }).select('slug').lean()).map((b) => b.slug));
  return slugs.filter((s) => found.has(s));
}

module.exports = (router) => {
  // All users with their last-7-days time and test counts.
  router.get('/users', async (req, res) => {
    const q = String(req.query.q || '').trim();
    const filter = {};
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ email: rx }, { name: rx }];
    }
    const users = await User.find(filter).sort({ createdAt: -1 }).select('-passwordHash').lean();
    const ids = users.map((u) => u._id);
    const [time, tests] = await Promise.all([
      Activity.aggregate([
        { $match: { userId: { $in: ids }, type: 'session', at: { $gte: daysAgo(6) } } },
        { $group: { _id: '$userId', sec: { $sum: '$durationSec' } } },
      ]),
      TestAttempt.aggregate([
        { $match: { userId: { $in: ids }, status: 'submitted' } },
        { $group: { _id: '$userId', n: { $sum: 1 }, avg: { $avg: '$percent' } } },
      ]),
    ]);
    const t = new Map(time.map((r) => [String(r._id), r.sec]));
    const s = new Map(tests.map((r) => [String(r._id), r]));
    res.json({
      users: users.map((u) =>
        row(u, {
          minutesWeek: Math.round((t.get(String(u._id)) || 0) / 60),
          tests: s.get(String(u._id))?.n || 0,
          average: s.has(String(u._id)) ? Math.round(s.get(String(u._id)).avg) : null,
        })
      ),
    });
  });

  // Everything about one student.
  router.get('/users/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return bad(res, 'Bad id', 404);
    const u = await User.findById(req.params.id).select('-passwordHash').lean();
    if (!u) return bad(res, 'User not found.', 404);
    const uid = u._id;

    const [daily, byBook, bySection, tests, recent, queries, totals] = await Promise.all([
      Activity.aggregate([
        { $match: { userId: uid, type: 'session', at: { $gte: daysAgo(29) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$at', timezone: config.adminTz } },
            sec: { $sum: '$durationSec' },
          },
        },
        { $project: { day: '$_id', _id: 0, minutes: { $round: [{ $divide: ['$sec', 60] }, 0] } } },
        { $sort: { day: 1 } },
      ]),
      Activity.aggregate([
        { $match: { userId: uid, type: 'read' } },
        { $group: { _id: '$bookSlug', sec: { $sum: '$durationSec' } } },
        { $sort: { sec: -1 } },
      ]),
      Activity.aggregate([
        { $match: { userId: uid, type: 'read' } },
        { $group: { _id: { b: '$bookSlug', s: '$sectionKey' }, sec: { $sum: '$durationSec' }, opens: { $sum: 1 }, last: { $max: '$at' } } },
        { $sort: { sec: -1 } },
        { $limit: 15 },
      ]),
      TestAttempt.find({ userId: uid, status: 'submitted' }).sort({ submittedAt: -1 }).limit(50).lean(),
      Activity.find({ userId: uid }).sort({ at: -1 }).limit(60).lean(),
      Query.find({ userId: uid }).sort({ updatedAt: -1 }).limit(20).lean(),
      Activity.aggregate([
        { $match: { userId: uid } },
        { $group: { _id: '$type', n: { $sum: 1 }, sec: { $sum: '$durationSec' } } },
      ]),
    ]);

    const books = new Map((await Book.find().select('slug title').lean()).map((b) => [b.slug, b.title]));
    const pairs = [...bySection.map((r) => r._id), ...tests.map((t) => ({ b: t.bookSlug, s: t.sectionKey }))];
    const sections = pairs.length
      ? await Section.find({ $or: pairs.map((p) => ({ bookSlug: p.b, key: p.s })) }).select('bookSlug key title').lean()
      : [];
    const st = new Map(sections.map((s) => [`${s.bookSlug}/${s.key}`, s.title]));
    const tot = Object.fromEntries(totals.map((r) => [r._id, r]));

    res.json({
      user: row(u, { deviceSince: u.activeSession?.createdAt || null }),
      totals: {
        minutes: Math.round((tot.session?.sec || 0) / 60),
        readingMinutes: Math.round((tot.read?.sec || 0) / 60),
        logins: tot.login?.n || 0,
        screenshots: tot.screenshot?.n || 0,
      },
      daily,
      byBook: byBook.map((r) => ({ slug: r._id, title: books.get(r._id) || r._id, minutes: Math.round(r.sec / 60) })),
      topSections: bySection.map((r) => ({
        bookSlug: r._id.b,
        sectionKey: r._id.s,
        title: st.get(`${r._id.b}/${r._id.s}`) || r._id.s,
        bookTitle: books.get(r._id.b) || r._id.b,
        minutes: Math.round(r.sec / 60),
        opens: r.opens,
        last: r.last,
      })),
      tests: tests.map((t) => ({
        id: t._id,
        bookTitle: books.get(t.bookSlug) || t.bookSlug,
        title: st.get(`${t.bookSlug}/${t.sectionKey}`) || t.sectionKey,
        correct: t.correct,
        wrong: t.wrong,
        skipped: t.skipped,
        total: t.total,
        percent: t.percent,
        submittedAt: t.submittedAt,
      })),
      recent: await describeEvents(recent),
      queries: queries.map((q) => ({ id: q._id, subject: q.subject, status: q.status, updatedAt: q.updatedAt })),
    });
  });

  router.post('/users', async (req, res) => {
    const { name = '', email, password, books = [] } = req.body || {};
    const address = String(email || '').toLowerCase().trim();
    if (!address.includes('@')) return bad(res, 'Enter a valid email.');
    if (!password || String(password).length < 8) return bad(res, 'The password needs 8+ characters.');
    if (await User.exists({ email: address })) return bad(res, 'An account with this email already exists.', 409);
    const user = await User.create({
      name: String(name).trim(),
      email: address,
      books: (await validBooks(books)) || [],
      passwordHash: await bcrypt.hash(String(password), 12),
    });
    res.status(201).json({ user: row(user.toObject()) });
  });

  // Change name, books, disabled, or set a new password.
  router.patch('/users/:id', async (req, res) => {
    const { name, books, disabled, password } = req.body || {};
    const user = await User.findById(req.params.id).catch(() => null);
    if (!user) return bad(res, 'User not found.', 404);
    if (typeof name === 'string') user.name = name.trim().slice(0, 80);
    if (Array.isArray(books)) user.books = await validBooks(books);
    if (typeof disabled === 'boolean') {
      if (disabled && String(user._id) === String(req.user._id)) return bad(res, "You can't disable your own account.");
      user.disabled = disabled;
      if (disabled) user.activeSession = null;
    }
    if (password) {
      if (String(password).length < 8) return bad(res, 'The password needs 8+ characters.');
      user.passwordHash = await bcrypt.hash(String(password), 12);
      user.activeSession = null;
    }
    await user.save();
    res.json({ user: row(user.toObject()) });
  });

  // Signs the user out of their phone (for a lost phone, for example).
  router.post('/users/:id/reset-session', async (req, res) => {
    await User.updateOne({ _id: req.params.id }, { $set: { activeSession: null } });
    res.json({ ok: true });
  });

  // Deletes the account and everything recorded about it.
  router.delete('/users/:id', async (req, res) => {
    if (String(req.params.id) === String(req.user._id)) return bad(res, "You can't delete your own account.");
    const user = await User.findById(req.params.id).catch(() => null);
    if (!user) return bad(res, 'User not found.', 404);
    const userId = user._id;
    await Promise.all([
      Activity.deleteMany({ userId }),
      TestAttempt.deleteMany({ userId }),
      Query.deleteMany({ userId }),
      NotificationRead.deleteMany({ userId }),
      ScreenshotEvent.deleteMany({ userId }),
    ]);
    await user.deleteOne();
    res.json({ ok: true });
  });

  router.get('/screenshot-events', async (req, res) => {
    const events = await ScreenshotEvent.find().sort({ createdAt: -1 }).limit(500).populate('userId', 'email name').lean();
    res.json({ events });
  });
};
