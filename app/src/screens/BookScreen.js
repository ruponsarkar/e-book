import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api';
import BookCover, { GOLD, PAPER, SERIF } from '../components/BookCover';
import { splitBilingual } from '../reader/parse';
import { prefetch, useCached } from '../cache/useCached';
import { vault } from '../cache/vault';
import { lease } from '../cache/lease';
import OfflineBanner from '../components/OfflineBanner';

const sectionPath = (slug, key) => `/books/${slug}/sections/${key}`;

const INK = '#2a2418';
const MUTED = '#8a7a5c';
const LINE = '#e6dcc8';
const CARD = '#fffdf8';
const DEEP_GOLD = '#8a6a24';
const GREEN = '#2f7d4f';
const RED = '#b3402f';

// "Chapter 3 — Number Series / অধ্যায় ৩ — সংখ্যা শৃংখলা"
//   → { num: 3, label: 'Chapter 3', en: 'Number Series', as: 'সংখ্যা শৃংখলা', asLabel: 'অধ্যায় ৩' }
function describe(section) {
  const { en, as } = splitBilingual(section.title);
  const dash = (s) => s.match(/^(.*?)\s+[—–]\s+(.*)$/);
  const e = dash(en);
  const a = as ? dash(as) : null;
  const label = e ? e[1] : en;
  const n = label.match(/\d+/);
  return {
    num: n ? Number(n[0]) : null,
    label,
    en: e ? e[2] : en,
    as: a ? a[2] : as,
    asLabel: a ? a[1] : as,
  };
}

const pad = (n) => String(n).padStart(2, '0');

