import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { lease } from './lease';
import { onSynced } from './sync';
import { vault } from './vault';

// Loads a GET endpoint "stale-while-revalidate" style:
//   1. show the encrypted saved copy at once (if the offline lease allows it),
//   2. skip the network entirely when the caller knows the saved copy is current (`version`),
//   3. otherwise fetch, show and save the fresh copy; if the network fails, keep showing the saved one.
//
// Returns { data, error, offline, loading, reload }.
export function useCached(path, { book = null, version = null, versionOf = null, enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const live = useRef(true);
  const opts = useRef({ book, version, versionOf });
  opts.current = { book, version, versionOf };

  const run = useCallback(
    async ({ force = false } = {}) => {
      if (!path) return;
      const { book: b, version: want, versionOf: vOf } = opts.current;
      setLoading(true);
      const saved = lease.ok() ? await vault.get(path) : null;
      if (!live.current) return;
      if (saved) {
        setData(saved.value);
        setError(null);
        if (!force && want != null && saved.v === want) {
          setOffline(false);
          setLoading(false);
          return; // saved copy is the current version: no download needed
        }
      }
      try {
        const fresh = await api(path);
        if (!live.current) return;
        setData(fresh);
        setError(null);
        setOffline(false);
        // OFFLINE_DAYS=0 on the server means: never keep book content on the phone.
        if (!(b && lease.days() === 0)) vault.set(path, fresh, { book: b, v: vOf ? vOf(fresh) : null }).catch(() => {});
      } catch (e) {
        if (!live.current) return;
        if (e.status === 403 || e.status === 404) {
          vault.remove(path).catch(() => {});
          setData(null);
          setError(e);
        } else if (saved) {
          setOffline(true);
        } else if (e.code === 'NETWORK' && vault.has(path) && !lease.ok()) {
          setError({
            ...e,
            message: `You've been offline for more than ${lease.days()} days. Connect to the internet once to keep reading your saved books.`,
          });
        } else {
          setError(e);
        }
      } finally {
        if (live.current) setLoading(false);
      }
    },
    [path]
  );

  useEffect(() => {
    live.current = true;
    if (enabled) run();
    return () => {
      live.current = false;
    };
  }, [run, enabled]);

  // After "Sync latest", every open screen re-reads its (now updated) saved copy.
  useEffect(() => (enabled ? onSynced(() => run()) : undefined), [run, enabled]);

  const reload = useCallback(() => run({ force: true }), [run]);
  return { data, error, offline, loading, reload };
}

// Saves a GET response quietly (used to prefetch the next chapter or download a whole book).
export async function prefetch(path, { book, v }) {
  if (lease.days() === 0 || vault.has(path, v)) return false;
  const fresh = await api(path);
  await vault.set(path, fresh, { book, v: fresh?.section?.v ?? v ?? null });
  return true;
}
