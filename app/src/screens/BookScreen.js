import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { api } from '../api';
import BookCover, { GOLD, PAPER, SERIF } from '../components/BookCover';

const GROUPS = [
  { kind: 'front', label: 'Front matter' },
  { kind: 'chapter', label: 'Chapters' },
  { kind: 'test', label: 'Test papers' },
];

export default function BookScreen({ route, navigation }) {
  const { slug } = route.params;
  const { width } = useWindowDimensions();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/books/${slug}`).then(setData).catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <Text style={styles.msg}>{error}</Text>;
  if (!data) return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;

  const groups = GROUPS.map((g) => ({ title: g.label, data: data.sections.filter((s) => s.kind === g.kind) })).filter(
    (g) => g.data.length
  );

  return (
    <SectionList
      style={{ backgroundColor: PAPER }}
      contentContainerStyle={styles.content}
      sections={groups}
      keyExtractor={(s) => s.key}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <View>
          <View style={styles.coverWrap}>
            <BookCover book={data.book} width={Math.min(width * 0.64, 280)} />
          </View>
          <Text style={styles.contentsHeading}>Contents</Text>
          <View style={styles.contentsRule} />
        </View>
      }
      renderSectionHeader={({ section }) => <Text style={styles.group}>{section.title}</Text>}
      renderItem={({ item, index, section }) => (
        <Pressable
          style={({ pressed }) => [
            styles.row,
            index === section.data.length - 1 && styles.rowLast,
            pressed && styles.rowPressed,
          ]}
          onPress={() => navigation.navigate('Reader', { slug, key: item.key, title: item.title })}
        >
          <Text style={styles.rowText}>{item.title}</Text>
          <Text style={styles.chev}>›</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  msg: { margin: 24, color: '#b42318' },
  content: { padding: 16, paddingBottom: 40 },
  coverWrap: { alignSelf: 'center', marginTop: 12, marginBottom: 28 },

  contentsHeading: { fontFamily: SERIF, fontSize: 22, color: '#2a2418', textAlign: 'center' },
  contentsRule: { alignSelf: 'center', width: 48, height: 2, backgroundColor: GOLD, marginTop: 8, marginBottom: 4 },
  group: {
    marginTop: 20,
    marginBottom: 6,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#8a7a5c',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffdf8',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e6dcc8',
  },
  rowLast: { borderBottomWidth: 0 },
  rowPressed: { backgroundColor: '#f1e8d6' },
  rowText: { flex: 1, fontFamily: SERIF, fontSize: 15, color: '#2a2418' },
  chev: { fontSize: 22, color: '#b8a77f', marginLeft: 8 },
});
