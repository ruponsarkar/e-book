import React, { useMemo, useState } from 'react';
import { api } from '../api';
import { dateTime } from '../format';
import { Badge, Empty, Field, Loading, Page, useAction, useLoad } from '../ui';

export default function Notifications() {
  const { data, error, reload } = useLoad('/admin/notifications');
  const [run] = useAction();

  return (
    <Page title="Notifications" sub="Messages appear in the students' app inbox, with a badge on the bell.">
      <div className="grid2 top">
        <section className="card">
          <h3>New notification</h3>
          <SendForm onSent={reload} />
        </section>
        <section className="card">
          <h3>Sent</h3>
          {!data ? (
            <Loading error={error} onRetry={reload} />
          ) : data.notifications.length === 0 ? (
            <Empty>Nothing sent yet.</Empty>
          ) : (
            <ul className="sent">
              {data.notifications.map((n) => (
                <li key={n.id}>
                  <div className="row between">
                    <span className="strong">{n.title}</span>
                    <button
                      className="link danger-text small"
                      onClick={() => confirm('Delete this notification? It disappears from the students’ inbox.') && run(() => api(`/admin/notifications/${n.id}`, { method: 'DELETE' }), 'Deleted').then(reload)}
                    >
                      Delete
                    </button>
                  </div>
                  {n.body ? <p className="pre">{n.body}</p> : null}
                  <div className="muted small">
                    {dateTime(n.createdAt)} · {n.audience === 'all' ? <Badge kind="blue">All students</Badge> : <span title={n.to.join(', ')}>to {n.to.length === 1 ? n.to[0] : `${n.to.length} students`}</span>}
                    {' · '}read by {n.read} of {n.recipients}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Page>
  );
}

// Used here and on a student's page (fixedUsers = that student).
export function SendForm({ fixedUsers, onSent }) {
  const users = useLoad(fixedUsers ? null : '/admin/users');
  const [audience, setAudience] = useState(fixedUsers ? 'users' : 'all');
  const [chosen, setChosen] = useState(fixedUsers ? fixedUsers.map((u) => String(u.id)) : []);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [q, setQ] = useState('');
  const [run, busy] = useAction();

  const students = useMemo(() => (users.data?.users || []).filter((u) => u.role === 'student' && !u.disabled), [users.data]);
  const shown = students.filter((u) => !q || u.email.includes(q.toLowerCase()) || (u.name || '').toLowerCase().includes(q.toLowerCase()));
  const set = new Set(chosen);

  const send = async (e) => {
    e.preventDefault();
    const to = audience === 'all' ? `all ${students.length} students` : `${chosen.length} student${chosen.length === 1 ? '' : 's'}`;
    if (!fixedUsers && !confirm(`Send "${title}" to ${to}?`)) return;
    const r = await run(() => api('/admin/notifications', { method: 'POST', body: { title, body, audience, userIds: chosen } }), 'Notification sent');
    if (r) {
      setTitle('');
      setBody('');
      if (!fixedUsers) setChosen([]);
      onSent?.();
    }
  };

  return (
    <form onSubmit={send}>
      {!fixedUsers ? (
        <Field label="Send to">
          <div className="seg">
            <button type="button" className={audience === 'all' ? 'on' : ''} onClick={() => setAudience('all')}>All students</button>
            <button type="button" className={audience === 'users' ? 'on' : ''} onClick={() => setAudience('users')}>Choose students</button>
          </div>
        </Field>
      ) : null}
      {audience === 'users' && !fixedUsers ? (
        <div className="field">
          <input className="search" placeholder="Search students" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="picker scroll">
            {shown.map((u) => (
              <label key={u.id} className="check">
                <input
                  type="checkbox"
                  checked={set.has(String(u.id))}
                  onChange={() => setChosen((c) => (set.has(String(u.id)) ? c.filter((x) => x !== String(u.id)) : [...c, String(u.id)]))}
                />
                {u.name ? `${u.name} · ` : ''}
                <span className="muted">{u.email}</span>
              </label>
            ))}
            {!shown.length ? <p className="muted small">No students match.</p> : null}
          </div>
          <span className="field-hint muted">{chosen.length} chosen</span>
        </div>
      ) : null}
      <Field label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} placeholder="New mock test added" />
      </Field>
      <Field label="Message">
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={2000} placeholder="Optional details" />
      </Field>
      <div className="row end">
        <button className="btn primary" disabled={busy || !title.trim() || (audience === 'users' && !chosen.length)}>
          {busy ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  );
}
