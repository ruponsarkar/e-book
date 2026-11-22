import React from 'react';
import { shortTitle } from '../format';

// Checkbox list of books.
export default function BookPicker({ books, value, onChange }) {
  if (!books) return <p className="muted small">Loading books…</p>;
  if (!books.length) return <p className="muted small">No books yet.</p>;
  const set = new Set(value);
  const toggle = (slug) => onChange(set.has(slug) ? value.filter((s) => s !== slug) : [...value, slug]);
  const all = books.every((b) => set.has(b.slug));
  return (
    <div className="picker">
      <label className="check strong">
        <input type="checkbox" checked={all} onChange={() => onChange(all ? [] : books.map((b) => b.slug))} />
        All books
      </label>
      {books.map((b) => (
        <label key={b.slug} className="check">
          <input type="checkbox" checked={set.has(b.slug)} onChange={() => toggle(b.slug)} />
          {shortTitle(b.title)}
          {!b.published ? <span className="muted small"> (hidden)</span> : null}
        </label>
      ))}
    </div>
  );
}
