import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api';
import { getDeviceInfo } from '../device';
import { GOLD, PAPER, SERIF } from '../components/BookCover';
import { when } from './NotificationsScreen';

const INK = '#2a2418';
const MUTED = '#8a7a5c';
const LINE = '#e6dcc8';
const CARD = '#fffdf8';
const NAVY = '#1f3a5f';

export const CATEGORIES = [
  ['problem', 'Problem in the app', 'bug-outline'],
  ['content', 'Mistake in a question', 'document-text-outline'],
  ['account', 'Account or login', 'person-circle-outline'],
  ['suggestion', 'Suggestion', 'bulb-outline'],
  ['other', 'Something else', 'help-circle-outline'],
];

export const STATUS = {
  open: ['Waiting for reply', '#8a6a24', '#f3e7c8'],
  answered: ['Replied', '#2f7d4f', '#dcefe2'],
  closed: ['Closed', '#6b6150', '#ece6da'],
};

// Help & feedback: write to the publisher and see earlier conversations.
// route.params.context = { bookSlug, sectionKey } when opened from a page.
export default function HelpScreen({ navigation, route }) {
  const context = route.params?.context || {};
  const [category, setCategory] = useState(route.params?.category || 'problem');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setList((await api('/queries')).queries);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const send = async () => {
    if (!message.trim()) return Alert.alert('Write your message', 'Tell us what happened or what you need.');
    setSending(true);
    try {
      const { deviceName, platform } = await getDeviceInfo();
      const { query } = await api('/queries', {
        method: 'POST',
        body: {
          category,
          subject: subject.trim(),
          message: message.trim(),
          context: { ...context, appVersion: Constants.expoConfig?.version || '', device: [deviceName, platform].filter(Boolean).join(' · ') },
        },
      });
      setSubject('');
      setMessage('');
      setList((l) => [query, ...(l || [])]);
      Alert.alert('Sent', "Thanks! We'll reply here and you'll get a notification.");
    } catch (e) {
      Alert.alert('Could not send', e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: PAPER }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
      >
        <Text style={styles.lead}>Found a mistake, stuck somewhere, or have an idea? Send it to us. We usually reply within a day.</Text>

        <Text style={styles.label}>WHAT IS IT ABOUT?</Text>
        <View style={styles.chips}>
          {CATEGORIES.map(([k, label, icon]) => (
            <Pressable key={k} onPress={() => setCategory(k)} style={[styles.chip, category === k && styles.chipOn]}>
              <Ionicons name={icon} size={15} color={category === k ? '#fff' : MUTED} />
              <Text style={[styles.chipText, category === k && { color: '#fff' }]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {context.sectionKey ? (
          <Text style={styles.context}>
            <Ionicons name="bookmark-outline" size={12} /> About the page you were reading
          </Text>
        ) : null}

        <TextInput
          value={subject}
          onChangeText={setSubject}
          placeholder="Subject (optional)"
          placeholderTextColor={MUTED}
          maxLength={120}
          style={styles.input}
        />
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder={
            category === 'content'
              ? 'Which book, chapter and question number? What is wrong?'
              : category === 'problem'
              ? 'What were you doing, and what happened?'
              : 'Your message'
          }
          placeholderTextColor={MUTED}
          multiline
          maxLength={4000}
          style={[styles.input, styles.message]}
          textAlignVertical="top"
        />
        <Pressable onPress={send} disabled={sending} style={({ pressed }) => [styles.send, (pressed || sending) && { opacity: 0.8 }]}>
          {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendText}>Send</Text>}
        </Pressable>

        <Text style={[styles.label, { marginTop: 28 }]}>YOUR MESSAGES</Text>
        {error && !list ? <Text style={styles.error}>{error}</Text> : null}
        {!list && !error ? <ActivityIndicator color={GOLD} style={{ marginTop: 12 }} /> : null}
        {list && list.length === 0 ? <Text style={styles.none}>You haven't sent anything yet.</Text> : null}
        {(list || []).map((q) => {
          const [label, color, bg] = STATUS[q.status] || STATUS.open;
          const last = q.messages[q.messages.length - 1];
          return (
            <Pressable
              key={q.id}
              onPress={() => navigation.navigate('Query', { id: q.id })}
              style={({ pressed }) => [styles.item, pressed && { backgroundColor: '#f1e8d6' }]}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.row}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {q.subject}
                  </Text>
                  {q.unread ? <View style={styles.dot} /> : null}
                </View>
                <Text style={styles.itemLast} numberOfLines={1}>
                  {last?.from === 'admin' ? 'Reply: ' : 'You: '}
                  {last?.text}
                </Text>
                <View style={[styles.row, { marginTop: 6 }]}>
                  <View style={[styles.pill, { backgroundColor: bg }]}>
                    <Text style={[styles.pillText, { color }]}>{label}</Text>
                  </View>
                  <Text style={styles.meta}>{when(q.updatedAt)}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#b8a77f" />
            </Pressable>
          );
        })}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48 },
  lead: { color: INK, lineHeight: 21, marginBottom: 18 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: MUTED, marginBottom: 10, marginLeft: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: CARD,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipOn: { backgroundColor: NAVY, borderColor: NAVY },
  chipText: { color: INK, fontWeight: '600', fontSize: 13 },
  context: { color: MUTED, fontSize: 12, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: INK,
    fontSize: 15,
    marginBottom: 10,
  },
  message: { minHeight: 130 },
  send: { backgroundColor: NAVY, borderRadius: 999, height: 48, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  error: { color: '#b3402f' },
  none: { color: MUTED },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: LINE,
    padding: 14,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemTitle: { fontFamily: SERIF, fontSize: 16, color: INK, flexShrink: 1 },
  itemLast: { color: MUTED, marginTop: 3 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#c0392b' },
  pill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 2 },
  pillText: { fontSize: 11, fontWeight: '800' },
  meta: { color: MUTED, fontSize: 12 },
});
