const bcrypt = require('bcryptjs');
const config = require('../../config');
const Registration = require('../../models/Registration');
const User = require('../../models/User');
const { Book } = require('../../models/Book');
const { startOfToday } = require('../../lib/time');

const bad = (res, message, status = 400) => res.status(status).json({ code: 'BAD_REQUEST', message });

function view(r) {
  return {
    id: r._id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    district: r.district,
    exams: r.exams,
    amount: r.amount / 100,
    status: r.status,
    orderId: r.orderId,
    paymentId: r.paymentId,
    method: r.method,
    paidAt: r.paidAt,
    paidVia: r.paidVia,
    fulfilled: r.fulfilled,
    fulfilledAt: r.fulfilledAt,
    userId: r.userId,
    adminNote: r.adminNote,
    source: r.source,
    createdAt: r.createdAt,
  };
}

module.exports = (router) => {
  // ?status=paid|pending|failed|todo (paid, account not sent yet)  &q=search
  router.get('/registrations', async (req, res) => {
    const filter = {};
    const s = req.query.status;
    if (s === 'todo') Object.assign(filter, { status: 'paid', fulfilled: false });
    else if (['paid', 'pending', 'failed'].includes(s)) filter.status = s;
    const q = String(req.query.q || '').trim();
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { paymentId: rx }];
    }
    const today = startOfToday();
    const [rows, todo, paid, paidToday, revenue] = await Promise.all([
      Registration.find(filter).sort({ createdAt: -1 }).limit(500).lean(),
      Registration.countDocuments({ status: 'paid', fulfilled: false }),
      Registration.countDocuments({ status: 'paid' }),
      Registration.countDocuments({ status: 'paid', paidAt: { $gte: today } }),
      Registration.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, sum: { $sum: '$amount' } } }]),
    ]);
    res.json({
      registrations: rows.map(view),
      summary: { todo, paid, paidToday, revenue: (revenue[0]?.sum || 0) / 100 },
      site: { playStoreUrl: config.site.playStoreUrl, name: config.site.name, price: config.site.priceInr },
    });
  });

  // Notes, "login sent", or marking a payment received outside Razorpay.
  router.patch('/registrations/:id', async (req, res) => {
    const r = await Registration.findById(req.params.id).catch(() => null);
    if (!r) return bad(res, 'Not found.', 404);
    const { adminNote, fulfilled, markPaid } = req.body || {};
    if (typeof adminNote === 'string') r.adminNote = adminNote.slice(0, 1000);
    if (typeof fulfilled === 'boolean') {
      r.fulfilled = fulfilled;
      r.fulfilledAt = fulfilled ? new Date() : null;
    }
    if (markPaid && r.status !== 'paid') {
      r.status = 'paid';
      r.paidAt = new Date();
      r.paidVia = 'manual';
      r.paymentId = String(markPaid.reference || '').slice(0, 80);
    }
    await r.save();
    res.json({ registration: view(r) });
  });

  // Creates the student's app account from a paid registration.
  router.post('/registrations/:id/account', async (req, res) => {
    const r = await Registration.findById(req.params.id).catch(() => null);
    if (!r) return bad(res, 'Not found.', 404);
    if (r.status !== 'paid') return bad(res, 'This registration is not paid.');
    const password = String(req.body?.password || '');
    if (password.length < 8) return bad(res, 'The password needs 8+ characters.');

    let books = Array.isArray(req.body?.books) ? req.body.books : null;
    const published = (await Book.find({ published: true }).select('slug').lean()).map((b) => b.slug);
    books = books ? books.filter((s) => published.includes(s)) : published;

    let user = await User.findOne({ email: r.email });
    if (user && user.role === 'admin') return bad(res, 'This email belongs to an admin account.');
    if (user) {
      user.books = [...new Set([...user.books, ...books])];
      user.passwordHash = await bcrypt.hash(password, 12);
      user.activeSession = null;
      user.disabled = false;
      if (!user.name) user.name = r.name;
    } else {
      user = new User({ name: r.name, email: r.email, books, passwordHash: await bcrypt.hash(password, 12) });
    }
    await user.save();
    r.userId = user._id;
    await r.save();
    res.json({ registration: view(r), user: { id: user._id, email: user.email, books: user.books } });
  });

  router.delete('/registrations/:id', async (req, res) => {
    const r = await Registration.findById(req.params.id).catch(() => null);
    if (!r) return bad(res, 'Not found.', 404);
    if (r.status === 'paid') return bad(res, 'Paid registrations are kept for your records.');
    await r.deleteOne();
    res.json({ ok: true });
  });
};
