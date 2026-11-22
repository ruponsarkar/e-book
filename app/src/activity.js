// Records how the app is used and sends it to the server in batches:
//   session  time the app is open in the foreground
//   read     time spent on one chapter or test paper
// Logins, test submissions and queries are recorded by the server itself.
//
// Events wait in an encrypted queue on the phone (the vault), so time spent offline
// is sent once the phone is back online.
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { api } from './api';
import { vault } from './cache/vault';

const QUEUE_KEY = 'activity.queue';
const MAX_QUEUE = 1000;
const MIN_SECONDS = 5; // shorter stretches are taps, not use
const CHECKPOINT_MS = 5 * 60 * 1000; // long stretches are saved every 5 minutes so a crash loses little

let queue = [];
let loaded = false;
let flushing = false;
let saveTimer = null;

async function load() {
  if (loaded || !vault.isReady()) return;
  loaded = true;
  const saved = await vault.get(QUEUE_KEY).catch(() => null);
  if (Array.isArray(saved?.value)) queue = [...saved.value, ...queue].slice(-MAX_QUEUE);
}

function persistSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (vault.isReady()) vault.set(QUEUE_KEY, queue).catch(() => {});
  }, 1000);
}

export function track(event) {
  if (!event.durationSec || event.durationSec < MIN_SECONDS) return;
  queue.push({ ...event, durationSec: Math.round(event.durationSec), at: event.at || new Date().toISOString() });
  if (queue.length > MAX_QUEUE) queue = queue.slice(-MAX_QUEUE);
  persistSoon();
}

export async function flushActivity() {
  await load();
  if (flushing || !queue.length) return;
  flushing = true;
  const batch = queue.slice(0, 500);
  try {
    await api('/activity', { method: 'POST', body: { events: batch } });
    queue = queue.slice(batch.length);
    persistSoon();
  } catch {
    // offline: keep them for next time
  } finally {
    flushing = false;
  }
}

// Forget everything (on logout, after the final flush).
export function resetActivity() {
  queue = [];
  loaded = false;
  clearTimeout(saveTimer);
}

// Measures a stretch of time that pauses while the app is in the background.
// onChunk(seconds, startedAtISO) is called for each finished stretch.
function useForegroundTimer(enabled, onChunk) {
  const cb = useRef(onChunk);
  cb.current = onChunk;

  useEffect(() => {
    if (!enabled) return undefined;
    let start = AppState.currentState === 'active' ? Date.now() : null;
    const close = () => {
      if (start == null) return;
      cb.current((Date.now() - start) / 1000, new Date(start).toISOString());
      start = null;
    };
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        if (start == null) start = Date.now();
      } else {
        close();
      }
    });
    const timer = setInterval(() => {
      if (start != null) {
        close();
        start = Date.now();
      }
    }, CHECKPOINT_MS);
    return () => {
      sub.remove();
      clearInterval(timer);
      close();
    };
  }, [enabled]);
}

// Whole-app time; mounted once while signed in. Also sends the queue regularly.
export function useSessionTracking(signedIn) {
  useForegroundTimer(signedIn, (durationSec, at) => {
    track({ type: 'session', durationSec, at });
    flushActivity();
  });
  useEffect(() => {
    if (!signedIn) return undefined;
    flushActivity();
    const t = setInterval(flushActivity, 2 * 60 * 1000);
    return () => clearInterval(t);
  }, [signedIn]);
}

// Time on one section; mounted by the reader.
export function useReadingTracking(bookSlug, sectionKey) {
  useForegroundTimer(Boolean(bookSlug && sectionKey), (durationSec, at) => track({ type: 'read', bookSlug, sectionKey, durationSec, at }));
}
