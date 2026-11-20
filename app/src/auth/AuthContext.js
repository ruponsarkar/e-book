import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api, setSessionEndedHandler, setToken } from '../api';
import { getDeviceInfo } from '../device';

const TOKEN_KEY = 'auth_token';
const CHECK_EVERY_MS = 60 * 1000;
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const signedIn = useRef(false);

  const clearLocal = useCallback(async () => {
    signedIn.current = false;
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
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
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          setToken(token);
          signedIn.current = true;
          const { user: me } = await api('/auth/me');
          setUser(me);
        }
      } catch {
        // api.js already signed out on 401; on a network error keep the user out until online.
        signedIn.current = false;
        setToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Re-check the session when the app comes back to the foreground and once a minute,
  // so the old phone is signed out soon after a login elsewhere.
  useEffect(() => {
    if (!user) return undefined;
    const check = () => api('/auth/me').catch(() => {});
    const timer = setInterval(check, CHECK_EVERY_MS);
    const sub = AppState.addEventListener('change', (state) => state === 'active' && check());
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [user]);

  const login = useCallback(async (email, password) => {
    const device = await getDeviceInfo();
    const data = await api('/auth/login', { method: 'POST', body: { email, password, ...device } });
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    setToken(data.token);
    signedIn.current = true;
    setUser(data.user);
    if (data.replacedOtherDevice) {
      Alert.alert('Signed in', 'Your account has been signed out on your other phone.');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Sign out locally even if the server can't be reached.
    }
    await clearLocal();
  }, [clearLocal]);

  // Local update after the profile is edited (e.g. a new name).
  const updateUser = useCallback((patch) => setUser((u) => (u ? { ...u, ...patch } : u)), []);

  return <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
