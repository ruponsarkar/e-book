const settings = require('../../lib/settings');
const razorpay = require('../../lib/razorpay');

const bad = (res, message) => res.status(400).json({ code: 'BAD_REQUEST', message });

const FIELDS = {
  name: { max: 60 },
  url: { max: 200, url: true },
  priceInr: { number: [1, 100000] },
  playStoreUrl: { max: 300, url: true },
  contactEmail: { max: 120, email: true },
  contactPhone: { max: 30 },
  businessName: { max: 120 },
  businessAddress: { max: 300 },
  deliveryHours: { number: [1, 720] },
  razorpayKeyId: { max: 60, pattern: /^rzp_(test|live)_[A-Za-z0-9]+$/, hint: 'Key ID starts with rzp_test_ or rzp_live_.' },
  razorpayKeySecret: { max: 120, secret: true },
  razorpayWebhookSecret: { max: 120, secret: true },
};

// Shows only the end of a secret, so it can be recognised but not copied.
const mask = (v) => (v ? `•••• ${String(v).slice(-4)}` : '');

function view() {
  const s = settings.all();
  const src = settings.sources();
  const values = {};
  for (const k of Object.keys(FIELDS)) values[k] = FIELDS[k].secret ? mask(s[k]) : s[k];
  return {
    values,
    sources: src,
    razorpayMode: s.razorpayKeyId.startsWith('rzp_live_') ? 'live' : s.razorpayKeyId.startsWith('rzp_test_') ? 'test' : 'off',
    paymentsReady: razorpay.ready(),
    webhookPath: '/public/razorpay-webhook',
  };
}

function clean(body) {
  const patch = {};
  for (const [k, rule] of Object.entries(FIELDS)) {
    if (!(k in body)) continue;
    let v = body[k];
    if (v === null) {
      patch[k] = null; // reset to the .env value
      continue;
    }
    if (rule.secret) {
      v = String(v || '').trim();
      if (!v) continue; // empty secret box = keep the current one
      patch[k] = v.slice(0, rule.max);
      continue;
    }
    if (rule.number) {
      const n = Math.round(Number(v));
      if (!Number.isFinite(n) || n < rule.number[0] || n > rule.number[1]) throw new Error(`${k} must be between ${rule.number[0]} and ${rule.number[1]}.`);
      patch[k] = n;
      continue;
    }
    v = String(v ?? '').trim().slice(0, rule.max);
    if (v && rule.url && !/^https?:\/\/\S+$/.test(v)) throw new Error(`${k === 'url' ? 'Website address' : 'Play Store link'} must start with https://`);
    if (v && rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new Error('Enter a valid contact email.');
    if (v && rule.pattern && !rule.pattern.test(v)) throw new Error(rule.hint);
    patch[k] = v;
  }
  return patch;
}

module.exports = (router) => {
  router.get('/settings', (req, res) => res.json(view()));

  router.put('/settings', async (req, res) => {
    let patch;
    try {
      patch = clean(req.body || {});
    } catch (e) {
      return bad(res, e.message);
    }
    await settings.save(patch);
    res.json(view());
  });

  // Tries the keys against Razorpay. Uses the keys in the form if given, else the saved ones.
  router.post('/settings/test-razorpay', async (req, res) => {
    const saved = settings.razorpay();
    const keyId = String(req.body?.razorpayKeyId || saved.keyId).trim();
    const keySecret = String(req.body?.razorpayKeySecret || '').trim() || saved.keySecret;
    if (!keyId || !keySecret) return bad(res, 'Enter the Key ID and Key Secret first.');
    try {
      await razorpay.testKeys({ keyId, keySecret });
      res.json({ ok: true, mode: keyId.startsWith('rzp_live_') ? 'live' : 'test', message: 'Razorpay accepted these keys.' });
    } catch (e) {
      res.json({ ok: false, message: e.status === 401 ? 'Razorpay rejected these keys. Check the Key ID and Secret.' : e.message });
    }
  });
};
