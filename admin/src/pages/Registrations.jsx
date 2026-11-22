import React, { useMemo, useState } from 'react';
import { api } from '../api';
import { go } from '../nav';
import { ago, dateTime } from '../format';
import { Badge, Empty, Field, Loading, Modal, Page, Stat, useAction, useLoad } from '../ui';
import BookPicker from './BookPicker';
import { randomPassword } from './Students';

const FILTERS = [
  ['todo', 'Send login'],
  ['paid', 'Paid'],
  ['pending', 'Not paid'],
  ['failed', 'Failed'],
  ['', 'All'],
];

const rupees = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export function welcomeMessage({ name, email, password, playStoreUrl, site }) {
  return [
    `Hi ${name.split(' ')[0]}, welcome to ${site}! 🎉`,
    '',
    'Your login details:',
    `User ID: ${email}`,
    `Password: ${password}`,
    '',
    playStoreUrl ? `Download the app: ${playStoreUrl}` : 'Install the app from the Google Play Store.',
    '',
    'Log in with these details. Your account works on one phone at a time.',
    'Need help? Reply to this message.',
  ].join('\n');
}

export default function Registrations() {
  const [status, setStatus] = useState('todo');
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const path = `/admin/registrations?${new URLSearchParams({ ...(status ? { status } : {}), ...(search ? { q: search } : {}) })}`;
  const { data, error, reload } = useLoad(path);
  const [open, setOpen] = useState(null);
  const s = data?.summary;

  return (
    <Page title="Registrations" sub="Sign-ups and payments from the website. Create the account, then send the login.">
      {s ? (
        <div className="stats">
          <Stat label="Waiting for login" value={s.todo} sub={s.todo ? 'paid, account not sent' : 'all done'} onClick={() => setStatus('todo')} />
          <Stat label="Paid today" value={s.paidToday} />
          <Stat label="Paid total" value={s.paid} onClick={() => setStatus('paid')} />
          <Stat label="Revenue" value={rupees(s.revenue)} sub="before Razorpay fees" />
        </div>
      ) : null}

      <div className="toolbar">
        <div className="seg">
          {FILTERS.map(([k, l]) => (
            <button key={k} className={status === k ? 'on' : ''} onClick={() => setStatus(k)}>
              {l}
              {k === 'todo' && s?.todo ? <span className="seg-count">{s.todo}</span> : null}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => (e.preventDefault(), setSearch(q.trim()))} className="row gap">
          <input className="search" placeholder="Name, phone, email or payment ID" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
      </div>

      {!data ? (
        <Loading error={error} onRetry={reload} />
      ) : data.registrations.length === 0 ? (
        <Empty>{status === 'todo' ? 'Nobody is waiting for a login. 🎉' : 'No registrations here yet.'}</Empty>
      ) : (
        <div className="card flush">
          <table className="table click">
            <thead>
              <tr>
                <th>Student</th>
                <th>Preparing for</th>
                <th>Payment</th>
                <th>When</th>
                <th>Login</th>
              </tr>
            </thead>
            <tbody>
              {data.registrations.map((r) => (
                <tr key={r.id} onClick={() => setOpen(r)}>
                  <td>
                    <div className="strong">{r.name}</div>
                    <div className="muted small">
                      +91 {r.phone} · {r.email}
                    </div>
                  </td>
                  <td className="small">
                    {r.exams.join(', ') || <span className="muted">—</span>}
                    {r.district ? <div className="muted">{r.district}</div> : null}
                  </td>
                  <td>
                    <PayBadge r={r} />
                    <div className="muted small">{rupees(r.amount)}{r.method ? ` · ${r.method}` : ''}</div>
                  </td>
                  <td className="small nowrap">{ago(r.paidAt || r.createdAt)}</td>
                  <td>
                    {r.status !== 'paid' ? (
                      <span className="muted small">—</span>
                    ) : r.fulfilled ? (
                      <Badge kind="green">Sent</Badge>
                    ) : r.userId ? (
                      <Badge kind="gold">Account ready</Badge>
                    ) : (
                      <Badge kind="red">To do</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open ? (
        <Detail
          reg={open}
          site={data.site}
          onClose={() => setOpen(null)}
          onChanged={(r) => {
            if (r) setOpen(r);
            reload();
          }}
        />
      ) : null}
    </Page>
  );
}

function PayBadge({ r }) {
  if (r.status === 'paid') return <Badge kind="green">Paid{r.paidVia === 'manual' ? ' (manual)' : ''}</Badge>;
  if (r.status === 'failed') return <Badge kind="red">Failed</Badge>;
  return <Badge>Not paid</Badge>;
}

function Detail({ reg, site, onClose, onChanged }) {
  const books = useLoad('/admin/books');
  const published = useMemo(() => (books.data?.books || []).filter((b) => b.published), [books.data]);
  const [password, setPassword] = useState(randomPassword());
  const [picked, setPicked] = useState(null);
  const [created, setCreated] = useState(null); // { password } after creating the account
  const [note, setNote] = useState(reg.adminNote || '');
  const [run, busy] = useAction();
  const chosen = picked ?? published.map((b) => b.slug);

  const patch = (body, msg) =>
    run(() => api(`/admin/registrations/${reg.id}`, { method: 'PATCH', body }), msg).then((r) => r && onChanged(r.registration));

  const createAccount = async () => {
    const r = await run(
      () => api(`/admin/registrations/${reg.id}/account`, { method: 'POST', body: { password, books: chosen } }),
      'Account created'
    );
    if (r) {
      setCreated({ password });
      onChanged(r.registration);
    }
  };

  const message = created ? welcomeMessage({ name: reg.name, email: reg.email, password: created.password, playStoreUrl: site.playStoreUrl, site: site.name }) : '';
  const wa = `https://wa.me/91${reg.phone}?text=${encodeURIComponent(message)}`;
  const mail = `mailto:${reg.email}?subject=${encodeURIComponent(`Your ${site.name} login`)}&body=${encodeURIComponent(message)}`;

  return (
    <Modal title={reg.name} onClose={onClose} wide>
      <div className="grid2">
        <dl className="info">
          <dt>Mobile</dt>
          <dd>
            <a href={`https://wa.me/91${reg.phone}`} target="_blank" rel="noreferrer">+91 {reg.phone}</a>
          </dd>
          <dt>Email</dt>
          <dd>{reg.email}</dd>
          <dt>District</dt>
          <dd>{reg.district || <span className="muted">—</span>}</dd>
          <dt>Exams</dt>
          <dd>{reg.exams.join(', ') || <span className="muted">—</span>}</dd>
          <dt>Registered</dt>
          <dd>{dateTime(reg.createdAt)}</dd>
          {reg.source ? (
            <>
              <dt>Came from</dt>
              <dd>{reg.source}</dd>
            </>
          ) : null}
        </dl>
        <dl className="info">
          <dt>Status</dt>
          <dd><PayBadge r={reg} /></dd>
          <dt>Amount</dt>
          <dd>{rupees(reg.amount)}</dd>
          <dt>Paid</dt>
          <dd>{reg.paidAt ? `${dateTime(reg.paidAt)}${reg.method ? ` · ${reg.method}` : ''}` : <span className="muted">—</span>}</dd>
          <dt>Payment ID</dt>
          <dd className="mono small">{reg.paymentId || <span className="muted">—</span>}</dd>
          <dt>Order ID</dt>
          <dd className="mono small">{reg.orderId || <span className="muted">—</span>}</dd>
          <dt>Emails</dt>
          <dd className="small">
            {reg.studentEmailedAt ? `Receipt sent ${ago(reg.studentEmailedAt)}` : 'No receipt sent'}
            {reg.adminEmailedAt ? ' · alert sent' : ''}
            {reg.loginEmailedAt ? ` · login emailed ${ago(reg.loginEmailedAt)}` : ''}
            {reg.emailError ? <div className="err">{reg.emailError}</div> : null}
          </dd>
        </dl>
      </div>

      {reg.status === 'paid' ? (
        <section className="card mt">
          {!created && !reg.userId ? (
            <>
              <h3>1. Create the app account</h3>
              <Field label="Password" hint="A random one is filled in. You'll send it to the student in the next step.">
                <div className="row gap">
                  <input className="grow mono" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} />
                  <button className="btn" type="button" onClick={() => setPassword(randomPassword())}>New</button>
                </div>
              </Field>
              <Field label="Books">
                <BookPicker books={published} value={chosen} onChange={setPicked} />
              </Field>
              <div className="row end">
                <button className="btn primary" disabled={busy || password.length < 8} onClick={createAccount}>Create account</button>
              </div>
            </>
          ) : created ? (
            <>
              <h3>2. Send the login</h3>
              <pre className="creds">{message}</pre>
              <div className="row gap wrap">
                <a className="btn primary" href={wa} target="_blank" rel="noreferrer">Send on WhatsApp</a>
                {site.emailReady ? (
                  <button
                    className="btn"
                    disabled={busy}
                    onClick={() =>
                      run(() => api(`/admin/registrations/${reg.id}/email-login`, { method: 'POST', body: { password: created.password } }), `Login emailed to ${reg.email}`).then(
                        (r) => r && onChanged(r.registration)
                      )
                    }
                  >
                    {reg.loginEmailedAt ? 'Email again' : 'Send by email'}
                  </button>
                ) : (
                  <a className="btn" href={mail}>Send by email</a>
                )}
                <button className="btn" onClick={() => navigator.clipboard?.writeText(message)}>Copy</button>
              </div>
              <div className="row between mt">
                <span className="muted small">After sending, mark it so it leaves the "Send login" list.</span>
                {reg.fulfilled ? (
                  <Badge kind="green">Marked as sent</Badge>
                ) : (
                  <button className="btn" disabled={busy} onClick={() => patch({ fulfilled: true }, 'Marked as sent')}>Mark login sent ✓</button>
                )}
              </div>
            </>
          ) : (
            <>
              <h3>Account</h3>
              <p>
                The account exists. {reg.fulfilled ? `Login sent ${ago(reg.fulfilledAt)}.` : 'The login has not been marked as sent.'}
              </p>
              <div className="row gap wrap">
                <button className="btn" onClick={() => go('students', reg.userId)}>Open student</button>
                <button className="btn" onClick={() => setCreated(null) || onChanged({ ...reg, userId: null })} title="Sets a new password and shows the message again">
                  New password &amp; message
                </button>
                {reg.fulfilled ? (
                  <button className="btn" disabled={busy} onClick={() => patch({ fulfilled: false }, 'Moved back to "Send login"')}>Mark not sent</button>
                ) : (
                  <button className="btn primary" disabled={busy} onClick={() => patch({ fulfilled: true }, 'Marked as sent')}>Mark login sent ✓</button>
                )}
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="card mt">
          <h3>Not paid</h3>
          <p className="muted">
            The student started registering but the payment wasn't completed. If they paid you another way (for example UPI directly), record it here.
          </p>
          <div className="row gap wrap">
            <button
              className="btn primary"
              disabled={busy}
              onClick={() => {
                const reference = prompt('Payment reference (UPI transaction ID, etc.):');
                if (reference !== null) patch({ markPaid: { reference } }, 'Marked as paid');
              }}
            >
              Record payment
            </button>
            <button
              className="btn danger"
              disabled={busy}
              onClick={() => confirm('Delete this unpaid registration?') && run(() => api(`/admin/registrations/${reg.id}`, { method: 'DELETE' }), 'Deleted').then((r) => r && (onClose(), onChanged()))}
            >
              Delete
            </button>
          </div>
        </section>
      )}

      <Field label="Notes (only you see these)">
        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => note !== (reg.adminNote || '') && patch({ adminNote: note }, 'Note saved')} />
      </Field>
    </Modal>
  );
}
