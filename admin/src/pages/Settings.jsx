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

const SOURCE = { panel: null, env: <Badge>from .env</Badge>, unset: <Badge kind="red">not set</Badge> };

export default function Settings() {
  const { data, error, reload, setData } = useLoad('/admin/settings');
  const [form, setForm] = useState(null);
  const [secrets, setSecrets] = useState({ razorpayKeySecret: '', razorpayWebhookSecret: '' });
  const [test, setTest] = useState(null);
  const [run, busy] = useAction();
  const toast = useToast();

  useEffect(() => {
    if (data) setForm({ ...data.values });
  }, [data]);

  if (!data || !form) return <Page title="Settings"><Loading error={error} onRetry={reload} /></Page>;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const changed = Object.keys(form).filter((k) => !k.endsWith('Secret') && String(form[k] ?? '') !== String(data.values[k] ?? ''));
  const dirty = changed.length > 0 || secrets.razorpayKeySecret || secrets.razorpayWebhookSecret;
  const webhookUrl = `${(form.url || window.location.origin).replace(/\/+$/, '')}${data.webhookPath}`;

  const save = async (e) => {
    e?.preventDefault();
    const body = {};
    for (const k of changed) body[k] = form[k];
    if (secrets.razorpayKeySecret) body.razorpayKeySecret = secrets.razorpayKeySecret;
    if (secrets.razorpayWebhookSecret) body.razorpayWebhookSecret = secrets.razorpayWebhookSecret;
    const r = await run(() => api('/admin/settings', { method: 'PUT', body }), 'Settings saved. The website uses them right away.');
    if (r) {
      setData(r);
      setSecrets({ razorpayKeySecret: '', razorpayWebhookSecret: '' });
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

        <div className="row end">
          <button className="btn primary" disabled={busy || !dirty}>{busy ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </Page>
  );
}
