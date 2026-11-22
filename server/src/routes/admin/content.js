const { Book, Section } = require('../../models/Book');
const User = require('../../models/User');
const { hashOf, slugify, checkSection } = require('../../lib/sections');

const bad = (res, message, status = 400) => res.status(status).json({ code: 'BAD_REQUEST', message });
const KINDS = ['front', 'chapter', 'test'];
const titleFrom = (md) => md.match(/^#\s+(.+)$/m)?.[1].trim();

function sectionRow(s) {
  return { key: s.key, title: s.title, kind: s.kind, order: s.order, updatedAt: s.updatedAt, ...checkSection(s.markdown, s.kind) };
}

module.exports = (router) => {
  // ---- Books (subjects) ----------------------------------------------------

  router.get('/books', async (req, res) => {
    const [books, counts, readers] = await Promise.all([
      Book.find().sort({ title: 1 }).lean(),
      Section.aggregate([{ $group: { _id: { b: '$bookSlug', k: '$kind' }, n: { $sum: 1 } } }]),
      User.aggregate([{ $match: { role: 'student' } }, { $unwind: '$books' }, { $group: { _id: '$books', n: { $sum: 1 } } }]),
    ]);
    const c = {};
    for (const r of counts) (c[r._id.b] ||= { front: 0, chapter: 0, test: 0 })[r._id.k] = r.n;
    const rd = new Map(readers.map((r) => [r._id, r.n]));
    res.json({
      books: books.map((b) => ({
        slug: b.slug,
        title: b.title,
        subtitle: b.subtitle,
        edition: b.edition,
        published: b.published,
        updatedAt: b.updatedAt,
        sections: c[b.slug] || { front: 0, chapter: 0, test: 0 },
        students: rd.get(b.slug) || 0,
      })),
    });
  });

  router.post('/books', async (req, res) => {
    const { title, subtitle = '', edition = '', published = false } = req.body || {};
    const slug = slugify(req.body?.slug || title);
    if (!title || !slug) return bad(res, 'A title is needed.');
    if (await Book.exists({ slug })) return bad(res, `A book with the id "${slug}" already exists.`, 409);
    const book = await Book.create({ slug, title: title.trim(), subtitle, edition, published: Boolean(published) });
    res.status(201).json({ book });
  });

  router.patch('/books/:slug', async (req, res) => {
    const book = await Book.findOne({ slug: req.params.slug });
    if (!book) return bad(res, 'Book not found.', 404);
    for (const f of ['title', 'subtitle', 'edition']) if (typeof req.body?.[f] === 'string') book[f] = req.body[f].trim();
    if (typeof req.body?.published === 'boolean') book.published = req.body.published;
    if (!book.title) return bad(res, 'A title is needed.');
    await book.save();
    res.json({ book });
  });

  // Deletes the book and its sections, and removes it from every student. Test history is kept.
  router.delete('/books/:slug', async (req, res) => {
    const { slug } = req.params;
    await Section.deleteMany({ bookSlug: slug });
    await User.updateMany({ books: slug }, { $pull: { books: slug } });
    await Book.deleteOne({ slug });
    res.json({ ok: true });
  });

  // ---- Sections (chapters and test papers) ---------------------------------

  router.get('/books/:slug', async (req, res) => {
    const book = await Book.findOne({ slug: req.params.slug }).lean();
    if (!book) return bad(res, 'Book not found.', 404);
    const sections = await Section.find({ bookSlug: book.slug }).sort({ order: 1 }).lean();
    res.json({ book, sections: sections.map(sectionRow) });
  });

  router.get('/books/:slug/sections/:key', async (req, res) => {
    const s = await Section.findOne({ bookSlug: req.params.slug, key: req.params.key }).lean();
    if (!s) return bad(res, 'Section not found.', 404);
    res.json({ section: { ...sectionRow(s), markdown: s.markdown } });
  });

  // Live check while editing (nothing is saved).
  router.post('/check-section', async (req, res) => {
    res.json(checkSection(String(req.body?.markdown || ''), req.body?.kind));
  });

  router.post('/books/:slug/sections', async (req, res) => {
    const { slug } = req.params;
    if (!(await Book.exists({ slug }))) return bad(res, 'Book not found.', 404);
    const markdown = String(req.body?.markdown || '').replace(/\r\n/g, '\n');
    const kind = KINDS.includes(req.body?.kind) ? req.body.kind : 'chapter';
    const title = String(req.body?.title || '').trim() || titleFrom(markdown);
    if (!title) return bad(res, 'A title is needed (or a "# Title" line at the top of the text).');
    if (!markdown.trim()) return bad(res, 'The section text is empty.');

    let key = slugify(req.body?.key || title) || 'section';
    for (let i = 2; await Section.exists({ bookSlug: slug, key }); i++) key = `${slugify(req.body?.key || title)}-${i}`;
    const last = await Section.findOne({ bookSlug: slug }).sort({ order: -1 }).select('order').lean();
    const s = await Section.create({ bookSlug: slug, key, title, kind, markdown, order: (last?.order ?? -1) + 1, hash: hashOf(markdown) });
    res.status(201).json({ section: { ...sectionRow(s.toObject()), markdown } });
  });

  router.put('/books/:slug/sections/:key', async (req, res) => {
    const s = await Section.findOne({ bookSlug: req.params.slug, key: req.params.key });
    if (!s) return bad(res, 'Section not found.', 404);
    if (typeof req.body?.markdown === 'string') {
      const md = req.body.markdown.replace(/\r\n/g, '\n');
      if (!md.trim()) return bad(res, 'The section text is empty.');
      s.markdown = md;
      s.hash = hashOf(md); // makes the app download the new text
    }
    if (typeof req.body?.title === 'string' && req.body.title.trim()) s.title = req.body.title.trim();
    if (KINDS.includes(req.body?.kind)) s.kind = req.body.kind;
    await s.save();
    res.json({ section: { ...sectionRow(s.toObject()), markdown: s.markdown } });
  });

  router.delete('/books/:slug/sections/:key', async (req, res) => {
    await Section.deleteOne({ bookSlug: req.params.slug, key: req.params.key });
    res.json({ ok: true });
  });

  // { keys: [...] } in the new order.
  router.post('/books/:slug/order', async (req, res) => {
    const keys = Array.isArray(req.body?.keys) ? req.body.keys : [];
    await Section.bulkWrite(
      keys.map((key, order) => ({ updateOne: { filter: { bookSlug: req.params.slug, key }, update: { $set: { order } } } }))
    );
    res.json({ ok: true });
  });
};
