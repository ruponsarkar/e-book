import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Badge, Field, Loading, Page, useAction, useLoad, useToast } from '../ui';

const SECTIONS = [
  {
    title: 'Website',
    fields: [
      ['name', 'Site name', 'Shown in the header, page titles and the Razorpay window.'],
      ['url', 'Website address', 'For example https://exambook.frontwebtech.com'],
    ],
  },
  {
    title: 'Price & delivery',
    fields: [
      ['priceInr', 'Price (₹)', 'New registrations pay this. Earlier unpaid ones keep their old amount.', 'number'],
      ['deliveryHours', 'Login sent within (hours)', 'Promised on the website and in the policies.', 'number'],
      ['playStoreUrl', 'Play Store link', 'Included in the login message sent to students.'],
    ],
  },
  {
    title: 'Contact & business',
    note: 'Shown in the footer, the Contact page and the policies. Razorpay checks these before approving live payments.',
    fields: [
      ['contactEmail', 'Support email'],
      ['contactPhone', 'WhatsApp / phone', 'With country code, for example +91 97071 32913'],
      ['businessName', 'Registered business name'],
      ['businessAddress', 'Business address', '', 'textarea'],
    ],
  },
];

// Common SMTP servers, to fill the form in one click.
const PRESETS = [
  ['Gmail', 'smtp.gmail.com', 465, true, 'Use an App Password (Google Account → Security → App passwords), not your normal password.'],
  ['Zoho', 'smtp.zoho.in', 465, true, 'Use smtp.zoho.com if your account is not on the India data centre.'],
  ['Hostinger', 'smtp.hostinger.com', 465, true, 'Use the email account and password from Hostinger → Emails.'],
  ['Outlook / Microsoft 365', 'smtp.office365.com', 587, false, 'SMTP sending must be allowed for the mailbox.'],
  ['Brevo', 'smtp-relay.brevo.com', 587, false, 'Use the SMTP login and key from Brevo → SMTP & API.'],
];

const SOURCE = { panel: null, env: <Badge>from .env</Badge>, unset: <Badge kind="red">not set</Badge> };

