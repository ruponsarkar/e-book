import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';

export const SERIF = Platform.select({ ios: 'Georgia', android: 'serif' });
export const GOLD = '#d4b36a';
export const PAPER = '#f6f1e7';
const CREAM = '#f3e9d2';
const IMPRINT = Constants.expoConfig?.name ?? '';
const ASPECT = 1.48;
const BASE_WIDTH = 260; // sizes below are tuned for this width and scale from it

// Deep bookcloth colours; each book always gets the same one.
const CLOTH = ['#1f3a5f', '#6b1f2a', '#1f4d3a', '#43284f', '#3b3024'];
function clothFor(slug = '') {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return CLOTH[h % CLOTH.length];
}

// "Assam General Knowledge — Complete Guide" → main title + tagline.
function splitTitle(title = '') {
  const m = title.match(/^(.*?)\s+[—–]\s+(.*)$/);
  return m ? { main: m[1], tagline: m[2] } : { main: title, tagline: '' };
}

// Outer width including the page edges that peek out on the right.
export function coverOuterWidth(width) {
  return width + Math.max(3, Math.round(6 * (width / BASE_WIDTH)));
}

export default function BookCover({ book, width }) {
  const s = width / BASE_WIDTH;
  const px = (n) => Math.max(1, Math.round(n * s));
  const height = width * ASPECT;
  const compact = width < 200;
  const { main, tagline } = splitTitle(book.title);
  const cloth = clothFor(book.slug);
  const pageOffset = coverOuterWidth(width) - width;

  return (
    <View style={{ width: width + pageOffset, height }}>
      <View style={[styles.pages, { top: px(4), width: px(24), height: height - px(8) }]}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.pageLine} />
        ))}
      </View>

      <View
        style={[
          styles.cover,
          { width, height, backgroundColor: cloth, elevation: compact ? 5 : 10, shadowRadius: compact ? 6 : 12 },
        ]}
      >
        <View style={[styles.spine, { width: px(14) }]} />
        <View style={[styles.hingeLight, { left: px(14) }]} />
        <View style={[styles.hingeDark, { left: px(17), width: px(2) }]} />

        <View
          style={[
            styles.frameOuter,
            { marginLeft: px(28), marginRight: px(12), marginVertical: px(12), padding: px(3), borderWidth: compact ? 1 : 1.5 },
          ]}
        >
          <View style={[styles.frameInner, { paddingHorizontal: px(12), paddingVertical: px(14) }]}>
            <View style={styles.coverTop}>
              <Ornament size={px(10)} gap={px(6)} />
              <Text
                style={[styles.title, { fontSize: width * 0.105, marginVertical: px(10) }]}
                numberOfLines={compact ? 5 : 4}
                adjustsFontSizeToFit
              >
                {main}
              </Text>
              {tagline ? (
                <Text style={[styles.tagline, { fontSize: Math.max(9, 13 * s), marginBottom: px(10) }]} numberOfLines={2}>
                  {tagline}
                </Text>
              ) : null}
              <Ornament size={px(10)} gap={px(6)} />
            </View>

            {book.subtitle && !compact ? (
              <Text style={styles.subtitle} numberOfLines={4}>
                {book.subtitle}
              </Text>
            ) : null}

            <View style={styles.coverBottom}>
              {book.edition && !compact ? <Text style={styles.edition}>{book.edition}</Text> : null}
              {IMPRINT ? (
                <Text style={[styles.imprint, { fontSize: Math.max(7, 9 * s), letterSpacing: 3 * s }]} numberOfLines={1}>
                  {IMPRINT.toUpperCase()}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function Ornament({ size, gap }) {
  return (
    <View style={styles.ornament}>
      <View style={styles.ornamentRule} />
      <Text style={[styles.ornamentMark, { fontSize: size, marginHorizontal: gap }]}>✦</Text>
      <View style={styles.ornamentRule} />
    </View>
  );
}

const styles = StyleSheet.create({
  pages: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#fbf8f1',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d9d0bd',
    justifyContent: 'space-evenly',
    paddingVertical: 2,
  },
  pageLine: { height: StyleSheet.hairlineWidth, backgroundColor: '#e2d9c6' },
  cover: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 4, height: 8 },
  },
  spine: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.28)' },
  hingeLight: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.18)' },
  hingeDark: { position: 'absolute', top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.18)' },

  frameOuter: { flex: 1, borderColor: GOLD },
  frameInner: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: GOLD,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverTop: { alignItems: 'center', alignSelf: 'stretch' },
  title: { fontFamily: SERIF, fontWeight: '700', color: GOLD, textAlign: 'center' },
  tagline: { fontFamily: SERIF, fontStyle: 'italic', color: CREAM, textAlign: 'center' },
  subtitle: { fontFamily: SERIF, fontSize: 11, lineHeight: 16, color: CREAM, opacity: 0.85, textAlign: 'center' },
  coverBottom: { alignItems: 'center' },
  edition: { fontFamily: SERIF, fontStyle: 'italic', fontSize: 10, color: CREAM, opacity: 0.75, marginBottom: 6 },
  imprint: { color: GOLD, fontWeight: '600' },

  ornament: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  ornamentRule: { flex: 1, height: 1, backgroundColor: GOLD, opacity: 0.7 },
  ornamentMark: { color: GOLD },
});
