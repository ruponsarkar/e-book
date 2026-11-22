// Sends email through the SMTP server configured in the admin panel (Settings → Email).
const nodemailer = require('nodemailer');
const settings = require('./settings');

let transport = null;
let transportKey = '';

function transportFor(cfg) {
  const key = JSON.stringify([cfg.host, cfg.port, cfg.secure, cfg.user, cfg.pass]);
  if (!transport || key !== transportKey) {
    transport = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
    transportKey = key;
  }
  return transport;
}

const ready = (cfg = settings.email()) => Boolean(cfg.enabled && cfg.host && cfg.fromEmail);

// cfg can be passed to try settings before saving them (the "Send test email" button).
async function send({ to, subject, html, text, replyTo }, cfg = settings.email()) {
  if (!ready(cfg)) throw new Error('Email is not set up (Settings → Email).');
  const t = cfg === settings.email() ? transportFor(cfg) : nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
    connectionTimeout: 15000,
  });
  const from = cfg.fromName ? `"${cfg.fromName.replace(/"/g, '')}" <${cfg.fromEmail}>` : cfg.fromEmail;
  return t.sendMail({ from, to, subject, html, text, replyTo });
}

module.exports = { send, ready };
