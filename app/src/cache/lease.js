// "Offline lease": saved books may be opened without internet only for a limited time
// after the server last confirmed this account (OFFLINE_DAYS on the server, default 7).
import * as SecureStore from 'expo-secure-store';

const NAME = 'vault.lease';
const SS = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
const DAY = 24 * 60 * 60 * 1000;

let state = { verifiedAt: 0, days: 7 };
let lastWrite = 0;

function persist(force) {
  const now = Date.now();
  if (!force && now - lastWrite < 60 * 1000) return; // at most once a minute
  lastWrite = now;
  SecureStore.setItemAsync(NAME, JSON.stringify(state), SS).catch(() => {});
}

export const lease = {
  async load() {
    try {
      const raw = await SecureStore.getItemAsync(NAME, SS);
      if (raw) state = { ...state, ...JSON.parse(raw) };
    } catch {
      // keep defaults
    }
  },

  // Any successful signed-in request proves the account is still active.
  touch() {
    state.verifiedAt = Date.now();
    persist(false);
  },

  setDays(days) {
    if (typeof days === 'number' && days >= 0 && days !== state.days) {
      state.days = days;
      persist(true);
    }
  },

  // Can saved content be shown right now?
  ok() {
    const now = Date.now();
    if (!state.verifiedAt) return false;
    if (now < state.verifiedAt - 10 * 60 * 1000) return false; // clock was moved back
    return now - state.verifiedAt <= state.days * DAY;
  },

  daysLeft() {
    return Math.max(0, Math.ceil((state.verifiedAt + state.days * DAY - Date.now()) / DAY));
  },

  days: () => state.days,

  async clear() {
    state = { verifiedAt: 0, days: state.days };
    lastWrite = 0;
    await SecureStore.deleteItemAsync(NAME, SS).catch(() => {});
  },
};
