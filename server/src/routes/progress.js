const express = require('express');
const bcrypt = require('bcryptjs');
const { Book, Section } = require('../models/Book');
const TestAttempt = require('../models/TestAttempt');
const { requireAuth, canReadBook } = require('../middleware/auth');
const { grade, cleanAnswers } = require('../lib/testKey');
const { logActivity } = require('../models/Activity');

const router = express.Router();
router.use(requireAuth);
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, private');
  next();
});

function summary(a) {
  return {
    id: a._id,
    bookSlug: a.bookSlug,
    sectionKey: a.sectionKey,
    total: a.total,
    correct: a.correct,
    wrong: a.wrong,
    skipped: a.skipped,
    percent: a.percent,
    submittedAt: a.submittedAt,
  };
}

// Loads the test paper and checks the user may read it.
async function testSection(req, res) {
  const { slug, key } = req.params;
  if (!canReadBook(req.user, slug)) {
    res.status(403).json({ code: 'NO_ACCESS', message: 'You do not have access to this book.' });
    return null;
  }
  const section = await Section.findOne({ bookSlug: slug, key, kind: 'test' }).lean();
  if (!section) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Test paper not found.' });
    return null;
  }
  return section;
}

const base = (req) => ({ userId: req.user._id, bookSlug: req.params.slug, sectionKey: req.params.key });

// ---- One test paper ---------------------------------------------------------

// Saved answers (if a sitting is in progress) and past results for this paper.
router.get('/tests/:slug/:key', async (req, res) => {
  if (!(await testSection(req, res))) return;
  const [draft, attempts] = await Promise.all([
    TestAttempt.findOne({ ...base(req), status: 'in_progress' }).lean(),
    TestAttempt.find({ ...base(req), status: 'submitted' }).sort({ submittedAt: -1 }).limit(20).lean(),
  ]);
  res.json({
    draft: draft ? { answers: draft.answers || {}, updatedAt: draft.updatedAt } : null,
    attempts: attempts.map(summary),
    best: attempts.length ? Math.max(...attempts.map((a) => a.percent)) : null,
  });
});

// Called (debounced) as the student picks answers.
router.put('/tests/:slug/:key/draft', async (req, res) => {
  if (!(await testSection(req, res))) return;
  const answers = cleanAnswers(req.body?.answers);
  await TestAttempt.updateOne(
    { ...base(req), status: 'in_progress' },
    { $set: { answers } },
    { upsert: true }
  );
  res.json({ ok: true });
});

// "Retake": throw away the sitting in progress.
router.delete('/tests/:slug/:key/draft', async (req, res) => {
  if (!(await testSection(req, res))) return;
  await TestAttempt.deleteOne({ ...base(req), status: 'in_progress' });
  res.json({ ok: true });
});

// Grades on the server from the paper's own answer key and stores the result.
router.post('/tests/:slug/:key/submit', async (req, res) => {
  const section = await testSection(req, res);
  if (!section) return;
  const answers = cleanAnswers(req.body?.answers);
  const result = grade(section.markdown, answers);
  const attempt = await TestAttempt.create({
    ...base(req),
    status: 'submitted',
    answers,
    ...result,
    submittedAt: new Date(),
  });
  await TestAttempt.deleteOne({ ...base(req), status: 'in_progress' });
  logActivity(req.user._id, 'test_submit', {
    bookSlug: req.params.slug,
    sectionKey: req.params.key,
    detail: `${result.correct}/${result.total} correct · ${result.percent}%`,
  });
  res.status(201).json({ attempt: summary(attempt) });
});

// ---- Per book: status of every test paper (for the contents list) ------------

