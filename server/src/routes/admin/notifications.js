const mongoose = require('mongoose');
const User = require('../../models/User');
const { Notification, NotificationRead } = require('../../models/Notification');

const bad = (res, message, status = 400) => res.status(status).json({ code: 'BAD_REQUEST', message });

module.exports = (router) => {
  router.get('/notifications', async (req, res) => {
    const rows = await Notification.find({ kind: 'message' }).sort({ createdAt: -1 }).limit(200).lean();
    const [reads, students] = await Promise.all([
      NotificationRead.aggregate([
        { $match: { notificationId: { $in: rows.map((r) => r._id) } } },
        { $group: { _id: '$notificationId', n: { $sum: 1 } } },
      ]),
      User.countDocuments({ role: 'student' }),
    ]);
    const r = new Map(reads.map((x) => [String(x._id), x.n]));
    const named = new Map(
      (await User.find({ _id: { $in: rows.flatMap((n) => n.userIds) } }).select('name email').lean()).map((u) => [String(u._id), u])
    );
    res.json({
      notifications: rows.map((n) => ({
        id: n._id,
        title: n.title,
        body: n.body,
        audience: n.audience,
        recipients: n.audience === 'all' ? students : n.userIds.length,
        to: n.userIds.map((id) => named.get(String(id))?.email || '(deleted)'),
        read: r.get(String(n._id)) || 0,
        createdAt: n.createdAt,
      })),
    });
  });

  // { title, body, audience: "all" | "users", userIds: [...] }
  router.post('/notifications', async (req, res) => {
    const title = String(req.body?.title || '').trim().slice(0, 120);
    const body = String(req.body?.body || '').trim().slice(0, 2000);
    const audience = req.body?.audience === 'all' ? 'all' : 'users';
    if (!title) return bad(res, 'A title is needed.');
    let userIds = [];
    if (audience === 'users') {
      const ids = (Array.isArray(req.body?.userIds) ? req.body.userIds : []).filter((id) => mongoose.isValidObjectId(id));
      userIds = (await User.find({ _id: { $in: ids } }).select('_id').lean()).map((u) => u._id);
      if (!userIds.length) return bad(res, 'Choose at least one student.');
    }
    const n = await Notification.create({ title, body, audience, userIds, kind: 'message' });
    res.status(201).json({ notification: { id: n._id } });
  });

  router.delete('/notifications/:id', async (req, res) => {
    await Notification.deleteOne({ _id: req.params.id }).catch(() => null);
    await NotificationRead.deleteMany({ notificationId: req.params.id }).catch(() => null);
    res.json({ ok: true });
  });
};
