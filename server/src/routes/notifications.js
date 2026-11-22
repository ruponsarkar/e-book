const express = require('express');
const { Notification, NotificationRead, visibleTo } = require('../models/Notification');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const rows = await Notification.find(visibleTo(req.user)).sort({ createdAt: -1 }).limit(100).lean();
  const read = new Set(
    (await NotificationRead.find({ userId: req.user._id, notificationId: { $in: rows.map((r) => r._id) } }).lean()).map((r) =>
      String(r.notificationId)
    )
  );
  res.json({
    notifications: rows.map((n) => ({
      id: n._id,
      title: n.title,
      body: n.body,
      kind: n.kind,
      queryId: n.queryId,
      createdAt: n.createdAt,
      read: read.has(String(n._id)),
    })),
  });
});

// { ids: [...] } marks those as read; {} marks everything visible as read.
router.post('/read', async (req, res) => {
  let ids = Array.isArray(req.body?.ids) ? req.body.ids : null;
  if (!ids) ids = (await Notification.find(visibleTo(req.user)).sort({ createdAt: -1 }).limit(100).select('_id').lean()).map((r) => r._id);
  const visible = await Notification.find({ _id: { $in: ids }, ...visibleTo(req.user) }).select('_id').lean().catch(() => []);
  if (visible.length) {
    await NotificationRead.bulkWrite(
      visible.map((n) => ({
        updateOne: {
          filter: { notificationId: n._id, userId: req.user._id },
          update: { $setOnInsert: { notificationId: n._id, userId: req.user._id } },
          upsert: true,
        },
      })),
      { ordered: false }
    );
  }
  res.json({ ok: true });
});

module.exports = router;
