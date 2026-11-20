import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// A faint, repeated label with the reader's email over every page.
// If someone photographs the screen with another phone, the photo shows whose account it was.
export default function Watermark({ label }) {
  const rows = Array.from({ length: 14 });
  return (
    <View style={styles.layer} pointerEvents="none">
      {rows.map((_, i) => (
        <Text key={i} style={[styles.text, { marginLeft: i % 2 ? 40 : -40 }]} numberOfLines={1}>
          {label}   {label}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-around', overflow: 'hidden' },
  text: { fontSize: 14, color: 'rgba(0,0,0,0.07)', transform: [{ rotate: '-25deg' }] },
});
