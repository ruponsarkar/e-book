const mongoose = require('mongoose');

// What students do in the app. Some events are recorded by the server itself
// (login, logout, test_submit, query), the rest are sent by the app in batches:
//   session   time the app was open in the foreground (durationSec)
//   read      time spent on one chapter or test paper (bookSlug, sectionKey, durationSec)
const TYPES = ['login', 'logout', 'session', 'read', 'test_submit', 'query', 'screenshot'];

const activitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: TYPES, required: true },
    at: { type: Date, default: Date.now },
    durationSec: { type: Number, default: 0 },
    bookSlug: { type: String, default: '' },
    sectionKey: { type: String, default: '' },
    detail: { type: String, default: '' }, // short human-readable note, e.g. "Score 72%" or the device name
  },
  { versionKey: false }
);
activitySchema.index({ userId: 1, at: -1 });
activitySchema.index({ at: -1 });
activitySchema.index({ type: 1, at: -1 });

const Activity = mongoose.model('Activity', activitySchema);

// Never lets activity logging break the request that triggered it.
function logActivity(userId, type, fields = {}) {
  return Activity.create({ userId, type, ...fields }).catch((e) => console.error('activity log failed:', e.message));
}

module.exports = { Activity, logActivity, TYPES };
