import { useCallback, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { SERIF } from '../components/BookCover';

export const THEMES = {
  paper: {
    name: 'Paper',
    dark: false,
    bg: '#fffdf8',
    surface: '#ffffff',
    text: '#2a2418',
    muted: '#7a6c55',
    accent: '#a8823a',
    accentSoft: '#f5ecd8',
    border: '#ebe1cc',
    correct: '#2f7d4f',
    correctBg: '#e7f3ea',
    wrong: '#b3402f',
    wrongBg: '#f9e6e2',
    watermark: 'rgba(0,0,0,0.06)',
  },
  sepia: {
    name: 'Sepia',
    dark: false,
    bg: '#f4ecd8',
    surface: '#fbf5e7',
    text: '#43341f',
    muted: '#80694a',
    accent: '#94722f',
    accentSoft: '#ebdcbb',
    border: '#e0cfaa',
    correct: '#2f7341',
    correctBg: '#e2edd6',
    wrong: '#a63e2c',
    wrongBg: '#f3dcd1',
    watermark: 'rgba(60,40,0,0.07)',
  },
  night: {
    name: 'Night',
    dark: true,
    bg: '#15171b',
    surface: '#1e2126',
    text: '#e6dfd1',
    muted: '#9b9383',
    accent: '#d4b36a',
    accentSoft: '#2b2820',
    border: '#2f3239',
    correct: '#72c48f',
    correctBg: '#1c3326',
    wrong: '#ec8e7c',
    wrongBg: '#3b2421',
    watermark: 'rgba(255,255,255,0.05)',
  },
};

export const FONT_SIZES = [14, 15, 16, 17, 18, 20, 22, 24];
export const FAMILIES = { serif: SERIF, sans: undefined };

const DEFAULTS = { theme: 'paper', size: 17, family: 'serif' };
const KEY = 'reader.prefs';

// Reading preferences only (no book content), remembered between sessions.
export function useReaderPrefs() {
  const [prefs, setPrefs] = useState(DEFAULTS);

  useEffect(() => {
    SecureStore.getItemAsync(KEY)
      .then((raw) => raw && setPrefs({ ...DEFAULTS, ...JSON.parse(raw) }))
      .catch(() => {});
  }, []);

  const update = useCallback((patch) => {
    setPrefs((p) => {
      const next = { ...p, ...patch };
      SecureStore.setItemAsync(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return [prefs, update];
}
