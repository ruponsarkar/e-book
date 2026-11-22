// Website: registration and payment (no login needed).
const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const Registration = require('../models/Registration');
const User = require('../models/User');
const razorpay = require('../lib/razorpay');
const { catalog } = require('../lib/catalog');
const { sendPaidEmails } = require('../lib/emails');

const router = express.Router();
// Async handlers: send errors to the app's error handler.
for (const m of ['get', 'post']) {
  const original = router[m].bind(router);
  router[m] = (p, ...handlers) => original(p, ...handlers.map((h) => (req, res, next) => Promise.resolve(h(req, res, next)).catch(next)));
}
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

const EXAMS = ['ADRE Grade III', 'ADRE Grade IV', 'Assam Police Constable', 'Assam Police SI', 'SSC CGL / CHSL', 'Other'];
const bad = (res, message, status = 400) => res.status(status).json({ code: 'BAD_REQUEST', message });
const clip = (s, n) => String(s || '').trim().slice(0, n);

router.get('/info', async (req, res) => {
  const { books, totals } = await catalog();
  res.json({
    name: config.site.name,
    price: config.site.priceInr,
    paymentsReady: razorpay.ready(),
    deliveryHours: config.site.deliveryHours,
    exams: EXAMS,
    books,
    totals,
  });
});

// Step 1: save the details and create a Razorpay order.
router.post('/register', limiter, async (req, res) => {
  if (!razorpay.ready()) return bad(res, 'Online payment is not available yet. Please contact us.', 503);
  const b = req.body || {};
  const name = clip(b.name, 80);
  const email = clip(b.email, 120).toLowerCase();
  const phone = String(b.phone || '').replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  if (name.length < 2) return bad(res, 'Please enter your full name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad(res, 'Please enter a valid email address.');
  if (!/^[6-9]\d{9}$/.test(phone)) return bad(res, 'Please enter a valid 10-digit mobile number.');
  if (!b.agree) return bad(res, 'Please accept the terms to continue.');

  const paid = await Registration.findOne({ status: 'paid', $or: [{ email }, { phone }] }).lean();
  if (paid) {
    return bad(
      res,
      `You have already paid with this ${paid.email === email ? 'email' : 'mobile number'}. Your login is sent within ${config.site.deliveryHours} hours; if you haven't received it, please contact us.`,
      409
    );
  }
  if (await User.exists({ email })) {
    return bad(res, 'An account with this email already exists. Please log in to the app, or contact us for help.', 409);
  }

  const amount = config.site.priceInr * 100;
  const reg = await Registration.create({
    name,
    email,
    phone,
    district: clip(b.district, 60),
    exams: (Array.isArray(b.exams) ? b.exams : []).filter((e) => EXAMS.includes(e)),
    amount,
    ip: req.ip,
    userAgent: clip(req.get('user-agent'), 200),
    source: clip(b.source, 120),
  });
  try {
    const order = await razorpay.createOrder({ amount, receipt: String(reg._id), notes: { registrationId: String(reg._id), email, phone } });
    reg.orderId = order.id;
    await reg.save();
    res.json({
      registrationId: reg._id,
      orderId: order.id,
      amount,
      currency: 'INR',
      keyId: config.razorpay.keyId,
      name: config.site.name,
      prefill: { name, email, contact: `+91${phone}` },
    });
  } catch (e) {
    reg.status = 'failed';
    reg.adminNote = `Order failed: ${e.message}`;
    await reg.save();
    console.error('Razorpay order failed:', e.message);
    bad(res, 'Could not start the payment. Please try again in a minute.', 502);
  }
});

// Atomic, so the browser and the webhook arriving together can't both send the emails.
async function markPaid(reg, { paymentId, method = '', via }) {
  const updated = await Registration.findOneAndUpdate(
    { _id: reg._id, status: { $ne: 'paid' } },
    { $set: { status: 'paid', paymentId, method, paidAt: new Date(), paidVia: via } },
    { new: true }
  );
  if (!updated) return Registration.findById(reg._id); // already marked paid
  sendPaidEmails(updated).catch(() => {}); // in the background; doesn't delay the student
  return updated;
}

// Step 2: the browser reports the payment; the signature proves it came from Razorpay.
router.post('/verify', limiter, async (req, res) => {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
  if (!orderId || !paymentId || !signature) return bad(res, 'Missing payment details.');
  if (!razorpay.checkPaymentSignature(orderId, paymentId, signature)) return bad(res, 'Payment could not be verified.', 400);
  const reg = await Registration.findOne({ orderId });
  if (!reg) return bad(res, 'Registration not found.', 404);
  let method = '';
  try {
    method = (await razorpay.fetchPayment(paymentId)).method || '';
  } catch {
    // not needed to confirm the payment
  }
  await markPaid(reg, { paymentId, method, via: 'checkout' });
  res.json({
    ok: true,
    name: reg.name,
    email: reg.email,
    phone: reg.phone,
    paymentId,
    deliveryHours: config.site.deliveryHours,
  });
});

// Razorpay → server (also covers buyers who close the page before step 2).
// Mounted in index.js with a raw body parser, because the signature covers the exact bytes.
async function webhook(req, res) {
  const raw = req.body;
  if (!Buffer.isBuffer(raw) || !razorpay.checkWebhookSignature(raw, req.get('x-razorpay-signature'))) {
    return res.status(400).json({ ok: false });
  }
  let event;
  try {
    event = JSON.parse(raw.toString('utf8'));
  } catch {
    return res.status(400).json({ ok: false });
  }
  if (event.event === 'payment.captured' || event.event === 'order.paid') {
    const p = event.payload?.payment?.entity;
    const orderId = p?.order_id || event.payload?.order?.entity?.id;
    const reg = orderId ? await Registration.findOne({ orderId }) : null;
    if (reg && p && Number(p.amount) === reg.amount) await markPaid(reg, { paymentId: p.id, method: p.method || '', via: 'webhook' });
  } else if (event.event === 'payment.failed') {
    const p = event.payload?.payment?.entity;
    const reg = p?.order_id ? await Registration.findOne({ orderId: p.order_id }) : null;
    if (reg && reg.status === 'pending') {
      reg.adminNote = `Payment attempt failed: ${p.error_description || p.error_reason || 'unknown'}`;
      await reg.save();
    }
  }
  res.json({ ok: true });
}

module.exports = { router, webhook, EXAMS };