router.get('/books/:slug', async (req, res) => {
  const { slug } = req.params;
  if (!canReadBook(req.user, slug)) return res.status(403).json({ code: 'NO_ACCESS', message: 'You do not have access to this book.' });
  const rows = await TestAttempt.find({ userId: req.user._id, bookSlug: slug }).sort({ submittedAt: 1 }).lean();
  const tests = {};
  for (const a of rows) {
    const t = (tests[a.sectionKey] ||= { attempts: 0, best: null, last: null, inProgress: false, answered: 0 });
    if (a.status === 'in_progress') {
      t.inProgress = true;
      t.answered = Object.keys(a.answers || {}).length;
    } else {
      t.attempts++;
      t.last = a.percent;
      t.best = t.best == null ? a.percent : Math.max(t.best, a.percent);
    }
  }
  res.json({ tests });
});

// ---- Profile ---------------------------------------------------------------

router.get('/profile', async (req, res) => {
  const u = req.user;
  const bookFilter = { published: true, ...(u.role === 'admin' ? {} : { slug: { $in: u.books } }) };
  const books = await Book.find(bookFilter).sort({ title: 1 }).lean();
  const slugs = books.map((b) => b.slug);

  const [testCounts, submitted, drafts] = await Promise.all([
    Section.aggregate([{ $match: { bookSlug: { $in: slugs }, kind: 'test' } }, { $group: { _id: '$bookSlug', n: { $sum: 1 } } }]),
    TestAttempt.find({ userId: u._id, status: 'submitted', bookSlug: { $in: slugs } }).sort({ submittedAt: -1 }).lean(),
    TestAttempt.countDocuments({ userId: u._id, status: 'in_progress', bookSlug: { $in: slugs } }),
  ]);

  const titles = await Section.find({ bookSlug: { $in: slugs }, kind: 'test' }).select('bookSlug key title').lean();
  const titleOf = new Map(titles.map((s) => [`${s.bookSlug}/${s.key}`, s.title]));
  const countOf = new Map(testCounts.map((c) => [c._id, c.n]));

  // Best score per paper, so retakes don't count twice.
  const bestPerPaper = new Map();
  for (const a of submitted) {
    const k = `${a.bookSlug}/${a.sectionKey}`;
    bestPerPaper.set(k, Math.max(bestPerPaper.get(k) ?? 0, a.percent));
  }
  const bests = [...bestPerPaper.values()];
  const avg = (xs) => (xs.length ? Math.round(xs.reduce((s, x) => s + x, 0) / xs.length) : null);

  res.json({
    user: { name: u.name, email: u.email, role: u.role, memberSince: u.createdAt, device: u.activeSession?.deviceName || '' },
    stats: {
      attempts: submitted.length,
      papersDone: bestPerPaper.size,
      papersTotal: [...countOf.values()].reduce((s, n) => s + n, 0),
      average: avg(submitted.map((a) => a.percent)),
      best: bests.length ? Math.max(...bests) : null,
      inProgress: drafts,
    },
    books: books.map((b) => {
      const mine = [...bestPerPaper.entries()].filter(([k]) => k.startsWith(`${b.slug}/`)).map(([, v]) => v);
      return { slug: b.slug, title: b.title, papersTotal: countOf.get(b.slug) || 0, papersDone: mine.length, average: avg(mine) };
    }),
    recent: submitted.slice(0, 10).map((a) => ({
      ...summary(a),
      bookTitle: books.find((b) => b.slug === a.bookSlug)?.title || a.bookSlug,
      title: titleOf.get(`${a.bookSlug}/${a.sectionKey}`) || a.sectionKey,
    })),
  });
});

router.patch('/profile', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 80) : null;
  if (name === null) return res.status(400).json({ code: 'BAD_REQUEST', message: 'Name is required.' });
  req.user.name = name;
  await req.user.save();
  res.json({ ok: true, name });
});

router.post('/profile/password', async (req, res) => {
  const { current, next } = req.body || {};
  if (!current || !next || String(next).length < 8) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'Enter your current password and a new one of 8+ characters.' });
  }
  if (!(await bcrypt.compare(String(current), req.user.passwordHash))) {
    return res.status(400).json({ code: 'BAD_PASSWORD', message: 'Your current password is not correct.' });
  }
  req.user.passwordHash = await bcrypt.hash(String(next), 12);
  await req.user.save(); // this phone stays signed in
  res.json({ ok: true });
});

module.exports = router;
