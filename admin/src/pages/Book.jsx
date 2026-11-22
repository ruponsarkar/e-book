import React, { useRef, useState } from 'react';
import { api } from '../api';
import { go } from '../nav';
import { ago } from '../format';
import { Badge, Empty, Field, Loading, Modal, Page, useAction, useLoad, useToast } from '../ui';

const KIND = { front: 'Front matter', chapter: 'Chapter', test: 'Test paper' };

export default function Book({ slug }) {
  const { data, error, reload, setData } = useLoad(`/admin/books/${slug}`);
  const [run, busy] = useAction();
  const [editing, setEditing] = useState(false);
  const [filter, setFilter] = useState('all');
  const toast = useToast();
  const fileRef = useRef(null);

  if (!data) return <Page title="Book"><Loading error={error} onRetry={reload} /></Page>;
  const { book, sections } = data;
  const shown = sections.filter((s) => filter === 'all' || s.kind === filter);
  const totalQ = sections.reduce((n, s) => n + s.questions, 0);
  const problems = sections.filter((s) => s.problems.length).length;

  const move = async (i, dir) => {
    const next = [...sections];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setData((d) => ({ ...d, sections: next }));
    await run(() => api(`/admin/books/${slug}/order`, { method: 'POST', body: { keys: next.map((s) => s.key) } }));
  };

  // Upload .md files: each becomes a new section (named like the import script: "test-paper" → test).
  const upload = async (files) => {
    let added = 0;
    for (const file of [...files].sort((a, b) => a.name.localeCompare(b.name))) {
      const markdown = await file.text();
      const n = file.name.toLowerCase();
      const kind = n.includes('front') ? 'front' : n.includes('chapter') ? 'chapter' : n.includes('test') || n.includes('mock') ? 'test' : 'chapter';
      const r = await run(() => api(`/admin/books/${slug}/sections`, { method: 'POST', body: { markdown, kind, key: file.name.replace(/\.md$/i, '') } }));
      if (r) added++;
    }
    if (added) toast(`${added} section${added === 1 ? '' : 's'} added`);
    reload();
  };

  return (
    <Page
      title={book.title.split(/\s+[—–]\s+/)[0]}
      sub={
        <>
          {sections.length} sections · {totalQ.toLocaleString('en-IN')} questions · id <code>{book.slug}</code>{' '}
          {book.published ? <Badge kind="green">Published</Badge> : <Badge>Hidden from students</Badge>}
        </>
      }
      actions={
        <>
          <button className="btn" onClick={() => go('books')}>← Books</button>
          <button className="btn" onClick={() => setEditing(true)}>Edit details</button>
          <button
            className="btn"
            disabled={busy}
            onClick={() =>
              run(() => api(`/admin/books/${slug}`, { method: 'PATCH', body: { published: !book.published } }), book.published ? 'Book hidden' : 'Book published').then(reload)
            }
          >
            {book.published ? 'Hide' : 'Publish'}
          </button>
        </>
      }
    >
      {problems ? (
        <p className="note warn">
          {problems} section{problems === 1 ? ' has' : 's have'} problems (marked below). Open {problems === 1 ? 'it' : 'them'} to see what's wrong.
        </p>
      ) : null}

      <div className="toolbar">
        <div className="seg">
          {['all', 'chapter', 'test', 'front'].map((k) => (
            <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>
              {k === 'all' ? 'All' : KIND[k] + 's'}
            </button>
          ))}
        </div>
        <div className="row gap">
          <input ref={fileRef} type="file" accept=".md,text/markdown" multiple hidden onChange={(e) => (upload(e.target.files), (e.target.value = ''))} />
          <button className="btn" onClick={() => fileRef.current.click()} disabled={busy}>Upload .md files</button>
          <button className="btn primary" onClick={() => go('books', slug, 'new')}>+ New section</button>
        </div>
      </div>

      {shown.length === 0 ? (
        <Empty>No sections yet. Upload Markdown files exported from your doc, or write a new section.</Empty>
      ) : (
        <div className="card flush">
          <table className="table click">
            <thead>
              <tr>
                <th style={{ width: 44 }}>#</th>
                <th>Title</th>
                <th>Type</th>
                <th className="num">Questions</th>
                <th>Updated</th>
                <th style={{ width: 76 }}>Order</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((s) => {
                const i = sections.indexOf(s);
                return (
                  <tr key={s.key} onClick={() => go('books', slug, 'sections', s.key)}>
                    <td className="muted">{i + 1}</td>
                    <td>
                      <div className="strong">{s.title}</div>
                      {s.problems.length ? <div className="err small">⚠ {s.problems[0]}</div> : null}
                    </td>
                    <td>
                      <Badge kind={s.kind === 'test' ? 'blue' : s.kind === 'front' ? 'grey' : 'gold'}>{KIND[s.kind]}</Badge>
                    </td>
                    <td className="num">
                      {s.questions}
                      {s.kind === 'test' ? <span className="muted small"> · {s.answers} answers</span> : null}
                    </td>
                    <td className="small nowrap">{ago(s.updatedAt)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="icon-btn" title="Move up" disabled={busy || i === 0} onClick={() => move(i, -1)}>↑</button>
                      <button className="icon-btn" title="Move down" disabled={busy || i === sections.length - 1} onClick={() => move(i, 1)}>↓</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="danger-zone">
        <button
          className="btn danger"
          onClick={() =>
            prompt(`This deletes the book, all ${sections.length} sections, and removes it from every student. Type the book id "${slug}" to confirm.`) === slug &&
            run(() => api(`/admin/books/${slug}`, { method: 'DELETE' }), 'Book deleted').then((r) => r && go('books'))
          }
        >
          Delete book
        </button>
      </div>

      {editing ? <EditBook book={book} onClose={() => setEditing(false)} onDone={() => (setEditing(false), reload())} /> : null}
    </Page>
  );
}

function EditBook({ book, onClose, onDone }) {
  const [f, setF] = useState({ title: book.title, subtitle: book.subtitle || '', edition: book.edition || '' });
  const [run, busy] = useAction();
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    if (await run(() => api(`/admin/books/${book.slug}`, { method: 'PATCH', body: f }), 'Saved')) onDone();
  };
  return (
    <Modal title="Book details" onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Title" hint='"Title — tagline" shows the tagline on the cover.'>
          <input value={f.title} onChange={set('title')} required />
        </Field>
        <Field label="Subtitle">
          <input value={f.subtitle} onChange={set('subtitle')} />
        </Field>
        <Field label="Edition">
          <input value={f.edition} onChange={set('edition')} />
        </Field>
        <div className="row gap end">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>Save</button>
        </div>
      </form>
    </Modal>
  );
}
