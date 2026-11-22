const mongoose = require('mongoose');
const { Activity, TYPES } = require('../../models/Activity');
const User = require('../../models/User');
const { Book, Section } = require('../../models/Book');

// Adds the student's name and the book/section titles to raw events.
async function describeEvents(events) {
  if (!events.length) return [];
  const userIds = [...new Set(events.map((e) => String(e.userId)))];
  const users = new Map((await User.find({ _id: { $in: userIds } }).select('name email').lean()).map((u) => [String(u._id), u]));
  const slugs = [...new Set(events.map((e) => e.bookSlug).filter(Boolean))];
  const books = new Map((await Book.find({ slug: { $in: slugs } }).select('slug title').lean()).map((b) => [b.slug, b.title]));
  const pairs = events.filter((e) => e.bookSlug && e.sectionKey).map((e) => ({ bookSlug: e.bookSlug, key: e.sectionKey }));
  const sections = pairs.length ? await Section.find({ $or: pairs }).select('bookSlug key title').lean() : [];
  const st = new Map(sections.map((s) => [`${s.bookSlug}/${s.key}`, s.title]));
  return events.map((e) => {
    const u = users.get(String(e.userId));
    return {
      id: e._id,
      type: e.type,
      at: e.at,
      durationSec: e.durationSec,
      detail: e.detail,
      userId: e.userId,
      userName: u?.name || '',
      userEmail: u?.email || '(deleted)',
      book: e.bookSlug ? books.get(e.bookSlug) || e.bookSlug : '',
      section: e.sectionKey ? st.get(`${e.bookSlug}/${e.sectionKey}`) || e.sectionKey : '',
    };
  });
}

function register(router) {
  // Activity feed, newest first. Filters: userId, type; paging with ?before=<ISO date>.
  router.get('/activity', async (req, res) => {
    const filter = {};
    if (req.query.userId && mongoose.isValidObjectId(req.query.userId)) filter.userId = req.query.userId;
    if (TYPES.includes(req.query.type)) filter.type = req.query.type;
    if (req.query.before) filter.at = { $lt: new Date(req.query.before) };
    const limit = Math.min(200, Number(req.query.limit) || 100);
    const rows = await Activity.find(filter).sort({ at: -1 }).limit(limit).lean();
    res.json({ events: await describeEvents(rows), more: rows.length === limit, types: TYPES });
  });
}

module.exports = register;
module.exports.describeEvents = describeEvents;
