const Query = require('../../models/Query');
const { Notification } = require('../../models/Notification');

const bad = (res, message, status = 400) => res.status(status).json({ code: 'BAD_REQUEST', message });

function view(q) {
  const u = q.userId && typeof q.userId === 'object' ? q.userId : null;
  return {
    id: q._id,
    category: q.category,
    subject: q.subject,
    status: q.status,
    messages: q.messages,
    context: q.context,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
    userId: u?._id || q.userId,
    userName: u?.name || '',
    userEmail: u?.email || '',
  };
}

module.exports = (router) => {
  router.get('/queries', async (req, res) => {
    const filter = ['open', 'answered', 'closed'].includes(req.query.status) ? { status: req.query.status } : {};
    const [rows, counts] = await Promise.all([
      Query.find(filter).sort({ updatedAt: -1 }).limit(300).populate('userId', 'name email').lean(),
      Query.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    ]);
    res.json({ queries: rows.map(view), counts: Object.fromEntries(counts.map((c) => [c._id, c.n])) });
  });

  router.get('/queries/:id', async (req, res) => {
    const q = await Query.findById(req.params.id).populate('userId', 'name email').lean().catch(() => null);
    if (!q) return bad(res, 'Not found.', 404);
    res.json({ query: view(q) });
  });

  // Reply to the student. They get a notification in the app.
  router.post('/queries/:id/reply', async (req, res) => {
    const text = String(req.body?.message || '').trim().slice(0, 4000);
    if (!text) return bad(res, 'Write a reply first.');
    const q = await Query.findById(req.params.id).catch(() => null);
    if (!q) return bad(res, 'Not found.', 404);
    q.messages.push({ from: 'admin', text });
    q.status = req.body?.close ? 'closed' : 'answered';
    q.studentUnread = true;
    await q.save();
    await Notification.create({
      title: `Reply: ${q.subject}`.slice(0, 120),
      body: text.slice(0, 500),
      audience: 'users',
      userIds: [q.userId],
      kind: 'reply',
      queryId: q._id,
    });
    const full = await Query.findById(q._id).populate('userId', 'name email').lean();
    res.json({ query: view(full) });
  });

  router.patch('/queries/:id', async (req, res) => {
    if (!['open', 'answered', 'closed'].includes(req.body?.status)) return bad(res, 'Unknown status.');
    const q = await Query.findByIdAndUpdate(req.params.id, { $set: { status: req.body.status } }, { new: true })
      .populate('userId', 'name email')
      .lean()
      .catch(() => null);
    if (!q) return bad(res, 'Not found.', 404);
    res.json({ query: view(q) });
  });
};
