import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api';
import { vault } from '../cache/vault';
import { useAuth } from '../auth/AuthContext';
import OfflineBanner from '../components/OfflineBanner';
import { GOLD, PAPER, SERIF } from '../components/BookCover';

const INK = '#2a2418';
const MUTED = '#8a7a5c';
const LINE = '#e6dcc8';
const CARD = '#fffdf8';
const NAVY = '#1f3a5f';
const PATH = '/notifications';

export function when(d) {
  const t = new Date(d);
  const mins = Math.round((Date.now() - t.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 24 * 60) return `${Math.round(mins / 60)} h ago`;
  return t.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NotificationsScreen({ navigation }) {
  const { setUnread } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Saved copy first; then the server's. Opening the inbox marks everything read
  // (the dots stay visible until the next visit so the student can see what was new).
  const load = useCallback(async () => {
    const saved = await vault.get(PATH);
    if (saved) setItems((x) => x || saved.value);
    try {
      const { notifications } = await api(PATH);
      setItems(notifications);
      setOffline(false);
      setError('');
      vault.set(PATH, notifications.map((n) => ({ ...n, read: true }))).catch(() => {});
      if (notifications.some((n) => !n.read)) {
        await api(`${PATH}/read`, { method: 'POST', body: {} });
      }
      setUnread(0);
    } catch (e) {
      if (saved) setOffline(true);
      else setError(e.message);
    }
  }, [setUnread]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!items) {
    return (
      <View style={styles.center}>
        {error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator size="large" color={GOLD} />}
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: PAPER }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      data={items}
      keyExtractor={(n) => String(n.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      ListHeaderComponent={offline ? <OfflineBanner /> : null}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="notifications-outline" size={40} color={GOLD} />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyText}>News about your books and replies to your questions will appear here.</Text>
        </View>
      }
      renderItem={({ item: n }) => {
        const reply = n.kind === 'reply' && n.queryId;
        return (
          <Pressable
            disabled={!reply}
            onPress={() => navigation.navigate('Query', { id: n.queryId })}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
          >
            <View style={[styles.icon, reply && { backgroundColor: '#e6eef7' }]}>
              <Ionicons name={reply ? 'chatbubble-ellipses' : 'megaphone'} size={18} color={reply ? NAVY : '#8a6a24'} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.row}>
                <Text style={styles.title}>{n.title}</Text>
                {!n.read ? <View style={styles.dot} /> : null}
              </View>
              {n.body ? <Text style={styles.body}>{n.body}</Text> : null}
              <Text style={styles.meta}>
                {when(n.createdAt)}
                {reply ? ' · tap to open the conversation' : ''}
              </Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: PAPER },
  error: { color: '#b3402f', textAlign: 'center' },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: LINE,
    padding: 14,
    marginBottom: 10,
  },
  icon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3e7c8', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: SERIF, fontSize: 16, color: INK, fontWeight: '700', flexShrink: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#c0392b' },
  body: { color: INK, marginTop: 4, lineHeight: 20 },
  meta: { color: MUTED, fontSize: 12, marginTop: 6 },
  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: 24 },
  emptyTitle: { fontFamily: SERIF, fontSize: 18, color: INK, marginTop: 12 },
  emptyText: { color: MUTED, textAlign: 'center', marginTop: 6, lineHeight: 20 },
});
