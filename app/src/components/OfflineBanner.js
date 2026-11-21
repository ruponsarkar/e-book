import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { lease } from '../cache/lease';

// Shown when a screen is displaying its saved copy because the server can't be reached.
export default function OfflineBanner({ style, dark }) {
  const left = lease.daysLeft();
  return (
    <View style={[styles.wrap, dark && styles.dark, style]}>
      <View style={styles.dot} />
      <Text style={[styles.text, dark && { color: '#e6dfd1' }]}>
        Offline · showing your saved copy
        {left ? ` · works offline for ${left} more day${left === 1 ? '' : 's'}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#efe4cc',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  dark: { backgroundColor: '#2b2820' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#c0892f', marginRight: 8 },
  text: { fontSize: 12, color: '#6b5a3a', fontWeight: '600', flexShrink: 1 },
});
