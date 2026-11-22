// Minimal Razorpay client (Orders API + signature checks), no SDK needed.
const crypto = require('crypto');
const config = require('../config');

const ready = () => Boolean(config.razorpay.keyId && config.razorpay.keySecret);

async function rzp(path, { method = 'GET', body, keys = config.razorpay } = {}) {
  const auth = Buffer.from(`${keys.keyId}:${keys.keySecret}`).toString('base64');
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.description || `Razorpay error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

const createOrder = ({ amount, receipt, notes }) => rzp('/orders', { method: 'POST', body: { amount, currency: 'INR', receipt, notes } });
const fetchPayment = (id) => rzp(`/payments/${encodeURIComponent(id)}`);
// Checks a key pair without charging anything (lists at most one order).
const testKeys = (keys) => rzp('/orders?count=1', { keys });

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// Checkout returns order_id, payment_id and this signature.
function checkPaymentSignature(orderId, paymentId, signature) {
  const expected = crypto.createHmac('sha256', config.razorpay.keySecret).update(`${orderId}|${paymentId}`).digest('hex');
  return safeEqual(expected, signature);
}

function checkWebhookSignature(rawBody, signature) {
  if (!config.razorpay.webhookSecret) return false;
  const expected = crypto.createHmac('sha256', config.razorpay.webhookSecret).update(rawBody).digest('hex');
  return safeEqual(expected, signature);
}

module.exports = { ready, createOrder, fetchPayment, testKeys, checkPaymentSignature, checkWebhookSignature };