export default function BookScreen({ route, navigation }) {
  const { slug } = route.params;
  const { width } = useWindowDimensions();
  const { data, error: loadError, offline } = useCached(`/books/${slug}`, { book: slug });
  const error = loadError?.message || '';
  const [tests, setTests] = useState({});
  const [lastKey, setLastKey] = useState(null);
  const [tab, setTab] = useState('chapters');

  // Scores and last-read position change while the student is in the reader; refresh on return.
  useFocusEffect(
    useCallback(() => {
      const path = `/progress/books/${slug}`;
      vault.get(path).then((saved) => saved && setTests(saved.value.tests || {}));
      api(path)
        .then((d) => {
          setTests(d.tests || {});
          vault.set(path, d, { book: slug }).catch(() => {});
        })
        .catch(() => {});
      SecureStore.getItemAsync(`lastRead.${slug}`)
        .then(setLastKey)
        .catch(() => {});
    }, [slug])
  );

  const parts = useMemo(() => {
    if (!data) return null;
    const pick = (kind) => data.sections.filter((s) => s.kind === kind).map((s) => ({ ...s, d: describe(s) }));
    const front = pick('front');
    const chapters = pick('chapter');
    const papers = pick('test');
    // Same order as shown, for the reader's Previous / Next links.
    const order = [...front, ...chapters, ...papers].map(({ key, title, v }) => ({ key, title, v }));
    return { front, chapters, papers, order };
  }, [data]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: RED, textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }
  if (!parts) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={GOLD} />
      </View>
    );
  }

  const { front, chapters, papers, order } = parts;
  const open = (s) => navigation.navigate('Reader', { slug, key: s.key, title: s.title, v: s.v, sections: order });
  const all = [...front, ...chapters, ...papers];
  const last = all.find((s) => s.key === lastKey);
  const startAt = last || chapters[0] || all[0];
  const doneTests = papers.filter((p) => tests[p.key]?.best != null).length;
  const coverW = Math.min(width * 0.36, 150);
  const { book } = data;
  const [mainTitle, tagline] = book.title.split(/\s+[—–]\s+/);

  return (
    <ScrollView style={{ backgroundColor: PAPER }} contentContainerStyle={styles.content}>
      {offline ? <OfflineBanner /> : null}
      {/* ---- Hero ---- */}
      <View style={styles.hero}>
        <BookCover book={book} width={coverW} />
        <View style={styles.heroText}>
          <Text style={styles.title}>{mainTitle}</Text>
          {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
          {book.edition ? <Text style={styles.edition}>{book.edition}</Text> : null}
          <View style={styles.facts}>
            <Fact value={chapters.length} label="chapters" />
            {papers.length ? <Fact value={`${doneTests}/${papers.length}`} label="tests done" /> : null}
          </View>
        </View>
      </View>
      {book.subtitle ? <Text style={styles.subtitle}>{book.subtitle}</Text> : null}

      <DownloadBar slug={slug} sections={all} />

      {/* ---- Continue ---- */}
      {startAt ? (
        <Pressable onPress={() => open(startAt)} style={({ pressed }) => [styles.continue, pressed && { opacity: 0.9 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.continueLabel}>{last ? 'CONTINUE READING' : 'START READING'}</Text>
            <Text style={styles.continueTitle} numberOfLines={1}>
              {startAt.kind === 'front' ? 'About this book' : startAt.d.label}
            </Text>
            {startAt.kind !== 'front' && startAt.d.en !== startAt.d.label ? (
              <Text style={styles.continueSub} numberOfLines={1}>
                {startAt.d.en}
              </Text>
            ) : null}
          </View>
          <View style={styles.playBtn}>
            <Text style={styles.playIcon}>›</Text>
          </View>
        </Pressable>
      ) : null}

      {/* ---- Tabs ---- */}
      {papers.length ? (
        <View style={styles.tabs}>
          {[
            ['chapters', `Chapters  ${chapters.length}`],
            ['tests', `Test papers  ${papers.length}`],
          ].map(([k, label]) => (
            <Pressable key={k} onPress={() => setTab(k)} style={[styles.tab, tab === k && styles.tabOn]}>
              <Text style={[styles.tabText, tab === k && styles.tabTextOn]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={styles.contentsHeading}>Contents</Text>
      )}

      {tab === 'chapters' || !papers.length ? (
        <View style={styles.list}>
          {front.map((s) => (
            <Pressable key={s.key} onPress={() => open(s)} style={({ pressed }) => [styles.frontRow, pressed && styles.pressed]}>
              <Text style={styles.frontIcon}>❦</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.frontTitle}>About this book</Text>
                <Text style={styles.frontSub}>Introduction, syllabus and how to use it</Text>
              </View>
              {s.key === lastKey ? <LastRead /> : null}
              <Text style={styles.chev}>›</Text>
            </Pressable>
          ))}
          {chapters.map((s, i) => (
            <Pressable
              key={s.key}
              onPress={() => open(s)}
              style={({ pressed }) => [styles.chapter, (i > 0 || front.length > 0) && styles.divider, pressed && styles.pressed]}
            >
              <Text style={styles.num}>{s.d.num != null ? pad(s.d.num) : '•'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.chTitle}>{s.d.en}</Text>
                {s.d.as ? <Text style={styles.chAs}>{s.d.as}</Text> : null}
                {s.key === lastKey ? <LastRead inline /> : null}
              </View>
              <Text style={styles.chev}>›</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <>
          <Text style={styles.testsIntro}>
            Practice papers with an answer key. Your answers save as you go; scores appear on your profile.
          </Text>
          <View style={styles.grid}>
            {papers.map((s) => (
              <TestTile key={s.key} s={s} status={tests[s.key]} width={(width - 32 - 12) / 2} onPress={() => open(s)} />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

// "Download for offline": saves every section of the book, encrypted, skipping ones already current.
function DownloadBar({ slug, sections }) {
  const count = () => sections.filter((s) => vault.has(sectionPath(slug, s.key), s.v)).length;
  const [saved, setSaved] = useState(count);
  const [running, setRunning] = useState(false);
  const cancelled = useRef(false);
  const total = sections.length;

  useEffect(() => {
    setSaved(count());
    return () => {
      cancelled.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, total]);

  const download = async () => {
    setRunning(true);
    cancelled.current = false;
    try {
      for (const s of sections) {
        if (cancelled.current) break;
        await prefetch(sectionPath(slug, s.key), { book: slug, v: s.v });
        setSaved(count());
      }
    } catch (e) {
      Alert.alert('Download stopped', `${e.message}\n\nWhat was saved so far stays on the phone.`);
    } finally {
      setRunning(false);
      setSaved(count());
    }
  };

  const remove = () =>
    Alert.alert('Remove download?', 'Chapters will load from the internet again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          for (const s of sections) await vault.remove(sectionPath(slug, s.key));
          setSaved(count());
        },
      },
    ]);

  const done = total > 0 && saved === total;
  if (lease.days() === 0) return null; // the publisher has turned offline reading off
  return (
    <View style={styles.dl}>
      <View style={{ flex: 1 }}>
        <Text style={styles.dlTitle}>{done ? '✓ Available offline' : running ? 'Downloading…' : 'Read without internet'}</Text>
        <Text style={styles.dlSub}>
          {done ? 'Saved on this phone, encrypted' : `${saved} of ${total} sections saved`}
        </Text>
        {!done ? (
          <View style={styles.dlTrack}>
            <View style={[styles.dlFill, { width: `${total ? (saved / total) * 100 : 0}%` }]} />
          </View>
        ) : null}
      </View>
      {done ? (
        <Pressable onPress={remove} hitSlop={8} style={styles.dlGhost}>
          <Text style={styles.dlGhostText}>Remove</Text>
        </Pressable>
      ) : (
        <Pressable onPress={download} disabled={running} style={[styles.dlBtn, running && { opacity: 0.6 }]}>
          {running ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.dlBtnText}>Download</Text>}
        </Pressable>
      )}
    </View>
  );
}

function Fact({ value, label }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factValue}>{value}</Text>
      <Text style={styles.factLabel}>{label}</Text>
    </View>
  );
}

function LastRead({ inline }) {
  return (
    <View style={[styles.lastRead, inline && { alignSelf: 'flex-start', marginTop: 6, marginLeft: 0 }]}>
      <View style={styles.lastDot} />
      <Text style={styles.lastText}>LAST READ</Text>
    </View>
  );
}

function TestTile({ s, status, width, onPress }) {
  let state = { label: 'Not started', color: MUTED, fill: 0 };
  if (status?.inProgress) state = { label: `In progress · ${status.answered}`, color: DEEP_GOLD, fill: null };
  else if (status?.best != null) {
    const c = status.best >= 75 ? GREEN : status.best >= 50 ? DEEP_GOLD : RED;
    state = { label: `Best ${status.best}%`, color: c, fill: status.best };
  }
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tile, { width }, pressed && styles.pressed]}>
      <Text style={styles.tileLabel}>TEST PAPER</Text>
      <Text style={styles.tileNum}>{s.d.num ?? '—'}</Text>
      {s.d.asLabel ? (
        <Text style={styles.tileAs} numberOfLines={1}>
          {s.d.asLabel}
        </Text>
      ) : null}
      <View style={styles.tileTrack}>
        <View
          style={[
            styles.tileFill,
            { backgroundColor: state.color, width: state.fill == null ? '50%' : `${state.fill}%`, opacity: state.fill == null ? 0.5 : 1 },
          ]}
        />
      </View>
      <Text style={[styles.tileState, { color: state.color }]}>{state.label}</Text>
      {status?.attempts > 1 ? <Text style={styles.tileMeta}>{status.attempts} attempts</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: PAPER },
  content: { padding: 16, paddingBottom: 48 },

  hero: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  heroText: { flex: 1, marginLeft: 18 },
  title: { fontFamily: SERIF, fontSize: 22, lineHeight: 28, fontWeight: '700', color: INK },
  tagline: { fontFamily: SERIF, fontStyle: 'italic', fontSize: 14, color: MUTED, marginTop: 4 },
  edition: { fontSize: 12, color: MUTED, marginTop: 8 },
  facts: { flexDirection: 'row', marginTop: 14 },
  fact: { marginRight: 20 },
  factValue: { fontFamily: SERIF, fontSize: 20, fontWeight: '700', color: DEEP_GOLD },
  factLabel: { fontSize: 11, color: MUTED, letterSpacing: 0.5 },
  subtitle: { fontFamily: SERIF, fontSize: 13, lineHeight: 19, color: MUTED, marginTop: 16 },

  continue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f3a5f',
    borderRadius: 18,
    padding: 16,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  continueLabel: { color: GOLD, fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
  continueTitle: { color: '#fff', fontFamily: SERIF, fontSize: 18, fontWeight: '700', marginTop: 4 },
  continueSub: { color: '#c9d3e0', fontSize: 13, marginTop: 2 },
  playBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  playIcon: { color: '#1f3a5f', fontSize: 28, fontWeight: '700', marginTop: -3, marginLeft: 2 },

  tabs: { flexDirection: 'row', backgroundColor: '#ece3d0', borderRadius: 14, padding: 4, marginTop: 24, marginBottom: 14 },
  tab: { flex: 1, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: CARD, elevation: 1, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  tabText: { color: MUTED, fontWeight: '700', fontSize: 14 },
  tabTextOn: { color: INK },
  contentsHeading: { fontFamily: SERIF, fontSize: 22, color: INK, marginTop: 26, marginBottom: 12 },

  list: { backgroundColor: CARD, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: LINE, overflow: 'hidden' },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: LINE },
  pressed: { backgroundColor: '#f1e8d6' },
  chev: { fontSize: 22, color: '#c2b28c', marginLeft: 10 },

  frontRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#f8f1e1' },
  frontIcon: { fontSize: 22, color: GOLD, width: 44 },
  frontTitle: { fontFamily: SERIF, fontSize: 16, fontWeight: '700', color: INK },
  frontSub: { fontSize: 12, color: MUTED, marginTop: 2 },

  chapter: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  num: { fontFamily: SERIF, fontSize: 24, fontWeight: '700', color: GOLD, width: 44, fontVariant: ['tabular-nums'] },
  chTitle: { fontFamily: SERIF, fontSize: 16, lineHeight: 22, color: INK },
  chAs: { fontSize: 13, lineHeight: 19, color: MUTED, marginTop: 2 },

  lastRead: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  lastDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GOLD, marginRight: 5 },
  lastText: { fontSize: 9, fontWeight: '800', letterSpacing: 1, color: DEEP_GOLD },

  dl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: LINE,
    padding: 14,
    marginTop: 18,
  },
  dlTitle: { fontWeight: '800', color: INK, fontSize: 14 },
  dlSub: { color: MUTED, fontSize: 12, marginTop: 2 },
  dlTrack: { height: 4, borderRadius: 2, backgroundColor: LINE, marginTop: 8, marginRight: 12, overflow: 'hidden' },
  dlFill: { height: 4, borderRadius: 2, backgroundColor: GOLD },
  dlBtn: { backgroundColor: '#1f3a5f', borderRadius: 999, paddingHorizontal: 16, height: 36, justifyContent: 'center', minWidth: 96, alignItems: 'center' },
  dlBtnText: { color: '#fff', fontWeight: '800' },
  dlGhost: { borderWidth: 1, borderColor: LINE, borderRadius: 999, paddingHorizontal: 14, height: 34, justifyContent: 'center' },
  dlGhostText: { color: MUTED, fontWeight: '700' },
  testsIntro: { color: MUTED, fontSize: 13, lineHeight: 19, marginBottom: 12, marginHorizontal: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { backgroundColor: CARD, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: LINE, padding: 14 },
  tileLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, color: MUTED },
  tileNum: { fontFamily: SERIF, fontSize: 38, fontWeight: '700', color: INK, marginTop: 2 },
  tileAs: { fontSize: 12, color: MUTED },
  tileTrack: { height: 4, borderRadius: 2, backgroundColor: LINE, marginTop: 12, overflow: 'hidden' },
  tileFill: { height: 4, borderRadius: 2 },
  tileState: { fontSize: 12, fontWeight: '800', marginTop: 8 },
  tileMeta: { fontSize: 11, color: MUTED, marginTop: 2 },
});
