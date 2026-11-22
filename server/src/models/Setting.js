const mongoose = require('mongoose');

// Key/value settings edited in the admin panel (see lib/settings.js).
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
