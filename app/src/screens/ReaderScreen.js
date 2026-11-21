import React, { memo, useCallback, useLayoutEffect, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api';
import { prefetch, useCached } from '../cache/useCached';
import { vault } from '../cache/vault';
import OfflineBanner from '../components/OfflineBanner';
import { useAuth } from '../auth/AuthContext';
import { useScreenshotReporter } from '../security';
import Watermark from '../components/Watermark';
import { parseSection } from '../reader/parse';
import { isMostlyBengali } from '../reader/Inline';
import QuestionCard from '../reader/QuestionCard';
import ReaderSettings from '../reader/ReaderSettings';
import { FAMILIES, THEMES, useReaderPrefs } from '../reader/theme';

// Book pages are fetched live and kept only in memory: nothing is written to the phone.
export default function ReaderScreen({ route, navigation }) {
  const { slug, key, title: routeTitle, v: version = null, sections = [] } = route.params;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [prefs, updatePrefs] = useReaderPrefs();
  const sectionPath = `/books/${slug}/sections/${key}`;
  // Encrypted saved copy first; no download at all when it matches the contents list's version.
  const { data: sectionData, error: loadError, offline } = useCached(sectionPath, {
    book: slug,
    version,
    versionOf: (d) => d?.section?.v ?? null,
  });
  const section = sectionData?.section || null;
  const error = loadError?.message || '';
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [picks, setPicks] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const scrollRef = useRef(null);

  const t = THEMES[prefs.theme] || THEMES.paper;
  const font = FAMILIES[prefs.family];
  const size = prefs.size;

  useScreenshotReporter(slug, key);

  // Remembers which section was open (just its key, never its text) for "Continue reading".
  useEffect(() => {
    SecureStore.setItemAsync(`lastRead.${slug}`, key).catch(() => {});
  }, [slug, key]);


  const parsed = useMemo(() => (section ? parseSection(section.markdown) : null), [section]);
  const opener = parsed?.blocks.find((b) => b.type === 'opener');
  const questions = useMemo(() => (parsed ? parsed.blocks.filter((b) => b.type === 'question') : []), [parsed]);
  const mode = parsed?.isTest ? 'test' : 'practice';

  useLayoutEffect(() => {
    navigation.setOptions({
      title: opener?.en.label || routeTitle,
      headerStyle: { backgroundColor: t.bg },
      headerTintColor: t.text,
      headerTitleStyle: { fontFamily: FAMILIES.serif },
      headerShadowVisible: false,
      headerRight: () => (
        <Pressable onPress={() => setSettingsOpen(true)} hitSlop={12} style={styles.aaBtn}>
          <Text style={{ color: t.text, fontFamily: FAMILIES.serif, fontSize: 19 }}>
            A<Text style={{ fontSize: 14 }}>a</Text>
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, t, opener, routeTitle]);

  // Reading progress bar (runs on the native thread; no re-render while scrolling).
  const scrollY = useRef(new Animated.Value(0)).current;
  const maxScroll = useRef(new Animated.Value(1)).current;
  const progress = Animated.divide(scrollY, maxScroll).interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const layoutH = useRef(0);
  const contentH = useRef(0);
  const updateMax = () => maxScroll.setValue(Math.max(1, contentH.current - layoutH.current));

  const dirty = useRef(false);
  const onPick = useCallback((num, letter) => {
    dirty.current = true;
    setPicks((p) => ({ ...p, [num]: letter }));
  }, []);

  // ---- Test papers: answers and results live on the server ----
  const [history, setHistory] = useState(null); // { best, attempts: [...] }
  const [result, setResult] = useState(null); // server-graded attempt just submitted
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | failed
  const [busy, setBusy] = useState(false);
  const testPath = `/progress/tests/${slug}/${key}`;

  const draftKey = `draft:${testPath}`;
  const toPicks = (answers) => Object.fromEntries(Object.entries(answers || {}).map(([k, v]) => [Number(k), v]));

  // Restore a sitting in progress and load past scores. Answers are also kept (encrypted) on the
  // phone, so a test can continue offline; the newer of the phone and server copies wins.
  useEffect(() => {
    if (mode !== 'test') return;
    let live = true;
    (async () => {
      const local = (await vault.get(draftKey))?.value || null;
      const cached = (await vault.get(testPath))?.value || null;
      let server = null;
      try {
        server = await api(testPath);
        vault.set(testPath, server, { book: slug }).catch(() => {});
      } catch {
        // offline: fall back to what the phone has
      }
      if (!live) return;
      const info = server || cached;
      if (info) setHistory({ best: info.best, attempts: info.attempts });
      const serverT = server?.draft ? new Date(server.draft.updatedAt).getTime() : 0;
      if (local && local.t > serverT) {
        setPicks((p) => ({ ...toPicks(local.answers), ...p }));
        if (server) {
          dirty.current = true; // phone has newer answers: push them
          setSaveState('saving');
          setTimeout(() => saveDraftRef.current?.(), 0);
        } else setSaveState('local');
      } else if (server?.draft) {
        setPicks((p) => ({ ...toPicks(server.draft.answers), ...p }));
        setSaveState('saved');
      } else if (!server && cached?.draft) {
        setPicks((p) => ({ ...toPicks(cached.draft.answers), ...p }));
        setSaveState('local');
      }
    })();
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, testPath]);

  // Save answers shortly after each change, and right away when leaving the screen.
  const latest = useRef(picks);
  latest.current = picks;
  const saveTimer = useRef(null);
  const saveDraft = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = null;
    dirty.current = false;
    setSaveState('saving');
    const answers = Object.fromEntries(Object.entries(latest.current).filter(([, v]) => v && v !== '?'));
    vault.set(draftKey, { answers, t: Date.now() }, { book: slug }).catch(() => {});
    return api(`${testPath}/draft`, { method: 'PUT', body: { answers } })
      .then(() => setSaveState('saved'))
      .catch(() => {
        dirty.current = true; // retried with the next change or the next visit
        setSaveState('local');
      });
  }, [testPath, draftKey, slug]);
  const saveDraftRef = useRef(null);
  saveDraftRef.current = saveDraft;

  useEffect(() => {
    if (mode !== 'test' || submitted || !dirty.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(saveDraft, 800);
  }, [picks, mode, submitted, saveDraft]);

  useEffect(
    () => () => {
      if (saveTimer.current || dirty.current) saveDraft();
    },
    [saveDraft]
  );

  const md = useMemo(() => markdownStyles(t, size, font), [t, size, font]);
  const rules = useMemo(() => markdownRules(t), [t]);
  const renderTable = useCallback(
    (text) => (
      <MdBlock text={text} md={md} rules={rules} />
    ),
    [md, rules]
  );

  const idx = sections.findIndex((s) => s.key === key);
  const prev = idx > 0 ? sections[idx - 1] : null;
  const next = idx >= 0 && idx < sections.length - 1 ? sections[idx + 1] : null;
  const go = (s) => navigation.replace('Reader', { slug, key: s.key, title: s.title, v: s.v, sections });

  // Quietly save the next section too, so turning the page is instant (and works offline).
  useEffect(() => {
    if (!section || !next) return undefined;
    const t = setTimeout(() => {
      prefetch(`/books/${slug}/sections/${next.key}`, { book: slug, v: next.v }).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [section, next, slug]);

  const answered = questions.filter((q) => picks[q.num] && picks[q.num] !== '?');
  const correct = answered.filter((q) => picks[q.num] === q.answer).length;

  const submit = () => {
    const left = questions.length - answered.length;
    const doIt = async () => {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
      dirty.current = false;
      setBusy(true);
      try {
        const answers = Object.fromEntries(answered.map((q) => [q.num, picks[q.num]]));
        const { attempt } = await api(`${testPath}/submit`, { method: 'POST', body: { answers } });
        setResult(attempt);
        const nextHistory = {
          best: Math.max(history?.best ?? 0, attempt.percent),
          attempts: [attempt, ...(history?.attempts || [])],
        };
        setHistory(nextHistory);
        vault.remove(draftKey).catch(() => {});
        vault.set(testPath, { draft: null, ...nextHistory }, { book: slug }).catch(() => {});
        setSubmitted(true);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      } catch (e) {
        Alert.alert('Could not submit', `${e.message}\n\nYour answers are kept; try again.`);
      } finally {
        setBusy(false);
      }
    };
    if (left > 0) {
      Alert.alert('Submit test?', `${left} question${left > 1 ? 's are' : ' is'} unanswered.`, [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Submit', onPress: doIt },
      ]);
    } else doIt();
  };
  const reset = () => {
    if (mode === 'test') {
      api(`${testPath}/draft`, { method: 'DELETE' }).catch(() => {});
      vault.remove(draftKey).catch(() => {});
    }
    clearTimeout(saveTimer.current);
    saveTimer.current = null;
    dirty.current = false;
    setPicks({});
    setSubmitted(false);
    setResult(null);
    setSaveState('idle');
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: t.bg }]}>
        <Text style={{ color: t.wrong, textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }
  if (!parsed) {
    return (
      <View style={[styles.center, { backgroundColor: t.bg }]}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  const testBar = mode === 'test' && questions.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style={t.dark ? 'light' : 'dark'} />
      <View style={[styles.progressTrack, { backgroundColor: t.border }]}>
        <Animated.View
          style={[styles.progressFill, { backgroundColor: t.accent, transform: [{ scaleX: progress }] }]}
        />
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: (testBar ? 110 : 48) + insets.bottom }}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        onLayout={(e) => {
          layoutH.current = e.nativeEvent.layout.height;
          updateMax();
        }}
        onContentSizeChange={(w, h) => {
          contentH.current = h;
          updateMax();
        }}
      >
        {offline ? <OfflineBanner style={{ marginTop: 14, marginBottom: 0 }} dark={t.dark} /> : null}
        {mode === 'test' && submitted ? (
          <ScoreCard
            t={t}
            font={font}
            correct={result?.correct ?? correct}
            wrong={result?.wrong ?? answered.length - correct}
            total={result?.total ?? questions.length}
            best={history?.best}
            tries={history?.attempts.length}
            onReset={reset}
          />
        ) : null}

        {parsed.blocks.map((b, i) => {
          switch (b.type) {
            case 'opener':
              return <Opener key={i} b={b} t={t} isTest={mode === 'test'} count={questions.length} history={history} />;
            case 'h2':
              return <SectionHeading key={i} b={b} t={t} size={size} />;
            case 'h3':
              return (
                <View key={i} style={{ marginTop: 22, marginBottom: 4 }}>
                  <Text selectable={false} style={{ fontFamily: FAMILIES.serif, fontSize: size + 2, fontWeight: '700', color: t.text }}>
                    {b.en}
                  </Text>
                  {b.as ? <Text selectable={false} style={{ fontSize: size - 2, color: t.muted, marginTop: 2 }}>{b.as}</Text> : null}
                </View>
              );
            case 'callout':
              return (
                <View
                  key={i}
                  style={[
                    styles.callout,
                    b.kind === 'facts'
                      ? { backgroundColor: t.surface, borderColor: t.accent, borderLeftWidth: 4 }
                      : { backgroundColor: t.accentSoft, borderColor: 'transparent' },
                  ]}
                >
                  {b.kind === 'facts' ? <Text style={[styles.calloutLabel, { color: t.accent }]}>★ REMEMBER</Text> : null}
                  <MdBlock text={b.text} md={md} rules={rules} />
                </View>
              );
            case 'question':
              return (
                <QuestionCard
                  key={i}
                  q={b}
                  t={t}
                  size={size}
                  font={font}
                  mode={mode}
                  pick={picks[b.num]}
                  submitted={submitted}
                  onPick={onPick}
                  renderTable={renderTable}
                />
              );
            default:
              return (
                <MdBlock key={i} text={b.text} md={md} rules={rules} />
              );
          }
        })}

        {mode === 'test' && submitted && parsed.answerKey ? (
          <View style={{ marginTop: 16 }}>
            <MdBlock text={parsed.answerKey} md={md} rules={rules} />
          </View>
        ) : null}

        {mode === 'practice' && questions.length > 0 && answered.length > 0 ? (
          <View style={[styles.practice, { backgroundColor: t.surface, borderColor: t.border }]}>
            <Text style={[styles.practiceLabel, { color: t.accent }]}>YOUR PRACTICE</Text>
            <Text style={{ fontFamily: FAMILIES.serif, fontSize: 22, color: t.text, marginTop: 4 }}>
              {correct} of {answered.length} correct
            </Text>
            <Text style={{ color: t.muted, marginTop: 2 }}>
              {questions.length - answered.length} of {questions.length} questions left
            </Text>
            <Pressable onPress={reset} style={[styles.ghostBtn, { borderColor: t.border }]}>
              <Text style={{ color: t.text, fontWeight: '600' }}>Clear my answers</Text>
            </Pressable>
          </View>
        ) : null}

        {prev || next ? (
          <View style={styles.navRow}>
            {prev ? <NavCard t={t} dir="prev" s={prev} onPress={() => go(prev)} /> : <View style={{ flex: 1 }} />}
            <View style={{ width: 12 }} />
            {next ? <NavCard t={t} dir="next" s={next} onPress={() => go(next)} /> : <View style={{ flex: 1 }} />}
          </View>
        ) : null}
      </Animated.ScrollView>

      {testBar ? (
        <View style={[styles.testBar, { backgroundColor: t.surface, borderTopColor: t.border, paddingBottom: 12 + insets.bottom }]}>
          {submitted ? (
            <>
              <Text style={{ flex: 1, color: t.text, fontFamily: FAMILIES.serif, fontSize: 17 }}>
                Score {result?.correct ?? correct}/{result?.total ?? questions.length}
              </Text>
              <Pressable onPress={reset} style={[styles.primaryBtn, { backgroundColor: t.text }]}>
                <Text style={[styles.primaryText, { color: t.bg }]}>Retake</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontWeight: '700' }}>
                  {answered.length} / {questions.length} answered
                  <Text style={{ color: t.muted, fontWeight: '400', fontSize: 12 }}>
                    {saveState === 'saving' ? '  · saving…' : saveState === 'saved' ? '  · saved' : saveState === 'local' ? '  · saved on phone' : ''}
                  </Text>
                </Text>
                <View style={[styles.miniTrack, { backgroundColor: t.border }]}>
                  <View
                    style={[
                      styles.miniFill,
                      { backgroundColor: t.accent, width: `${(answered.length / questions.length) * 100}%` },
                    ]}
                  />
                </View>
              </View>
              <Pressable
                onPress={submit}
                disabled={answered.length === 0 || busy}
                style={[styles.primaryBtn, { backgroundColor: t.accent, opacity: answered.length && !busy ? 1 : 0.4 }]}
              >
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={[styles.primaryText, { color: '#fff' }]}>Submit</Text>}
              </Pressable>
            </>
          )}
        </View>
      ) : null}

      <Watermark label={user.email} color={t.watermark} />
      <ReaderSettings visible={settingsOpen} onClose={() => setSettingsOpen(false)} prefs={prefs} update={updatePrefs} />
    </View>
  );
}

// Re-parsing Markdown is the expensive part of a render; only redo it when the text or look changes.
const MdBlock = memo(function MdBlock({ text, md, rules }) {
  return (
    <Markdown style={md} rules={rules}>
      {text}
    </Markdown>
  );
});

function Opener({ b, t, isTest, count, history }) {
  return (
    <View style={styles.opener}>
      {b.en.label ? <Text style={[styles.openerLabel, { color: t.accent }]}>{b.en.label.toUpperCase()}</Text> : null}
      <View style={styles.openerOrn}>
        <View style={[styles.ornRule, { backgroundColor: t.accent }]} />
        <Text style={{ color: t.accent, marginHorizontal: 10, fontSize: 12 }}>✦</Text>
        <View style={[styles.ornRule, { backgroundColor: t.accent }]} />
      </View>
      <Text selectable={false} style={[styles.openerTitle, { color: t.text }]}>
        {b.en.title}
      </Text>
      {b.as ? (
        <Text selectable={false} style={[styles.openerAs, { color: t.muted }]}>
          {[b.as.label, b.as.title].filter(Boolean).join(' · ')}
        </Text>
      ) : null}
      {isTest ? (
        <View style={[styles.testPill, { borderColor: t.accent }]}>
          <Text style={{ color: t.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>
            TEST MODE · {count} QUESTIONS
          </Text>
        </View>
      ) : null}
      {isTest && history?.attempts.length ? (
        <Text style={{ color: t.muted, marginTop: 10, fontSize: 13 }}>
          Last {history.attempts[0].percent}% · Best {history.best}% · {history.attempts.length} attempt
          {history.attempts.length === 1 ? '' : 's'}
        </Text>
      ) : null}
    </View>
  );
}

function SectionHeading({ b, t, size }) {
  return (
    <View style={[styles.h2, { borderBottomColor: t.border }]}>
      {b.num ? <Text style={[styles.h2Num, { color: t.accent }]}>{b.num}</Text> : null}
      <View style={{ flex: 1 }}>
        <Text selectable={false} style={{ fontFamily: FAMILIES.serif, fontSize: size + 6, fontWeight: '700', color: t.text }}>
          {b.en}
        </Text>
        {b.as ? <Text selectable={false} style={{ fontSize: size - 1, color: t.muted, marginTop: 2 }}>{b.as}</Text> : null}
      </View>
    </View>
  );
}

function ScoreCard({ t, font, correct, wrong, total, best, tries, onReset }) {
  const pct = total ? Math.round((correct / total) * 100) : 0;
  return (
    <View style={[styles.score, { backgroundColor: t.surface, borderColor: t.accent }]}>
      <Text style={[styles.practiceLabel, { color: t.accent }]}>YOUR RESULT</Text>
      <Text style={{ fontFamily: FAMILIES.serif, fontSize: 44, color: t.text, marginTop: 4 }}>{pct}%</Text>
      <Text style={{ color: t.text, fontFamily: font, fontSize: 16 }}>
        {correct} correct · {wrong} wrong · {total - correct - wrong} skipped
      </Text>
      {best != null ? (
        <Text style={{ color: t.muted, marginTop: 6, fontSize: 13 }}>
          Best {best}% · {tries} attempt{tries === 1 ? '' : 's'} · saved to your profile
        </Text>
      ) : null}
      <Text style={{ color: t.muted, marginTop: 6, fontSize: 13 }}>Scroll down to review each answer.</Text>
      <Pressable onPress={onReset} style={[styles.ghostBtn, { borderColor: t.border }]}>
        <Text style={{ color: t.text, fontWeight: '600' }}>Retake test</Text>
      </Pressable>
    </View>
  );
}

function NavCard({ t, dir, s, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.navCard,
        { backgroundColor: pressed ? t.accentSoft : t.surface, borderColor: t.border },
        dir === 'next' && { alignItems: 'flex-end' },
      ]}
    >
      <Text style={[styles.navDir, { color: t.accent }]}>{dir === 'prev' ? '‹  PREVIOUS' : 'NEXT  ›'}</Text>
      <Text
        numberOfLines={2}
        style={{ color: t.text, fontFamily: FAMILIES.serif, fontSize: 14, marginTop: 4, textAlign: dir === 'next' ? 'right' : 'left' }}
      >
        {s.title}
      </Text>
    </Pressable>
  );
}

// Text cannot be long-pressed and copied. Assamese lines are set as the secondary language.
function markdownRules(t) {
  return {
    text: (node, children, parent, styles, inheritedStyles = {}) => (
      <Text
        key={node.key}
        selectable={false}
        style={[inheritedStyles, styles.text, isMostlyBengali(node.content) && { color: t.muted }]}
      >
        {node.content}
      </Text>
    ),
    textgroup: (node, children, parent, styles) => (
      <Text key={node.key} selectable={false} style={styles.textgroup}>
        {children}
      </Text>
    ),
    // Wide tables scroll sideways instead of squeezing every column.
    table: (node, children, parent, styles) => (
      <ScrollView key={node.key} horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
        <View style={styles._VIEW_SAFE_table}>{children}</View>
      </ScrollView>
    ),
  };
}

function markdownStyles(t, size, font) {
  const cell = { width: 170, flex: 0, padding: 10, borderColor: t.border };
  return {
    body: { fontFamily: font, fontSize: size, lineHeight: size * 1.65, color: t.text },
    paragraph: { marginTop: 8, marginBottom: 8 },
    heading1: { fontFamily: FAMILIES.serif, fontSize: size + 10, fontWeight: '700', color: t.text, marginVertical: 12 },
    heading2: { fontFamily: FAMILIES.serif, fontSize: size + 6, fontWeight: '700', color: t.text, marginTop: 20 },
    heading3: { fontFamily: FAMILIES.serif, fontSize: size + 2, fontWeight: '700', color: t.text, marginTop: 16 },
    strong: { fontWeight: '700' },
    em: { fontStyle: 'italic' },
    bullet_list_icon: { color: t.accent, fontSize: size + 2, lineHeight: size * 1.65, marginLeft: 2, marginRight: 10 },
    ordered_list_icon: { color: t.accent, fontWeight: '700', lineHeight: size * 1.65, marginRight: 8 },
    list_item: { marginVertical: 4 },
    hr: { backgroundColor: t.border, height: 1, marginVertical: 20 },
    blockquote: {
      backgroundColor: t.accentSoft,
      borderLeftColor: t.accent,
      borderLeftWidth: 3,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 6,
      marginVertical: 10,
    },
    table: { borderWidth: 1, borderColor: t.border, borderRadius: 10, overflow: 'hidden' },
    thead: { backgroundColor: t.accentSoft },
    th: { ...cell, fontWeight: '700' },
    td: cell,
    tr: { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: t.border, flexDirection: 'row' },
    code_inline: { backgroundColor: t.accentSoft, color: t.text, borderRadius: 4, paddingHorizontal: 4 },
    link: { color: t.accent },
  };
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  aaBtn: { paddingHorizontal: 4 },
  progressTrack: { height: 2 },
  progressFill: { height: 2, width: '100%', transformOrigin: 'left' },

  opener: { alignItems: 'center', paddingTop: 36, paddingBottom: 24 },
  openerLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 4 },
  openerOrn: { flexDirection: 'row', alignItems: 'center', width: 140, marginVertical: 14 },
  ornRule: { flex: 1, height: 1, opacity: 0.7 },
  openerTitle: { fontFamily: FAMILIES.serif, fontSize: 30, lineHeight: 38, fontWeight: '700', textAlign: 'center' },
  openerAs: { fontSize: 15, marginTop: 10, textAlign: 'center' },
  testPill: { marginTop: 18, borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },

  h2: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 30, marginBottom: 8, paddingBottom: 10, borderBottomWidth: 1 },
  h2Num: { fontFamily: FAMILIES.serif, fontSize: 26, fontWeight: '700', marginRight: 12, lineHeight: 32 },

  callout: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8, marginVertical: 12 },
  calloutLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginTop: 8 },

  practice: { borderWidth: 1, borderRadius: 16, padding: 18, marginTop: 24, alignItems: 'center' },
  practiceLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  score: { borderWidth: 1.5, borderRadius: 18, padding: 20, marginTop: 20, alignItems: 'center' },
  ghostBtn: { marginTop: 14, borderWidth: 1, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 9 },

  navRow: { flexDirection: 'row', marginTop: 32 },
  navCard: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 14 },
  navDir: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },

  testBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  miniTrack: { height: 4, borderRadius: 2, marginTop: 6, marginRight: 16, overflow: 'hidden' },
  miniFill: { height: 4, borderRadius: 2 },
  primaryBtn: { borderRadius: 999, paddingHorizontal: 22, paddingVertical: 11 },
  primaryText: { fontWeight: '800', fontSize: 15 },
});
