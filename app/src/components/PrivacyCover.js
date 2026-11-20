import React, { useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';

// Covers the screen whenever the app is not in the foreground, so the iOS app switcher
// snapshot shows this cover instead of a book page.
export default function PrivacyCover() {
  const [hidden, setHidden] = useState(AppState.currentState !== 'active');

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => setHidden(state !== 'active'));
    return () => sub.remove();
  }, []);

  if (!hidden) return null;
  return (
    <View style={styles.cover} pointerEvents="none">
      <Text style={styles.text}>Exam Books</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { ...StyleSheet.absoluteFillObject, backgroundColor: '#1f3a5f', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 22, fontWeight: '600' },
});
