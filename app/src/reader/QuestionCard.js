import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Inline, isMostlyBengali } from './Inline';
import { splitBilingual } from './parse';

// One multiple-choice question.
// practice: tapping an option marks it right/wrong at once and shows the explanation.
// test:     options can be changed freely; nothing is marked until the test is submitted.
function QuestionCard({ q, t, size, font, mode, pick, submitted, onPick, renderTable }) {
  const feedback = mode === 'practice' ? pick != null : submitted;
  const locked = mode === 'practice' ? pick != null : submitted;
  const [id, topic, level, exams] = q.meta || [];

  const body = { fontFamily: font, fontSize: size, lineHeight: size * 1.5, color: t.text };
  const second = { fontFamily: font, fontSize: size - 1, lineHeight: (size - 1) * 1.5, color: t.muted };
  const refStyle = { fontSize: size - 4, color: t.muted };

  return (
    <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={styles.head}>
        <View style={[styles.qnum, { backgroundColor: t.accentSoft }]}>
          <Text style={[styles.qnumText, { color: t.accent }]}>Q{q.num}</Text>
        </View>
        {topic ? (
          <Text style={[styles.topic, { color: t.muted }]} numberOfLines={1}>
            {topic}
          </Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        {level ? <LevelChip level={level} t={t} /> : null}
      </View>

      <Prompt lines={q.prompt} body={body} second={second} refStyle={refStyle} renderTable={renderTable} />

      <View style={{ marginTop: 12 }}>
        {q.options.map((o) => {
          const isAnswer = o.letter === q.answer;
          const isPick = o.letter === pick;
          let state = 'idle';
          if (feedback && q.answer && isAnswer) state = 'correct';
          else if (feedback && q.answer && isPick) state = 'wrong';
          else if (isPick) state = 'picked';
          const c = {
            idle: { bg: 'transparent', border: t.border, badge: t.muted, badgeBg: 'transparent' },
            picked: { bg: t.accentSoft, border: t.accent, badge: t.surface, badgeBg: t.accent },
            correct: { bg: t.correctBg, border: t.correct, badge: t.surface, badgeBg: t.correct },
            wrong: { bg: t.wrongBg, border: t.wrong, badge: t.surface, badgeBg: t.wrong },
          }[state];
          const { en, as } = splitBilingual(o.text);
          return (
            <Pressable
              key={o.letter}
              disabled={locked}
              onPress={() => onPick(q.num, o.letter)}
              style={({ pressed }) => [
                styles.option,
                { backgroundColor: c.bg, borderColor: c.border },
                pressed && !locked && { backgroundColor: t.accentSoft },
              ]}
            >
              <View style={[styles.badge, { borderColor: c.border, backgroundColor: c.badgeBg }]}>
                <Text style={[styles.badgeText, { color: c.badge }]}>
                  {state === 'correct' ? '✓' : state === 'wrong' ? '✕' : o.letter}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Inline text={en} style={[body, { fontSize: size - 1, lineHeight: (size - 1) * 1.4 }]} refStyle={refStyle} />
                {as ? <Inline text={as} style={[second, { fontSize: size - 2, lineHeight: (size - 2) * 1.4 }]} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      {mode === 'practice' && pick == null && q.answer ? (
        <Pressable onPress={() => onPick(q.num, '?')} hitSlop={8} style={styles.revealBtn}>
          <Text style={[styles.reveal, { color: t.accent }]}>Show answer</Text>
        </Pressable>
      ) : null}

      {feedback && q.answer ? (
        <View style={[styles.explain, { backgroundColor: t.accentSoft, borderLeftColor: t.accent }]}>
          <Text style={[styles.explainLabel, { color: t.accent }]}>
            {pick === q.answer ? 'CORRECT · ' : pick && pick !== '?' ? 'NOT QUITE · ' : ''}ANSWER{' '}
            {q.answer === 'T' ? 'TRUE' : q.answer === 'F' ? 'FALSE' : `(${q.answer})`}
          </Text>
          {q.explanation.map((l, i) => (
            <Inline
              key={i}
              text={l}
              style={[isMostlyBengali(l) ? second : body, { fontSize: size - 1, lineHeight: (size - 1) * 1.5, marginTop: 4 }]}
              refStyle={refStyle}
            />
          ))}
        </View>
      ) : null}

      {exams || id ? (
        <View style={[styles.foot, { borderTopColor: t.border }]}>
          <Text style={[styles.footText, { color: t.muted }]} numberOfLines={2}>
            {exams ? `Important for ${exams.split(/,\s*/).join(' · ')}` : ''}
          </Text>
          {id ? <Text style={[styles.footId, { color: t.muted }]}>{id}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

function Prompt({ lines, body, second, refStyle, renderTable }) {
  const out = [];
  let table = [];
  const flushTable = () => {
    if (table.length) out.push(<View key={`t${out.length}`}>{renderTable(table.join('\n'))}</View>);
    table = [];
  };
  lines.forEach((l, i) => {
    if (l.trim().startsWith('|')) return table.push(l);
    flushTable();
    out.push(
      <Inline
        key={i}
        text={l}
        style={[isMostlyBengali(l) ? second : body, i === 0 && { fontWeight: '600' }, { marginTop: i ? 4 : 0 }]}
        refStyle={refStyle}
      />
    );
  });
  flushTable();
  return <View>{out}</View>;
}

function LevelChip({ level, t }) {
  const color = /easy/i.test(level) ? t.correct : /hard/i.test(level) ? t.wrong : t.accent;
  return (
    <View style={[styles.level, { borderColor: color }]}>
      <Text style={[styles.levelText, { color }]}>{level.toUpperCase()}</Text>
    </View>
  );
}

export default memo(QuestionCard);

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 16, marginVertical: 10 },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  qnum: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, marginRight: 10 },
  qnumText: { fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  topic: { flex: 1, fontSize: 12, marginRight: 8 },
  level: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  levelText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: { fontWeight: '800', fontSize: 13 },
  revealBtn: { alignSelf: 'flex-end', marginTop: 12 },
  reveal: { fontSize: 13, fontWeight: '700' },
  explain: { marginTop: 14, borderLeftWidth: 3, borderRadius: 10, padding: 12 },
  explainLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 2 },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 14,
    paddingTop: 10,
  },
  footText: { flex: 1, fontSize: 11 },
  footId: { fontSize: 10, marginLeft: 8, fontVariant: ['tabular-nums'] },
});