export default function Settings() {
  const { data, error, reload, setData } = useLoad('/admin/settings');
  const [form, setForm] = useState(null);
  const [secrets, setSecrets] = useState({ razorpayKeySecret: '', razorpayWebhookSecret: '', smtpPass: '' });
  const [test, setTest] = useState(null);
  const [mailTest, setMailTest] = useState(null);
  const [testTo, setTestTo] = useState('');
  const [presetHint, setPresetHint] = useState('');
  const [run, busy] = useAction();
  const toast = useToast();

  useEffect(() => {
    if (data) setForm({ ...data.values });
  }, [data]);

  if (!data || !form) return <Page title="Settings"><Loading error={error} onRetry={reload} /></Page>;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const changed = Object.keys(form).filter((k) => !k.endsWith('Secret') && String(form[k] ?? '') !== String(data.values[k] ?? ''));
  const dirty = changed.length > 0 || Object.values(secrets).some(Boolean);
  const check = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));
  const webhookUrl = `${(form.url || window.location.origin).replace(/\/+$/, '')}${data.webhookPath}`;

  const save = async (e) => {
    e?.preventDefault();
    const body = {};
    for (const k of changed) body[k] = form[k];
    for (const [k, v] of Object.entries(secrets)) if (v) body[k] = v;
    const r = await run(() => api('/admin/settings', { method: 'PUT', body }), 'Settings saved. The website uses them right away.');
    if (r) {
      setData(r);
      setSecrets({ razorpayKeySecret: '', razorpayWebhookSecret: '', smtpPass: '' });
    }
  };

  const reset = async (k) => {
    if (!confirm('Use the value from the server .env file instead?')) return;
    const r = await run(() => api('/admin/settings', { method: 'PUT', body: { [k]: null } }), 'Reset to .env value');
    if (r) setData(r);
  };

  const testKeys = async () => {
    setTest(null);
    const r = await run(() =>
      api('/admin/settings/test-razorpay', {
        method: 'POST',
        body: { razorpayKeyId: form.razorpayKeyId, razorpayKeySecret: secrets.razorpayKeySecret },
      })
    );
    if (r) setTest(r);
  };

  const sendTest = async () => {
    setMailTest(null);
    const r = await run(() =>
      api('/admin/settings/test-email', {
        method: 'POST',
        body: {
          to: testTo,
          smtpHost: form.smtpHost,
          smtpPort: form.smtpPort,
          smtpSecure: form.smtpSecure,
          smtpUser: form.smtpUser,
          smtpPass: secrets.smtpPass,
          mailFromName: form.mailFromName,
          mailFromEmail: form.mailFromEmail,
        },
      })
    );
    if (r) setMailTest(r);
  };

  const applyPreset = ([, host, port, secure, hint]) => {
    setForm((f) => ({ ...f, smtpHost: host, smtpPort: port, smtpSecure: secure }));
    setPresetHint(hint);
  };

  const label = (k, text) => (
    <span className="row gap">
      {text}
      {SOURCE[data.sources[k]]}
      {data.sources[k] === 'panel' ? (
        <button type="button" className="link small" onClick={() => reset(k)} title="Use the .env value">
          reset
        </button>
      ) : null}
    </span>
  );

  return (
    <Page
      title="Settings"
      sub="Website, price, contact details and Razorpay. Changes apply immediately, no restart needed."
      actions={
        <button className="btn primary" onClick={save} disabled={busy || !dirty}>
          {busy ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
        </button>
      }
    >
      <form onSubmit={save} className="settings">
        {SECTIONS.map((s) => (
          <section key={s.title} className="card">
            <h3>{s.title}</h3>
            {s.note ? <p className="muted small">{s.note}</p> : null}
            <div className="settings-grid">
              {s.fields.map(([k, text, hint, type]) => (
                <Field key={k} label={label(k, text)} hint={hint}>
                  {type === 'textarea' ? (
                    <textarea rows={2} value={form[k] ?? ''} onChange={set(k)} />
                  ) : (
                    <input type={type || 'text'} value={form[k] ?? ''} onChange={set(k)} />
                  )}
                </Field>
              ))}
            </div>
          </section>
        ))}

        <section className="card">
          <div className="row between">
            <h3>Razorpay</h3>
            {data.razorpayMode === 'live' ? (
              <Badge kind="green">Live mode: real payments</Badge>
            ) : data.razorpayMode === 'test' ? (
              <Badge kind="gold">Test mode: no real money</Badge>
            ) : (
              <Badge kind="red">Payments off</Badge>
            )}
          </div>
          <p className="muted small">
            Razorpay dashboard → Account &amp; Settings → API Keys. Use <code>rzp_test_…</code> keys to try it, then switch to <code>rzp_live_…</code>.
            Secrets are stored encrypted and never shown again; leave a secret box empty to keep the current one.
          </p>
          <div className="settings-grid">
            <Field label={label('razorpayKeyId', 'Key ID')}>
              <input className="mono" value={form.razorpayKeyId ?? ''} onChange={set('razorpayKeyId')} placeholder="rzp_test_…" />
            </Field>
            <Field label={label('razorpayKeySecret', 'Key Secret')} hint={data.values.razorpayKeySecret ? `Saved: ${data.values.razorpayKeySecret}` : 'Not set'}>
              <input
                className="mono"
                type="password"
                autoComplete="new-password"
                value={secrets.razorpayKeySecret}
                onChange={(e) => setSecrets((x) => ({ ...x, razorpayKeySecret: e.target.value }))}
                placeholder={data.values.razorpayKeySecret ? 'Enter a new secret to replace it' : 'Paste the Key Secret'}
              />
            </Field>
          </div>
          <div className="row gap wrap">
            <button type="button" className="btn" onClick={testKeys} disabled={busy}>Test keys</button>
            {test ? <span className={test.ok ? 'ok-text' : 'err'}>{test.ok ? `✓ ${test.message} (${test.mode} mode)` : test.message}</span> : null}
          </div>

          <h3 className="mt">Webhook</h3>
          <p className="muted small">
            Razorpay → Webhooks → Add: URL below, events <code>payment.captured</code>, <code>order.paid</code>, <code>payment.failed</code>, and a secret
            of your choice. Enter the same secret here. This records payments even if the student closes the page right after paying.
          </p>
          <div className="settings-grid">
            <Field label="Webhook URL">
              <div className="row gap">
                <input className="mono grow" readOnly value={webhookUrl} onFocus={(e) => e.target.select()} />
                <button type="button" className="btn" onClick={() => navigator.clipboard?.writeText(webhookUrl).then(() => toast('Copied'))}>Copy</button>
              </div>
            </Field>
            <Field label={label('razorpayWebhookSecret', 'Webhook secret')} hint={data.values.razorpayWebhookSecret ? `Saved: ${data.values.razorpayWebhookSecret}` : 'Not set'}>
              <input
                className="mono"
                type="password"
                autoComplete="new-password"
                value={secrets.razorpayWebhookSecret}
                onChange={(e) => setSecrets((x) => ({ ...x, razorpayWebhookSecret: e.target.value }))}
                placeholder={data.values.razorpayWebhookSecret ? 'Enter a new secret to replace it' : 'Paste the webhook secret'}
              />
            </Field>
          </div>
        </section>

        <section className="card">
          <div className="row between">
            <h3>Email</h3>
            {data.emailReady ? <Badge kind="green">Sending on</Badge> : form.emailEnabled ? <Badge kind="red">Incomplete</Badge> : <Badge>Off</Badge>}
          </div>
          <p className="muted small">
            When a student pays, they get a receipt email and the addresses below get a “new registration” alert. You can also email the login details from
            Registrations. Works with any SMTP service.
          </p>
          <label className="check strong mt">
            <input type="checkbox" checked={Boolean(form.emailEnabled)} onChange={check('emailEnabled')} />
            Send emails
          </label>

          <Field label="Send new-registration alerts to" hint="One or more addresses, separated by commas.">
            <input value={form.adminEmails ?? ''} onChange={set('adminEmails')} placeholder="you@frontwebtech.com, partner@gmail.com" />
          </Field>

          <h3 className="mt">SMTP server</h3>
          <div className="row gap wrap" style={{ marginBottom: 10 }}>
            <span className="muted small">Quick fill:</span>
            {PRESETS.map((p) => (
              <button key={p[0]} type="button" className="btn small" onClick={() => applyPreset(p)}>{p[0]}</button>
            ))}
          </div>
          {presetHint ? <p className="note">{presetHint}</p> : null}
          <div className="settings-grid mt">
            <Field label={label('smtpHost', 'SMTP server')}>
              <input className="mono" value={form.smtpHost ?? ''} onChange={set('smtpHost')} placeholder="smtp.gmail.com" />
            </Field>
            <div className="row gap" style={{ alignItems: 'flex-start' }}>
              <Field label={label('smtpPort', 'Port')}>
                <input type="number" value={form.smtpPort ?? ''} onChange={set('smtpPort')} style={{ width: 110 }} />
              </Field>
              <label className="check" style={{ marginTop: 30 }}>
                <input type="checkbox" checked={Boolean(form.smtpSecure)} onChange={check('smtpSecure')} />
                SSL (port 465)
              </label>
            </div>
            <Field label={label('smtpUser', 'Username')} hint="Usually the full email address.">
              <input value={form.smtpUser ?? ''} onChange={set('smtpUser')} autoComplete="off" />
            </Field>
            <Field label={label('smtpPass', 'Password')} hint={data.values.smtpPass ? `Saved: ${data.values.smtpPass}` : 'Not set'}>
              <input
                type="password"
                autoComplete="new-password"
                value={secrets.smtpPass}
                onChange={(e) => setSecrets((x) => ({ ...x, smtpPass: e.target.value }))}
                placeholder={data.values.smtpPass ? 'Enter a new password to replace it' : 'SMTP password or app password'}
              />
            </Field>
            <Field label={label('mailFromName', 'From name')} hint="What students see as the sender.">
              <input value={form.mailFromName ?? ''} onChange={set('mailFromName')} placeholder={form.name} />
            </Field>
            <Field label={label('mailFromEmail', 'From email')} hint="Usually the same as the username.">
              <input value={form.mailFromEmail ?? ''} onChange={set('mailFromEmail')} placeholder="support@frontwebtech.com" />
            </Field>
          </div>
          <div className="row gap wrap">
            <input style={{ maxWidth: 280 }} value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="Send a test to…" />
            <button type="button" className="btn" onClick={sendTest} disabled={busy || !testTo}>Send test email</button>
            {mailTest ? <span className={mailTest.ok ? 'ok-text' : 'err'}>{mailTest.ok ? `✓ ${mailTest.message}` : mailTest.message}</span> : null}
          </div>
          <p className="muted small">The test uses what's in the form, even before saving. Save to start sending.</p>
        </section>

        <div className="row end">
          <button className="btn primary" disabled={busy || !dirty}>{busy ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </Page>
  );
}
