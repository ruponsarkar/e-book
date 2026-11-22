// Emails sent for website registrations.
const config = require('../config');
const settings = require('./settings');
const mailer = require('./mailer');
const Registration = require('../models/Registration');

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const rupees = (paise) => `₹${(paise / 100).toLocaleString('en-IN')}`;
const when = (d) => new Date(d).toLocaleString('en-IN', { timeZone: config.adminTz, dateStyle: 'medium', timeStyle: 'short' });

// Simple, widely compatible HTML layout (inline styles, one column).
function layout({ title, body, footer = '' }) {
  const s = config.site;
  return `<!doctype html><html><body style="margin:0;background:#f6f1e7;font-family:Arial,Helvetica,sans-serif;color:#221d13">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1e7;padding:24px 12px"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf8;border:1px solid #e4d9c3;border-radius:14px;overflow:hidden">
<tr><td style="background:#1f3a5f;padding:18px 24px;color:#d4b36a;font:bold 20px Georgia,serif">${esc(s.name)}</td></tr>
<tr><td style="padding:24px">
<h1 style="margin:0 0 14px;font:bold 22px Georgia,serif;color:#142740">${title}</h1>
${body}
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #e4d9c3;font-size:12px;color:#7a6c52;line-height:1.5">
${footer || `${esc(s.businessName || s.name)}${s.businessAddress ? ` · ${esc(s.businessAddress)}` : ''}<br>${s.contactEmail ? `Email ${esc(s.contactEmail)}` : ''}${s.contactPhone ? ` · WhatsApp ${esc(s.contactPhone)}` : ''}`}
</td></tr></table></td></tr></table></body></html>`;
}

const rows = (pairs) =>
  `<table cellpadding="0" cellspacing="0" style="width:100%;background:#f6f1e7;border-radius:10px;padding:12px 14px;font-size:14px;margin:14px 0">${pairs
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="color:#7a6c52;padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:4px 0;font-weight:bold;word-break:break-all">${esc(v)}</td></tr>`)
    .join('')}</table>`;

function studentPaid(reg) {
  const s = config.site;
  const first = reg.name.split(' ')[0];
  const subject = `Payment received: welcome to ${s.name}!`;
  const html = layout({
    title: `Thank you, ${esc(first)}! 🎉`,
    body: `<p style="font-size:15px;line-height:1.6">We have received your payment for <b>${esc(s.name)}</b>. Your user ID, password and the Play Store link will be sent to your WhatsApp number <b>+91 ${esc(reg.phone)}</b> and to this email <b>within ${esc(s.deliveryHours)} hours</b>.</p>
${rows([
  ['Name', reg.name],
  ['Amount paid', rupees(reg.amount)],
  ['Payment ID', reg.paymentId],
  ['Paid on', when(reg.paidAt)],
])}
<p style="font-size:14px;line-height:1.6;color:#4a4030">Please keep this email as your receipt. If you don't receive your login in time, reply to this email${s.contactPhone ? ` or message us on WhatsApp at ${esc(s.contactPhone)}` : ''} with your payment ID.</p>`,
  });
  const text = `Thank you, ${first}!\n\nWe have received your payment for ${s.name}. Your login and the Play Store link will be sent to +91 ${reg.phone} on WhatsApp and to this email within ${s.deliveryHours} hours.\n\nAmount: ${rupees(reg.amount)}\nPayment ID: ${reg.paymentId}\nPaid on: ${when(reg.paidAt)}\n\nIf you don't receive your login in time, reply to this email with your payment ID.`;
  return { to: reg.email, subject, html, text, replyTo: s.contactEmail || undefined };
}

function adminPaid(reg, to) {
  const s = config.site;
  const panel = s.url ? `${s.url}/panel/#/registrations` : '';
  const subject = `New registration: ${reg.name} paid ${rupees(reg.amount)}`;
  const html = layout({
    title: 'New paid registration',
    body: `<p style="font-size:15px">Create the account and send the login${s.deliveryHours ? ` within ${esc(s.deliveryHours)} hours` : ''}.</p>
${rows([
  ['Name', reg.name],
  ['Mobile', `+91 ${reg.phone}`],
  ['Email', reg.email],
  ['District', reg.district],
  ['Preparing for', reg.exams.join(', ')],
  ['Amount', rupees(reg.amount)],
  ['Method', reg.method],
  ['Payment ID', reg.paymentId],
  ['Recorded via', reg.paidVia],
  ['Paid on', when(reg.paidAt)],
])}
${panel ? `<p><a href="${esc(panel)}" style="display:inline-block;background:#1f3a5f;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:bold">Open Registrations</a></p>` : ''}`,
    footer: 'Sent by your website because a student paid. Change who gets these in the admin panel → Settings → Email.',
  });
  const text = `New paid registration\n\nName: ${reg.name}\nMobile: +91 ${reg.phone}\nEmail: ${reg.email}\nDistrict: ${reg.district || '-'}\nPreparing for: ${reg.exams.join(', ') || '-'}\nAmount: ${rupees(reg.amount)}\nPayment ID: ${reg.paymentId}\n${panel ? `\n${panel}` : ''}`;
  return { to, subject, html, text, replyTo: reg.email };
}

function studentLogin(reg, { email, password }) {
  const s = config.site;
  const subject = `Your ${s.name} login`;
  const html = layout({
    title: `Your login is ready, ${esc(reg.name.split(' ')[0])}!`,
    body: `<p style="font-size:15px;line-height:1.6">Install the <b>${esc(s.name)}</b> app and log in with these details:</p>
${rows([
  ['User ID', email],
  ['Password', password],
])}
${s.playStoreUrl ? `<p><a href="${esc(s.playStoreUrl)}" style="display:inline-block;background:#d4b36a;color:#1b2a40;text-decoration:none;padding:13px 22px;border-radius:999px;font-weight:bold">Get the app on Google Play</a></p>` : '<p>Install the app from the Google Play Store.</p>'}
<p style="font-size:14px;line-height:1.6;color:#4a4030">Your account works on one phone at a time. Keep your password private. Need help? Reply to this email, or use Profile → Help &amp; feedback in the app.</p>`,
  });
  const text = `Your ${s.name} login\n\nUser ID: ${email}\nPassword: ${password}\n\n${s.playStoreUrl ? `Download the app: ${s.playStoreUrl}\n\n` : ''}Your account works on one phone at a time. Need help? Reply to this email.`;
  return { to: reg.email, subject, html, text, replyTo: s.contactEmail || undefined };
}

// Called once when a registration becomes paid. Never throws; results are saved on the registration.
async function sendPaidEmails(reg, { student = true, admin = true } = {}) {
  if (!mailer.ready()) return;
  const update = {};
  if (student) {
    try {
      await mailer.send(studentPaid(reg));
      update.studentEmailedAt = new Date();
    } catch (e) {
      update.emailError = `Student email: ${e.message}`.slice(0, 300);
      console.error('Registration email to student failed:', e.message);
    }
  }
  const to = settings.email().adminEmails;
  if (admin && to.length) {
    try {
      await mailer.send(adminPaid(reg, to.join(', ')));
      update.adminEmailedAt = new Date();
    } catch (e) {
      update.emailError = `${update.emailError ? `${update.emailError} · ` : ''}Admin email: ${e.message}`.slice(0, 300);
      console.error('Registration email to admin failed:', e.message);
    }
  }
  if (Object.keys(update).length) await Registration.updateOne({ _id: reg._id }, { $set: update });
}

module.exports = { sendPaidEmails, studentLogin, layout };
