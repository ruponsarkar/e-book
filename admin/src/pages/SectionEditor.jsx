import React, { useEffect, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';
import { api } from '../api';
import { go } from '../nav';
import { ago } from '../format';
import { Badge, Field, Loading, Page, useAction, useLoad } from '../ui';

// Same layout as the questions in the books, so the app shows them as question cards.
const QUESTION_TEMPLATE = (n, kind) =>
  kind === 'test'
    ? `**${n}.** Question in English?\\
প্ৰশ্নটো অসমীয়াত?\\
(A) Option / বিকল্প\\
(B) Option / বিকল্প\\
(C) Option / বিকল্প\\
(D) Option / বিকল্প
`
    : `**${n}.** Question in English?\\
প্ৰশ্নটো অসমীয়াত?\\
(A) Option / বিকল্প\\
(B) Option / বিকল্প\\
(C) Option / বিকল্প\\
(D) Option / বিকল্প\\
**Answer / উত্তৰ: (B) Option / বিকল্প**\\
Explanation: Why this is right.\\
ব্যাখ্যা: অসমীয়াত ব্যাখ্যা।\\
*ID · Topic · Easy · ADRE, APSC*
`;

const NEW_TEMPLATE = '# Chapter title\n\nWrite the chapter here.\n';

export default function SectionEditor({ slug, sectionKey }) {
  const isNew = !sectionKey;
  const { data, error, reload } = useLoad(isNew ? null : `/admin/books/${slug}/sections/${sectionKey}`);
  const [form, setForm] = useState(isNew ? { title: '', kind: 'chapter', markdown: NEW_TEMPLATE } : null);
  const [saved, setSaved] = useState(isNew ? null : '');
  const [check, setCheck] = useState(null);
  const [view, setView] = useState('split');
  const [run, busy] = useAction();
  const area = useRef(null);

  useEffect(() => {
    if (data?.section) {
      const { title, kind, markdown } = data.section;
      setForm({ title, kind, markdown });
      setSaved(markdown + title + kind);
    }
  }, [data]);

  const dirty = form && saved !== form.markdown + form.title + form.kind;

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const warn = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // Live question/answer-key check.
  useEffect(() => {
    if (!form) return undefined;
    const t = setTimeout(() => {
      api('/admin/check-section', { method: 'POST', body: { markdown: form.markdown, kind: form.kind } })
        .then(setCheck)
        .catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [form?.markdown, form?.kind]);

  const html = useMemo(() => (form ? marked.parse(form.markdown, { breaks: false }) : ''), [form?.markdown]);

  if (!form) return <Page title="Section"><Loading error={error} onRetry={reload} /></Page>;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const insertQuestion = () => {
    const n = (form.markdown.match(/^\*\*(\d+)\.\*\*/gm) || []).map((m) => Number(m.match(/\d+/)[0])).reduce((a, b) => Math.max(a, b), 0) + 1;
    const el = area.current;
    const at = el ? el.selectionStart : form.markdown.length;
    const text = `\n${QUESTION_TEMPLATE(n, form.kind)}\n`;
    setForm((f) => ({ ...f, markdown: f.markdown.slice(0, at) + text + f.markdown.slice(at) }));
  };

  const save = async () => {
    const body = { title: form.title, kind: form.kind, markdown: form.markdown };
    if (isNew) {
      const r = await run(() => api(`/admin/books/${slug}/sections`, { method: 'POST', body }), 'Section added');
      if (r) {
        setSaved(form.markdown + form.title + form.kind);
        go('books', slug, 'sections', r.section.key);
      }
    } else {
      const r = await run(() => api(`/admin/books/${slug}/sections/${sectionKey}`, { method: 'PUT', body }), 'Saved. Students get the new version on their next sync.');
      if (r) setSaved(r.section.markdown + r.section.title + r.section.kind);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete "${form.title}"? Students lose it on their next sync.`)) return;
    const r = await run(() => api(`/admin/books/${slug}/sections/${sectionKey}`, { method: 'DELETE' }), 'Section deleted');
    if (r) {
      setSaved(form.markdown + form.title + form.kind);
      go('books', slug);
    }
  };

  return (
    <Page
      title={isNew ? 'New section' : form.title || 'Section'}
      sub={
        <>
          {check ? (
            <>
              {check.questions} question{check.questions === 1 ? '' : 's'}
              {check.answers != null ? ` · ${check.answers} in answer key` : ''}
              {check.problems.length ? <Badge kind="red">{check.problems.length} problem{check.problems.length === 1 ? '' : 's'}</Badge> : <Badge kind="green">OK</Badge>}
            </>
          ) : null}
          {!isNew && data?.section ? <span className="muted"> · last saved {ago(data.section.updatedAt)}</span> : null}
        </>
      }
      actions={
        <>
          <button className="btn" onClick={() => (!dirty || confirm('Leave without saving?')) && go('books', slug)}>← Back</button>
          {!isNew ? <button className="btn danger" onClick={remove} disabled={busy}>Delete</button> : null}
          <button className="btn primary" onClick={save} disabled={busy || (!dirty && !isNew)}>
            {busy ? 'Saving…' : dirty || isNew ? 'Save' : 'Saved'}
          </button>
        </>
      }
    >
      {check?.problems.length ? (
        <div className="note warn">
          {check.problems.map((p) => (
            <div key={p}>⚠ {p}</div>
          ))}
        </div>
      ) : null}

      <div className="editor-meta">
        <Field label="Title">
          <input value={form.title} onChange={set('title')} placeholder='Taken from the "# " line if empty' />
        </Field>
        <Field label="Type">
          <select value={form.kind} onChange={set('kind')}>
            <option value="chapter">Chapter (practice questions with answers)</option>
            <option value="test">Test paper (graded, answer key at the end)</option>
            <option value="front">Front matter (intro, contents)</option>
          </select>
        </Field>
      </div>

      <div className="toolbar">
        <div className="seg">
          {[
            ['split', 'Edit + preview'],
            ['edit', 'Edit'],
            ['preview', 'Preview'],
          ].map(([k, l]) => (
            <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>
              {l}
            </button>
          ))}
        </div>
        <button className="btn" onClick={insertQuestion}>+ Insert question</button>
      </div>

      <div className={`editor ${view}`}>
        {view !== 'preview' ? (
          <textarea
            ref={area}
            className="md-input"
            value={form.markdown}
            onChange={set('markdown')}
            spellCheck={false}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                save();
              }
            }}
          />
        ) : null}
        {view !== 'edit' ? <div className="md-preview" dangerouslySetInnerHTML={{ __html: html }} /> : null}
      </div>
      <p className="muted small">
        Markdown, the same format as the files you import. Questions start with <code>**12.**</code>. Test papers end with a{' '}
        <code>## Answer Key</code> table (<code>| Q | Answer |</code>). Press Ctrl/⌘ + S to save.
      </p>
    </Page>
  );
}
