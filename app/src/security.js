import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';
import { api } from './api';

// Android: sets FLAG_SECURE, so screenshots and screen recordings come out black
// and the app is blank in the recent-apps view.
// iOS: newer versions of expo-screen-capture hide content from screenshots and recordings;
// on older ones iOS can only *detect* a screenshot, which we report below.
export function useScreenProtection() {
  useEffect(() => {
    ScreenCapture.preventScreenCaptureAsync('app').catch(() => {});
    return () => {
      ScreenCapture.allowScreenCaptureAsync('app').catch(() => {});
    };
  }, []);
}

// Reports screenshots taken while a section is open, so the publisher can see misuse.
export function useScreenshotReporter(bookSlug, sectionKey) {
  useEffect(() => {
    const sub = ScreenCapture.addScreenshotListener(() => {
      api(`/books/${bookSlug}/screenshot-events`, {
        method: 'POST',
        body: { sectionKey, platform: Platform.OS },
      }).catch(() => {});
    });
    return () => sub.remove();
  }, [bookSlug, sectionKey]);
}
