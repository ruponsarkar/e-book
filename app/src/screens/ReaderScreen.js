import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { api } from '../api';
import { useAuth } from '../auth/AuthContext';
import { useScreenshotReporter } from '../security';
import Watermark from '../components/Watermark';

// Book pages are fetched live and kept only in memory: nothing is written to the phone.
export default function ReaderScreen({ route }) {
  const { slug, key } = route.params;
  const { user } = useAuth();
  const [section, setSection] = useState(null);
  const [error, setError] = useState('');
  const [fontSize, setFontSize] = useState(16);

  useScreenshotReporter(slug, key);

  useEffect(() => {
    setSection(null);
    api(`/books/${slug}/sections/${key}`)
      .then((d) => setSection(d.section))
      .catch((e) => setError(e.message));
  }, [slug, key]);

  if (error) return <Text style={styles.msg}>{error}</Text>;
  if (!section) return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={{ flex: 1, backgroundColor: '#fffdf8' }}>
      <View style={styles.toolbar}>
        <Text style={styles.tool} onPress={() => setFontSize((s) => Math.max(12, s - 2))}>A−</Text>
        <Text style={styles.tool} onPress={() => setFontSize((s) => Math.min(26, s + 2))}>A+</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }}>
        <Markdown style={markdownStyles(fontSize)} rules={noSelectRules}>
          {section.markdown}
        </Markdown>
      </ScrollView>
      <Watermark label={user.email} />
    </View>
  );
}

// Text cannot be long-pressed and copied.
const noSelectRules = {
  text: (node, children, parent, styles, inheritedStyles = {}) => (
    <Text key={node.key} selectable={false} style={[inheritedStyles, styles.text]}>
      {node.content}
    </Text>
  ),
  textgroup: (node, children, parent, styles) => (
    <Text key={node.key} selectable={false} style={styles.textgroup}>
      {children}
    </Text>
  ),
};

function markdownStyles(size) {
  return {
    body: { fontSize: size, lineHeight: size * 1.55, color: '#1d2433' },
    heading1: { fontSize: size + 10, fontWeight: '700', color: '#1f3a5f', marginBottom: 10 },
    heading2: { fontSize: size + 6, fontWeight: '700', color: '#1f3a5f', marginTop: 18, marginBottom: 8 },
    heading3: { fontSize: size + 3, fontWeight: '700', color: '#28406a', marginTop: 14 },
    strong: { fontWeight: '700' },
    em: { color: '#556' },
    hr: { backgroundColor: '#e3e6ec', marginVertical: 14 },
    table: { borderColor: '#d0d5dd' },
    th: { backgroundColor: '#eef1f6', padding: 6 },
    td: { padding: 6, borderColor: '#d0d5dd' },
    blockquote: { backgroundColor: '#f3f6fb', borderLeftColor: '#1f3a5f', borderLeftWidth: 4, paddingHorizontal: 10 },
  };
}

const styles = StyleSheet.create({
  msg: { margin: 24, color: '#b42318' },
  toolbar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingVertical: 6, borderBottomWidth: 1, borderColor: '#eee' },
  tool: { fontSize: 16, fontWeight: '700', color: '#1f3a5f', marginLeft: 20 },
});
