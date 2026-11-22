import React, { useState } from 'react';
import { api } from '../api';
import { go } from '../nav';
import { ago } from '../format';
import { Badge, Empty, Field, Loading, Modal, Page, useAction, useLoad } from '../ui';

export default function Books() {
  const { data, error, reload } = useLoad('/admin/books');
  const [adding, setAdding] = useState(false);

  return (
    <Page
      title="Books & questions"
      sub="Each book is a subject. Open one to edit its chapters, test papers and questions."
      actions={<button className="btn primary" onClick={() => setAdding(true)}>+ New book</button>}
    >
      {!data ? (
        <Loading error={error} onRetry={reload} />
      ) : data.books.length === 0 ? (
        <Empty>No books yet.</Empty>
      ) : (
        <div className="book-grid">
          {data.books.map((b) => {
            const [title, tagline] = b.title.split(/\s+[—–]\s+/);
            return (
              <button key={b.slug} className="card book-card" onClick={() => go('books', b.slug)}>
                <div className="book-spine" />
                <div className="book-body">
                  <div className="book-title">{title}</div>
                  {tagline ? <div className="muted small">{tagline}</div> : null}
                  <div className="book-meta">
                    <span>{b.sections.chapter} chapters</span>
                    <span>{b.sections.test} test papers</span>
                    <span>{b.students} student{b.students === 1 ? '' : 's'}</span>
                  </div>
                  <div className="row between">
                    {b.published ? <Badge kind="green">Published</Badge> : <Badge>Hidden</Badge>}
                    <span className="muted small">updated {ago(b.updatedAt)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
      {adding ? <NewBook onClose={() => setAdding(false)} onDone={(slug) => go('books', slug)} /> : null}
    </Page>
  );
}

function NewBook({ onClose, onDone }) {
  const [f, setF] = useState({ title: '', subtitle: '', edition: '' });
  const [run, busy] = useAction();
  const submit = async (e) => {
    e.preventDefault();
    const r = await run(() => api('/admin/books', { method: 'POST', body: f }), 'Book created');
    if (r) onDone(r.book.slug);
  };
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  return (
    <Modal title="New book" onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Title" hint='Use "Title — tagline" to show a tagline on the cover.'>
          <input value={f.title} onChange={set('title')} required autoFocus placeholder="Assam General Knowledge — Complete Guide" />
        </Field>
        <Field label="Subtitle">
          <input value={f.subtitle} onChange={set('subtitle')} />
        </Field>
        <Field label="Edition">
          <input value={f.edition} onChange={set('edition')} placeholder="2026" />
        </Field>
        <p className="muted small">The book starts hidden. Add chapters, then publish it.</p>
        <div className="row gap end">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>Create</button>
        </div>
      </form>
    </Modal>
  );
}
