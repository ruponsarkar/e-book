import React, { useMemo, useState } from 'react';
import { api } from '../api';
import { go } from '../nav';
import { ago, minutes, shortTitle } from '../format';
import { Badge, Empty, Field, Loading, Modal, Page, useAction, useLoad } from '../ui';
import BookPicker from './BookPicker';

export const randomPassword = () => {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
};

export default function Students() {
  const { data, error, reload } = useLoad('/admin/users');
  const books = useLoad('/admin/books');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('students');
  const [adding, setAdding] = useState(false);
  const titles = useMemo(() => new Map((books.data?.books || []).map((b) => [b.slug, shortTitle(b.title)])), [books.data]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data?.users || []).filter((u) => {
      if (filter === 'students' && u.role !== 'student') return false;
      if (filter === 'admins' && u.role !== 'admin') return false;
      if (filter === 'disabled' && !u.disabled) return false;
      return !term || u.email.includes(term) || (u.name || '').toLowerCase().includes(term);
    });
  }, [data, q, filter]);

  return (
    <Page
      title="Students"
      sub={data ? `${data.users.filter((u) => u.role === 'student').length} student accounts` : ''}
      actions={<button className="btn primary" onClick={() => setAdding(true)}>+ Add student</button>}
    >
      <div className="toolbar">
        <input className="search" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="seg">
          {['students', 'disabled', 'admins', 'all'].map((f) => (
            <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {!data ? (
        <Loading error={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <Empty>No accounts match.</Empty>
      ) : (
        <div className="card flush">
          <table className="table click">
            <thead>
              <tr>
                <th>Student</th>
                <th>Books</th>
                <th>Last seen</th>
                <th className="num">Time · 7 days</th>
                <th className="num">Tests</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} onClick={() => go('students', u.id)}>
                  <td>
                    <div className="strong">{u.name || u.email.split('@')[0]}</div>
                    <div className="muted small">{u.email}</div>
                  </td>
                  <td className="small">
                    {u.role === 'admin' ? 'All (admin)' : u.books.length === 0 ? <span className="muted">None</span> : u.books.map((b) => titles.get(b) || b).join(', ')}
                  </td>
                  <td className="small nowrap">{ago(u.lastSeenAt)}</td>
                  <td className="num">{minutes(u.minutesWeek)}</td>
                  <td className="num">
                    {u.tests}
                    {u.average != null ? <span className="muted small"> · {u.average}%</span> : null}
                  </td>
                  <td>
                    {u.disabled ? <Badge kind="red">Disabled</Badge> : u.signedIn ? <Badge kind="green">Signed in</Badge> : <Badge>Signed out</Badge>}
                    {u.role === 'admin' ? <Badge kind="gold">Admin</Badge> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adding ? (
        <AddStudent
          books={books.data?.books}
          onClose={() => setAdding(false)}
          onDone={(u) => {
            setAdding(false);
            reload();
            go('students', u.id);
          }}
        />
      ) : null}
    </Page>
  );
}

function AddStudent({ books, onClose, onDone }) {
  const [form, setForm] = useState({ name: '', email: '', password: randomPassword(), books: [] });
  const [run, busy] = useAction();
  const [created, setCreated] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const r = await run(() => api('/admin/users', { method: 'POST', body: form }), 'Student added');
    if (r) setCreated(r.user);
  };

  if (created) {
    const text = `Exam Books login\nEmail: ${created.email}\nPassword: ${form.password}`;
    return (
      <Modal title="Student added" onClose={() => onDone(created)}>
        <p>Send these login details to the student. The password won’t be shown again.</p>
        <pre className="creds">{text}</pre>
        <div className="row gap end">
          <button className="btn" onClick={() => navigator.clipboard?.writeText(text)}>Copy</button>
          <button className="btn primary" onClick={() => onDone(created)}>Done</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Add student" onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Name">
          <input value={form.name} onChange={set('name')} placeholder="Full name" autoFocus />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email} onChange={set('email')} required placeholder="student@example.com" />
        </Field>
        <Field label="Password" hint="8+ characters. A random one is filled in; you can change it.">
          <div className="row gap">
            <input value={form.password} onChange={set('password')} required minLength={8} className="grow mono" />
            <button type="button" className="btn" onClick={() => setForm((f) => ({ ...f, password: randomPassword() }))}>New</button>
          </div>
        </Field>
        <Field label="Books">
          <BookPicker books={books} value={form.books} onChange={(b) => setForm((f) => ({ ...f, books: b }))} />
        </Field>
        <div className="row gap end">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Adding…' : 'Add student'}</button>
        </div>
      </form>
    </Modal>
  );
}
