const mongoose = require('mongoose');

// A message from the admin, shown in the app's notification inbox.
// audience "all" reaches every student (including ones created later); "users" only the listed ones.
const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, default: '' },
    audience: { type: String, enum: ['all', 'users'], required: true },
    userIds: { type: [mongoose.Schema.Types.ObjectId], default: [], index: true },
    kind: { type: String, enum: ['message', 'reply'], default: 'message' }, // reply = answer to a query
    queryId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);
notificationSchema.index({ createdAt: -1 });

const readSchema = new mongoose.Schema(
  {
    notificationId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true, versionKey: false }
);
readSchema.index({ notificationId: 1, userId: 1 }, { unique: true });
readSchema.index({ userId: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
const NotificationRead = mongoose.model('NotificationRead', readSchema);

// Notifications a user can see: sent to everyone, or to them.
const visibleTo = (user) => ({ $or: [{ audience: 'all' }, { userIds: user._id }] });

async function unreadCount(user) {
  const rows = await Notification.find(visibleTo(user)).sort({ createdAt: -1 }).limit(100).select('_id').lean();
  const ids = rows.map((r) => r._id);
  if (!ids.length) return 0;
  const read = await NotificationRead.countDocuments({ userId: user._id, notificationId: { $in: ids } });
  return ids.length - read;
}

module.exports = { Notification, NotificationRead, visibleTo, unreadCount };
