import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FAMILIES, FONT_SIZES, THEMES } from './theme';

export default function ReaderSettings({ visible, onClose, prefs, update }) {
  const t = THEMES[prefs.theme];
  const insets = useSafeAreaInsets();
  const idx = FONT_SIZES.indexOf(prefs.size);
  const step = (d) => {
    const i = Math.min(FONT_SIZES.length - 1, Math.max(0, (idx === -1 ? 3 : idx) + d));
    update({ size: FONT_SIZES[i] });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: t.surface, paddingBottom: 24 + insets.bottom }]}>
        <View style={[styles.grabber, { backgroundColor: t.border }]} />

        <Text style={[styles.label, { color: t.muted }]}>THEME</Text>
        <View style={styles.row}>
          {Object.entries(THEMES).map(([key, th]) => {
            const on = prefs.theme === key;
            return (
              <Pressable key={key} onPress={() => update({ theme: key })} style={styles.themeItem}>
                <View
                  style={[
                    styles.swatch,
                    { backgroundColor: th.bg, borderColor: on ? t.accent : t.border, borderWidth: on ? 2.5 : 1 },
                  ]}
                >
                  <Text style={{ color: th.text, fontFamily: FAMILIES.serif, fontSize: 18 }}>Aa</Text>
                </View>
                <Text style={[styles.themeName, { color: on ? t.accent : t.muted }]}>{th.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: t.muted }]}>TEXT SIZE</Text>
        <View style={[styles.stepper, { borderColor: t.border }]}>
          <Pressable onPress={() => step(-1)} style={styles.stepBtn} hitSlop={6}>
            <Text style={{ color: t.text, fontSize: 15, fontFamily: FAMILIES.serif }}>A</Text>
          </Pressable>
          <View style={styles.dots}>
            {FONT_SIZES.map((s, i) => (
              <View key={s} style={[styles.dot, { backgroundColor: i <= idx ? t.accent : t.border }]} />
            ))}
          </View>
          <Pressable onPress={() => step(1)} style={styles.stepBtn} hitSlop={6}>
            <Text style={{ color: t.text, fontSize: 24, fontFamily: FAMILIES.serif }}>A</Text>
          </Pressable>
        </View>

        <Text style={[styles.label, { color: t.muted }]}>FONT</Text>
        <View style={[styles.segment, { borderColor: t.border }]}>
          {[
            ['serif', 'Book serif'],
            ['sans', 'Modern sans'],
          ].map(([key, name]) => {
            const on = prefs.family === key;
            return (
              <Pressable
                key={key}
                onPress={() => update({ family: key })}
                style={[styles.segItem, on && { backgroundColor: t.accentSoft }]}
              >
                <Text style={{ color: on ? t.accent : t.text, fontFamily: FAMILIES[key], fontSize: 15, fontWeight: on ? '700' : '400' }}>
                  {name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 20, paddingTop: 10 },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: 8 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginTop: 18, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  themeItem: { alignItems: 'center', flex: 1 },
  swatch: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  themeName: { marginTop: 6, fontSize: 12, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 8, height: 52 },
  stepBtn: { width: 44, alignItems: 'center', justifyContent: 'center' },
  dots: { flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4 },
  segment: { flexDirection: 'row', borderWidth: 1, borderRadius: 14, overflow: 'hidden', height: 48 },
  segItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
