const express = require('express');
const { Book, Section, ScreenshotEvent } = require('../models/Book');
const { requireAuth, canReadBook } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Book content must never be cached by proxies or the device's HTTP cache.
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, private');
  next();
});

router.get('/', async (req, res) => {
  const filter = { published: true };
  if (req.user.role !== 'admin') filter.slug = { $in: req.user.books };
  const books = await Book.find(filter).sort({ title: 1 }).lean();
  res.json({ books: books.map(({ slug, title, subtitle, edition }) => ({ slug, title, subtitle, edition })) });
});

// Table of contents only: no section text.
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  if (!canReadBook(req.user, slug)) return res.status(403).json({ code: 'NO_ACCESS', message: 'You do not have access to this book.' });
  const book = await Book.findOne({ slug, published: true }).lean();
  if (!book) return res.status(404).json({ code: 'NOT_FOUND', message: 'Book not found.' });
  const sections = await Section.find({ bookSlug: slug }).sort({ order: 1 }).select('key title kind order').lean();
  res.json({
    book: { slug: book.slug, title: book.title, subtitle: book.subtitle, edition: book.edition },
    sections: sections.map(({ key, title, kind, order }) => ({ key, title, kind, order })),
  });
});

// One section at a time, so the whole book is never sent in a single response.
router.get('/:slug/sections/:key', async (req, res) => {
  const { slug, key } = req.params;
  if (!canReadBook(req.user, slug)) return res.status(403).json({ code: 'NO_ACCESS', message: 'You do not have access to this book.' });
  const section = await Section.findOne({ bookSlug: slug, key }).lean();
  if (!section) return res.status(404).json({ code: 'NOT_FOUND', message: 'Section not found.' });
  res.json({ section: { key: section.key, title: section.title, kind: section.kind, markdown: section.markdown } });
});

router.post('/:slug/screenshot-events', async (req, res) => {
  await ScreenshotEvent.create({
    userId: req.user._id,
    bookSlug: req.params.slug,
    sectionKey: req.body?.sectionKey,
    platform: req.body?.platform,
  });
  res.json({ ok: true });
});

module.exports = router;
