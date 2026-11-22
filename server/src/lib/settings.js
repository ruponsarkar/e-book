// Website and payment settings, editable in the admin panel (Settings page).
// Values saved in the database win; anything not saved there falls back to .env.
// Razorpay secrets are stored encrypted (AES-256-GCM, key derived from JWT_SECRET).
const crypto = require('crypto');
const Setting = require('../models/Setting');

const env = process.env;
const DEFAULTS = () => ({
  name: env.SITE_NAME || 'Exam Books',
  url: env.SITE_URL || '',
  priceInr: Number(env.PRICE_INR) || 199,
  playStoreUrl: env.PLAY_STORE_URL || '',
  contactEmail: env.CONTACT_EMAIL || '',
  contactPhone: env.CONTACT_PHONE || '',
  businessName: env.BUSINESS_NAME || '',
  businessAddress: env.BUSINESS_ADDRESS || '',
  deliveryHours: Number(env.LOGIN_DELIVERY_HOURS) || 24,
  razorpayKeyId: env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: env.RAZORPAY_KEY_SECRET || '',
  razorpayWebhookSecret: env.RAZORPAY_WEBHOOK_SECRET || '',
});
const SECRETS = ['razorpayKeySecret', 'razorpayWebhookSecret'];
const KEY = 'site';

let saved = {}; // decrypted values from the database
let loadedAt = 0;

// ---- encryption for secrets ----------------------------------------------------------
const cipherKey = () => crypto.createHash('sha256').update(`settings:${env.JWT_SECRET || ''}`).digest();

function seal(text) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', cipherKey(), iv);
  const body = Buffer.concat([c.update(String(text), 'utf8'), c.final()]);
  return `enc:${Buffer.concat([iv, c.getAuthTag(), body]).toString('base64')}`;
}

function open(value) {
  if (typeof value !== 'string' || !value.startsWith('enc:')) return value || '';
  try {
    const all = Buffer.from(value.slice(4), 'base64');
    const d = crypto.createDecipheriv('aes-256-gcm', cipherKey(), all.subarray(0, 12));
    d.setAuthTag(all.subarray(12, 28));
    return Buffer.concat([d.update(all.subarray(28)), d.final()]).toString('utf8');
  } catch {
    console.warn('A saved Razorpay secret could not be decrypted (was JWT_SECRET changed?). Enter it again in the admin panel.');
    return '';
  }
}

// ---- load / read / save ------------------------------------------------------------------
async function load() {
  const doc = await Setting.findOne({ key: KEY }).lean();
  const raw = doc?.value || {};
  saved = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, SECRETS.includes(k) ? open(v) : v]));
  loadedAt = Date.now();
}

// Several server processes (or a restart elsewhere) pick up changes within a minute.
function refreshSoon() {
  if (Date.now() - loadedAt > 60 * 1000) {
    loadedAt = Date.now();
    load().catch(() => {});
  }
}

function all() {
  refreshSoon();
  const d = DEFAULTS();
  const out = {};
  for (const k of Object.keys(d)) out[k] = saved[k] !== undefined && saved[k] !== null ? saved[k] : d[k];
  return out;
}

// Where each value comes from, for the admin page.
function sources() {
  const d = DEFAULTS();
  return Object.fromEntries(Object.keys(d).map((k) => [k, saved[k] !== undefined && saved[k] !== null ? 'panel' : d[k] ? 'env' : 'unset']));
}

async function save(patch) {
  const doc = await Setting.findOne({ key: KEY });
  const value = { ...(doc?.value || {}) };
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) delete value[k]; // back to the .env value
    else value[k] = SECRETS.includes(k) && v ? seal(v) : v;
  }
  await Setting.updateOne({ key: KEY }, { $set: { value } }, { upsert: true });
  await load();
}

const site = () => {
  const s = all();
  return {
    name: s.name,
    url: String(s.url || '').replace(/\/+$/, ''),
    priceInr: Math.max(1, Number(s.priceInr) || 199),
    playStoreUrl: s.playStoreUrl,
    contactEmail: s.contactEmail,
    contactPhone: s.contactPhone,
    businessName: s.businessName,
    businessAddress: s.businessAddress,
    deliveryHours: Number(s.deliveryHours) || 24,
  };
};

const razorpay = () => {
  const s = all();
  return { keyId: s.razorpayKeyId, keySecret: s.razorpayKeySecret, webhookSecret: s.razorpayWebhookSecret };
};

module.exports = { load, all, sources, save, site, razorpay, DEFAULTS, SECRETS };
