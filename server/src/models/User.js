const mongoose = require('mongoose');

// Only one session is active per user. A new login replaces it,
// and every request checks that the token's session id is still the active one.
const activeSessionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    deviceId: { type: String, required: true },
    deviceName: { type: String, default: '' },
    platform: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    // Slugs of the books this user may read. Admins can read every book.
    books: { type: [String], default: [] },
    disabled: { type: Boolean, default: false },
    activeSession: { type: activeSessionSchema, default: null },
    // Admins also get one browser session for the admin panel, separate from their phone.
    webSession: { type: activeSessionSchema, default: null },
    lastSeenAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
