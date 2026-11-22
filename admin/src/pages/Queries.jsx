import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { go } from '../nav';
import { ago, dateTime } from '../format';
import { Empty, Loading, Page, useAction, useLoad } from '../ui';
import { StatusBadge } from './Student';

const CATEGORY = { problem: 'Problem in the app', content: 'Mistake in content', account: 'Account / login', suggestion: 'Suggestion', other: 'Other' };

export default function Queries({ selected }) {
  const [status, setStatus] = useState('open');
  const list = useLoad(`/admin/queries${status === 'all' ? '' : `?status=${status}`}`);
  const counts = list.data?.counts || {};

  return (
    <Page title="Queries" sub="Questions and problems students sent from the app.">
      <div className="toolbar">
        <div className="seg">
          {['open', 'answered', 'closed', 'all'].map((s) => (
            <button key={s} className={status === s ? 'on' : ''} onClick={() => setStatus(s)}>
              {s[0].toUpperCase() + s.slice(1)}
              {s !== 'all' && counts[s] ? <span className="seg-count">{counts[s]}</span> : null}
            </button>
          ))}
        </div>
      </div>
      <div className="split">
        <div className="card flush list">
          {!list.data ? (
            <Loading error={list.error} onRetry={list.reload} />
          ) : list.data.queries.length === 0 ? (
            <Empty>{status === 'open' ? 'Nothing waiting. 🎉' : 'None.'}</Empty>
          ) : (
            list.data.queries.map((q) => (
              <button key={q.id} className={`list-item ${selected === String(q.id) ? 'on' : ''}`} onClick={() => go('queries', q.id)}>
                <div className="row between">
                  <span className="strong ellipsis">{q.subject}</span>
                  <span className="muted small nowrap">{ago(q.updatedAt)}</span>
                </div>
                <div className="row between">
                  <span className="muted small ellipsis">{q.userName || q.userEmail} · {CATEGORY[q.category]}</span>
                  <StatusBadge status={q.status} />
                </div>
              </button>
            ))
          )}
        </div>
        <div className="card thread-card">
          {selected ? <Thread id={selected} onChanged={list.reload} /> : <Empty>Choose a query to read and reply.</Empty>}
        </div>
      </div>
    </Page>
  );
}

function Thread({ id, onChanged }) {
  const { data, error, reload, setData } = useLoad(`/admin/queries/${id}`);
  const [reply, setReply] = useState('');
  const [run, busy] = useAction();
  const end = useRef(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [data]);

  if (!data) return <Loading error={error} onRetry={reload} />;
  const q = data.query;

  const send = async (close) => {
    const r = await run(() => api(`/admin/queries/${id}/reply`, { method: 'POST', body: { message: reply, close } }), close ? 'Replied and closed' : 'Reply sent');
    if (r) {
      setReply('');
      setData(r);
      onChanged();
    }
  };
  const setStatus = async (status) => {
    const r = await run(() => api(`/admin/queries/${id}`, { method: 'PATCH', body: { status } }));
    if (r) {
      setData(r);
      onChanged();
    }
  };

  return (
    <div className="thread">
      <div className="thread-head">
        <div>
          <h2>{q.subject}</h2>
          <div className="muted small">
            <a href={`#/students/${q.userId}`}>{q.userName || q.userEmail}</a> · {CATEGORY[q.category]} · {dateTime(q.createdAt)}
            {q.context?.bookSlug ? ` · in ${q.context.bookSlug}${q.context.sectionKey ? ` / ${q.context.sectionKey}` : ''}` : ''}
            {q.context?.device ? ` · ${q.context.device}` : ''}
            {q.context?.appVersion ? ` · app ${q.context.appVersion}` : ''}
          </div>
        </div>
        <div className="row gap">
          <StatusBadge status={q.status} />
          {q.status !== 'closed' ? (
            <button className="btn small" onClick={() => setStatus('closed')} disabled={busy}>Close</button>
          ) : (
            <button className="btn small" onClick={() => setStatus('open')} disabled={busy}>Re-open</button>
          )}
        </div>
      </div>
      <div className="messages">
        {q.messages.map((m, i) => (
          <div key={i} className={`msg ${m.from}`}>
            <div className="msg-text">{m.text}</div>
            <div className="msg-meta">{m.from === 'admin' ? 'You' : q.userName || 'Student'} · {dateTime(m.at)}</div>
          </div>
        ))}
        <div ref={end} />
      </div>
      <div className="composer">
        <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply. The student gets a notification in the app." rows={3} />
        <div className="row gap end">
          <button className="btn" disabled={busy || !reply.trim()} onClick={() => send(true)}>Reply & close</button>
          <button className="btn primary" disabled={busy || !reply.trim()} onClick={() => send(false)}>Send reply</button>
        </div>
      </div>
    </div>
  );
}
