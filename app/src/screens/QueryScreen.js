import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api';
import { GOLD, PAPER, SERIF } from '../components/BookCover';
import { CATEGORIES, STATUS } from './HelpScreen';
import { when } from './NotificationsScreen';

const INK = '#2a2418';
const MUTED = '#8a7a5c';
const LINE = '#e6dcc8';
const NAVY = '#1f3a5f';

// One conversation with the publisher.
export default function QueryScreen({ route, navigation }) {
  const { id } = route.params;
  const [q, setQ] = useState(null);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scroll = useRef(null);

  const load = useCallback(async () => {
    try {
      setQ((await api(`/queries/${id}`)).query);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (q) navigation.setOptions({ title: q.subject });
  }, [q, navigation]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      setQ((await api(`/queries/${id}/messages`, { method: 'POST', body: { message: text.trim() } })).query);
      setText('');
    } catch (e) {
      Alert.alert('Could not send', e.message);
    } finally {
      setSending(false);
    }
  };

  if (!q) {
    return (
      <View style={styles.center}>
        {error ? <Text style={{ color: '#b3402f' }}>{error}</Text> : <ActivityIndicator size="large" color={GOLD} />}
      </View>
    );
  }

  const [label, color, bg] = STATUS[q.status] || STATUS.open;
  const category = CATEGORIES.find((c) => c[0] === q.category)?.[1] || '';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: PAPER }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView ref={scroll} contentContainerStyle={styles.content} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}>
        <View style={styles.head}>
          <Text style={styles.subject}>{q.subject}</Text>
          <View style={styles.row}>
            <View style={[styles.pill, { backgroundColor: bg }]}>
              <Text style={[styles.pillText, { color }]}>{label}</Text>
            </View>
            <Text style={styles.meta}>
              {category} · {when(q.createdAt)}
            </Text>
          </View>
        </View>
        {q.messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.from === 'admin' ? styles.admin : styles.me]}>
            {m.from === 'admin' ? <Text style={styles.from}>Exam Books team</Text> : null}
            <Text style={[styles.text, m.from === 'student' && { color: '#fff' }]}>{m.text}</Text>
            <Text style={[styles.time, m.from === 'student' && { color: '#c9d4e2' }]}>{when(m.at)}</Text>
          </View>
        ))}
        {q.status === 'open' ? <Text style={styles.waiting}>We'll reply here. You'll get a notification.</Text> : null}
      </ScrollView>
      <View style={styles.composer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={q.status === 'closed' ? 'Write to re-open this conversation' : 'Write a message'}
          placeholderTextColor={MUTED}
          multiline
          maxLength={4000}
          style={styles.input}
        />
        <Pressable onPress={send} disabled={sending || !text.trim()} style={[styles.sendBtn, (!text.trim() || sending) && { opacity: 0.5 }]}>
          {sending ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="send" size={18} color="#fff" />}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: PAPER },
  content: { padding: 16, paddingBottom: 24 },
  head: { marginBottom: 16 },
  subject: { fontFamily: SERIF, fontSize: 20, color: INK, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 2 },
  pillText: { fontSize: 11, fontWeight: '800' },
  meta: { color: MUTED, fontSize: 12 },
  bubble: { maxWidth: '85%', borderRadius: 16, padding: 12, marginBottom: 10 },
  me: { backgroundColor: NAVY, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  admin: { backgroundColor: '#fffdf8', borderWidth: StyleSheet.hairlineWidth, borderColor: LINE, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  from: { fontSize: 11, fontWeight: '800', color: '#8a6a24', marginBottom: 4, letterSpacing: 0.5 },
  text: { color: INK, fontSize: 15, lineHeight: 21 },
  time: { fontSize: 11, color: MUTED, marginTop: 6 },
  waiting: { color: MUTED, fontSize: 12, textAlign: 'center', marginTop: 8 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: LINE,
    backgroundColor: '#fbf7ee',
  },
  input: {
    flex: 1,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    color: INK,
    fontSize: 15,
  },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' },
});
