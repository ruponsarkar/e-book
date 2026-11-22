import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api, setSessionEndedHandler, setToken } from '../api';
import { getDeviceInfo } from '../device';
import { lease } from '../cache/lease';
import { vault } from '../cache/vault';
import { flushActivity, resetActivity } from '../activity';

const TOKEN_KEY = 'auth_token';
const CHECK_EVERY_MS = 60 * 1000;
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0); // unread notifications, for the bell badge
  const signedIn = useRef(false);

  // Signing out (or being signed out) also destroys the encrypted book cache and its key.
  const clearLocal = useCallback(async () => {
    signedIn.current = false;
    setToken(null);
    setUser(null);
    setUnread(0);
    resetActivity();
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await vault.wipe();
    await lease.clear();
  }, []);

  // Keeps the cache in step with the account: saved profile for offline starts,
  // the server's offline limit, and no saved copies of books the account lost access to.
  const syncAccount = useCallback(async (me) => {
    await vault.init(me.id);
    lease.setDays(me.offlineDays);
    vault.set('me', me).catch(() => {});
    if (me.role !== 'admin') vault.pruneBooks(me.books || []).catch(() => {});
  }, []);

  // Called by api.js on any 401 while signed in.
  useEffect(() => {
    setSessionEndedHandler(async (err) => {
      if (!signedIn.current) return;
      await clearLocal();
      Alert.alert(
        'Signed out',
        err.code === 'SESSION_REPLACED'
          ? 'Your account was signed in on another phone, so this phone has been signed out. Only one phone can be used at a time.'
          : err.message
      );
    });
  }, [clearLocal]);

  // Restore a saved login on app start, and confirm it is still the active session.
  // Without internet, the saved profile is used while the offline lease lasts.
  useEffect(() => {
    (async () => {
      await lease.load();
      let token = null;
      try {
        token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          setToken(token);
          signedIn.current = true;
          const { user: me, unread: n } = await api('/auth/me');
          await syncAccount(me);
          setUser(me);
          setUnread(n || 0);
        }
      } catch (e) {
        let restored = false;
        if (token && e.code === 'NETWORK' && lease.ok()) {
          const ownerId = await vault.savedOwner();
          if (ownerId) {
            await vault.init(ownerId);
            const saved = await vault.get('me');
            if (saved?.value) {
              setUser(saved.value);
              restored = true;
            }
          }
        }
        if (!restored) {
          // api.js already signed out on a 401; otherwise wait until the phone is online.
          signedIn.current = false;
          setToken(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [syncAccount]);

  // Re-check the session when the app comes back to the foreground and once a minute,
  // so the old phone is signed out soon after a login elsewhere.
  useEffect(() => {
    if (!user) return undefined;
    const check = () =>
      api('/auth/me')
        .then(async ({ user: me, unread: n }) => {
          await syncAccount(me);
          setUser((u) => (JSON.stringify(u) === JSON.stringify(me) ? u : me));
          setUnread(n || 0);
        })
        .catch(() => {});
    const timer = setInterval(check, CHECK_EVERY_MS);
    const sub = AppState.addEventListener('change', (state) => state === 'active' && check());
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [user, syncAccount]);

  const login = useCallback(
    async (email, password) => {
      const device = await getDeviceInfo();
      const data = await api('/auth/login', { method: 'POST', body: { email, password, ...device } });
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      setToken(data.token);
      signedIn.current = true;
      lease.touch();
      await syncAccount(data.user); // a different account's cache is wiped here
      setUser(data.user);
      api('/auth/me')
        .then((d) => setUnread(d.unread || 0))
        .catch(() => {});
      if (data.replacedOtherDevice) {
        Alert.alert('Signed in', 'Your account has been signed out on your other phone.');
      }
    },
    [syncAccount]
  );

  const logout = useCallback(async () => {
    await flushActivity(); // send the last recorded time before the queue is wiped
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Sign out locally even if the server can't be reached.
    }
    await clearLocal();
  }, [clearLocal]);

  // Fetches the account again now (used by "Sync latest" on the profile).
  const refreshAccount = useCallback(async () => {
    const { user: me, unread: n } = await api('/auth/me');
    await syncAccount(me);
    setUser((u) => (JSON.stringify(u) === JSON.stringify(me) ? u : me));
    setUnread(n || 0);
    return me;
  }, [syncAccount]);

  // Local update after the profile is edited (e.g. a new name).
  const updateUser = useCallback((patch) => setUser((u) => (u ? { ...u, ...patch } : u)), []);

  return <AuthContext.Provider value={{ user, loading, login, logout, updateUser, refreshAccount, unread, setUnread }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
