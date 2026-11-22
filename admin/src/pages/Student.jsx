import React, { useState } from 'react';
import { api } from '../api';
import { go } from '../nav';
import { ago, date, dateTime, describe, minutes, shortTitle } from '../format';
import { Badge, Bars, Empty, Field, Loading, Modal, Page, Stat, useAction, useLoad } from '../ui';
import BookPicker from './BookPicker';
import { randomPassword } from './Students';
import { SendForm } from './Notifications';

export default function Student({ id }) {
  const { data, error, reload } = useLoad(`/admin/users/${id}`);
  const books = useLoad('/admin/books');
  const [modal, setModal] = useState(null);
  const [run, busy] = useAction();

  if (!data) return <Page title="Student"><Loading error={error} onRetry={reload} /></Page>;
  const { user: u, totals } = data;
  const patch = (body, msg) => run(() => api(`/admin/users/${id}`, { method: 'PATCH', body }), msg).then((r) => r && reload());

  const avg = data.tests.length ? Math.round(data.tests.reduce((s, t) => s + t.percent, 0) / data.tests.length) : null;
  const last30 = fill30(data.daily);

  return (
    <Page
      title={u.name || u.email.split('@')[0]}
      sub={
        <>
          {u.email} · joined {date(u.createdAt)} · last seen {ago(u.lastSeenAt)}{' '}
          {u.disabled ? <Badge kind="red">Disabled</Badge> : u.signedIn ? <Badge kind="green">Signed in</Badge> : <Badge>Signed out</Badge>}
          {u.role === 'admin' ? <Badge kind="gold">Admin</Badge> : null}
        </>
      }
      actions={
        <>
          <button className="btn" onClick={() => go('students')}>← All students</button>
          <button className="btn primary" onClick={() => setModal('notify')}>Send notification</button>
        </>
      }
    >
      <div className="stats">
        <Stat label="Time in app" value={minutes(totals.minutes)} sub={`${minutes(totals.readingMinutes)} reading`} />
        <Stat label="Logins" value={totals.logins} sub={u.device ? `on ${u.device}` : 'no phone signed in'} />
        <Stat label="Tests submitted" value={data.tests.length} sub={avg != null ? `average ${avg}%` : 'none yet'} />
        <Stat label="Screenshot attempts" value={totals.screenshots} sub={totals.screenshots ? 'blocked by the app' : 'none'} />
      </div>

      <div className="grid2">
        <section className="card">
          <h3>Minutes per day · last 30 days</h3>
          <Bars data={last30} value={(d) => d.minutes} label={(d) => d.label} format={minutes} height={120} />
        </section>
        <section className="card">
          <h3>Account</h3>
          <dl className="info">
            <dt>Books</dt>
            <dd>
              {u.role === 'admin' ? 'All (admin)' : u.books.length ? u.books.map((s) => shortTitle(books.data?.books.find((b) => b.slug === s)?.title || s)).join(', ') : 'None'}
              {u.role !== 'admin' ? <button className="link ml" onClick={() => setModal('books')}>Change</button> : null}
            </dd>
            <dt>Phone</dt>
            <dd>
              {u.device || <span className="muted">Not signed in</span>}
              {u.signedIn ? (
                <button className="link ml" disabled={busy} onClick={() => confirm('Sign this student out of their phone?') && run(() => api(`/admin/users/${id}/reset-session`, { method: 'POST' }), 'Signed out').then(reload)}>
                  Sign out
                </button>
              ) : null}
            </dd>
            <dt>Name</dt>
            <dd>
              {u.name || <span className="muted">Not set</span>}
              <button className="link ml" onClick={() => setModal('name')}>Edit</button>
            </dd>
          </dl>
          <div className="row gap wrap mt">
            <button className="btn" onClick={() => setModal('password')}>Reset password</button>
            <button className="btn" disabled={busy} onClick={() => patch({ disabled: !u.disabled }, u.disabled ? 'Account enabled' : 'Account disabled')}>
              {u.disabled ? 'Enable account' : 'Disable account'}
            </button>
            <button
              className="btn danger"
              disabled={busy}
              onClick={() =>
                confirm(`Delete ${u.email} and all their test results, activity and queries? This can't be undone.`) &&
                run(() => api(`/admin/users/${id}`, { method: 'DELETE' }), 'Account deleted').then((r) => r && go('students'))
              }
            >
              Delete
            </button>
          </div>
        </section>
      </div>

      <div className="grid2">
        <section className="card">
          <h3>Most-read sections</h3>
          {data.topSections.length === 0 ? <Empty>Nothing read yet.</Empty> : null}
          <table className="table compact">
            <tbody>
              {data.topSections.map((s) => (
                <tr key={s.bookSlug + s.sectionKey}>
                  <td>
                    <div>{s.title}</div>
                    <div className="muted small">{shortTitle(s.bookTitle)} · opened {s.opens}× · last {ago(s.last)}</div>
                  </td>
                  <td className="num nowrap">{minutes(s.minutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.byBook.length ? (
            <p className="muted small mt">
              By book: {data.byBook.map((b) => `${shortTitle(b.title)} ${minutes(b.minutes)}`).join(' · ')}
            </p>
          ) : null}
        </section>
        <section className="card">
          <h3>Test results</h3>
          {data.tests.length === 0 ? <Empty>No tests submitted.</Empty> : null}
          <table className="table compact">
            <tbody>
              {data.tests.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div>{t.title}</div>
                    <div className="muted small">
                      {shortTitle(t.bookTitle)} · {dateTime(t.submittedAt)} · {t.correct} right, {t.wrong} wrong, {t.skipped} skipped
                    </div>
                  </td>
                  <td className="num">
                    <Badge kind={t.percent >= 75 ? 'green' : t.percent >= 50 ? 'gold' : 'red'}>{t.percent}%</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <div className="grid2">
        <section className="card">
          <div className="row between">
            <h3>Recent activity</h3>
          </div>
          {data.recent.length === 0 ? <Empty>No activity yet.</Empty> : null}
          <ul className="feed">
            {data.recent.map((e) => (
              <li key={e.id}>
                <span>{describe(e)}</span>
                <span className="muted small nowrap">{dateTime(e.at)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h3>Queries</h3>
          {data.queries.length === 0 ? <Empty>No queries from this student.</Empty> : null}
          <ul className="feed">
            {data.queries.map((q) => (
              <li key={q.id}>
                <a href={`#/queries/${q.id}`}>{q.subject}</a>
                <StatusBadge status={q.status} />
                <span className="muted small nowrap">{ago(q.updatedAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {modal === 'books' ? (
        <EditBooks
          books={books.data?.books}
          value={u.books}
          onClose={() => setModal(null)}
          onSave={(b) => patch({ books: b }, 'Books updated').then(() => setModal(null))}
        />
      ) : null}
      {modal === 'name' ? <EditName value={u.name} onClose={() => setModal(null)} onSave={(name) => patch({ name }, 'Name saved').then(() => setModal(null))} /> : null}
      {modal === 'password' ? <ResetPassword email={u.email} id={id} onClose={() => setModal(null)} onDone={reload} /> : null}
      {modal === 'notify' ? (
        <Modal title={`Notify ${u.name || u.email}`} onClose={() => setModal(null)}>
          <SendForm fixedUsers={[u]} onSent={() => setModal(null)} />
        </Modal>
      ) : null}
    </Page>
  );
}

export function StatusBadge({ status }) {
  return <Badge kind={status === 'open' ? 'red' : status === 'answered' ? 'gold' : 'grey'}>{status}</Badge>;
}

function fill30(daily) {
  const map = new Map(daily.map((d) => [d.day, d.minutes]));
  const out = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5);
    const key = d.toLocaleDateString('en-CA');
    out.push({ minutes: map.get(key) || 0, label: i % 5 === 0 ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '' });
  }
  return out;
}

function EditBooks({ books, value, onClose, onSave }) {
  const [v, setV] = useState(value);
  return (
    <Modal title="Books this student can read" onClose={onClose}>
      <BookPicker books={books} value={v} onChange={setV} />
      <div className="row gap end mt">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={() => onSave(v)}>Save</button>
      </div>
    </Modal>
  );
}

function EditName({ value, onClose, onSave }) {
  const [v, setV] = useState(value || '');
  return (
    <Modal title="Name" onClose={onClose}>
      <form onSubmit={(e) => (e.preventDefault(), onSave(v))}>
        <Field label="Full name">
          <input value={v} onChange={(e) => setV(e.target.value)} autoFocus />
        </Field>
        <div className="row gap end">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary">Save</button>
        </div>
      </form>
    </Modal>
  );
}

function ResetPassword({ id, email, onClose, onDone }) {
  const [pw, setPw] = useState(randomPassword());
  const [done, setDone] = useState(false);
  const [run, busy] = useAction();
  const text = `Exam Books login\nEmail: ${email}\nPassword: ${pw}`;
  const save = async (e) => {
    e.preventDefault();
    const r = await run(() => api(`/admin/users/${id}`, { method: 'PATCH', body: { password: pw } }), 'Password changed');
    if (r) {
      setDone(true);
      onDone();
    }
  };
  return (
    <Modal title="Reset password" onClose={onClose}>
      {done ? (
        <>
          <p>The student has been signed out. Send them the new details:</p>
          <pre className="creds">{text}</pre>
          <div className="row gap end">
            <button className="btn" onClick={() => navigator.clipboard?.writeText(text)}>Copy</button>
            <button className="btn primary" onClick={onClose}>Done</button>
          </div>
        </>
      ) : (
        <form onSubmit={save}>
          <Field label="New password" hint="The student will be signed out and must log in with this.">
            <div className="row gap">
              <input className="grow mono" value={pw} onChange={(e) => setPw(e.target.value)} minLength={8} required />
              <button type="button" className="btn" onClick={() => setPw(randomPassword())}>New</button>
            </div>
          </Field>
          <div className="row gap end">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button className="btn primary" disabled={busy}>Set password</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
