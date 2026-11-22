const express = require('express');
const { Activity } = require('../models/Activity');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const APP_TYPES = new Set(['session', 'read']);
const MAX_DURATION = 6 * 60 * 60; // a single stretch longer than 6 hours is not real reading
const DAY = 24 * 60 * 60 * 1000;

// The app sends what it recorded (also after being offline): { events: [{ type, at, durationSec, bookSlug, sectionKey }] }
router.post('/', async (req, res) => {
  const list = Array.isArray(req.body?.events) ? req.body.events.slice(0, 500) : [];
  const now = Date.now();
  const rows = [];
  for (const e of list) {
    if (!e || !APP_TYPES.has(e.type)) continue;
    const durationSec = Math.round(Number(e.durationSec) || 0);
    if (durationSec < 1 || durationSec > MAX_DURATION) continue;
    let at = new Date(e.at).getTime();
    if (!Number.isFinite(at) || at > now + 5 * 60 * 1000 || at < now - 30 * DAY) at = now; // phone clock is off
    rows.push({
      userId: req.user._id,
      type: e.type,
      at: new Date(at),
      durationSec,
      bookSlug: String(e.bookSlug || '').slice(0, 80),
      sectionKey: String(e.sectionKey || '').slice(0, 120),
    });
  }
  if (rows.length) await Activity.insertMany(rows, { ordered: false });
  res.json({ saved: rows.length });
});

module.exports = router;
