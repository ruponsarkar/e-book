// "Sync latest" from the profile: pulls every change from the server in one go.
//   - the account (books added or removed; removed books' saved copies are deleted),
//   - the library list and each book's contents,
//   - every chapter already saved on the phone whose text changed on the server,
//   - and deletes saved chapters that were removed from a book.
// Chapters that were never saved are not downloaded here (the "Download for offline" card does that).
import { api } from '../api';
import { vault } from './vault';

const listeners = new Set();

// Screens subscribe so they re-read their saved copy after a sync. Returns an unsubscribe function.
export function onSynced(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const sectionPrefix = (slug) => `/books/${slug}/sections/`;

export async function syncAll({ refreshAccount, onProgress = () => {} }) {
  const result = { books: 0, newBooks: 0, updated: 0, removed: 0, failed: 0 };

  await refreshAccount(); // also prunes books the account lost

  const before = new Set(((await vault.get('/books'))?.value?.books || []).map((b) => b.slug));
  const library = await api('/books');
  await vault.set('/books', library);
  const books = library.books || [];
  result.books = books.length;
  result.newBooks = books.filter((b) => !before.has(b.slug)).length;

  for (let i = 0; i < books.length; i++) {
    const { slug } = books[i];
    onProgress({ done: i, total: books.length, title: books[i].title });
    try {
      const contents = await api(`/books/${slug}`);
      await vault.set(`/books/${slug}`, contents, { book: slug });

      const current = new Map((contents.sections || []).map((s) => [sectionPrefix(slug) + s.key, s.v]));
      for (const k of vault.keysForBook(slug)) {
        if (!k.startsWith(sectionPrefix(slug))) continue;
        if (!current.has(k)) {
          await vault.remove(k); // chapter no longer in the book
          result.removed++;
        } else if (!vault.has(k, current.get(k))) {
          const fresh = await api(k); // saved copy is out of date
          await vault.set(k, fresh, { book: slug, v: fresh?.section?.v ?? current.get(k) });
          result.updated++;
        }
      }

      const progress = await api(`/progress/books/${slug}`).catch(() => null);
      if (progress) await vault.set(`/progress/books/${slug}`, progress, { book: slug });
    } catch (e) {
      if (e.code === 'NETWORK') throw e;
      result.failed++;
    }
  }
  onProgress({ done: books.length, total: books.length });

  const profile = await api('/progress/profile').catch(() => null);
  if (profile) await vault.set('/progress/profile', profile);

  await vault.set('sync.last', Date.now());
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // a screen that went away
    }
  });
  return { ...result, profile };
}
