import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';
import { useAuth } from '../auth/AuthContext';
import { GOLD, PAPER, SERIF } from '../components/BookCover';

const INK = '#2a2418';
const MUTED = '#8a7a5c';
const LINE = '#e6dcc8';
const CARD = '#fffdf8';
const NAVY = '#1f3a5f';

function initials(name, email) {
  const src = (name || email.split('@')[0]).trim();
  const parts = src.split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
}

function fmtDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return new Date(d).toDateString();
  }
}

function scoreColor(p) {
  return p >= 75 ? '#2f7d4f' : p >= 50 ? '#8a6a24' : '#b3402f';
}

export default function ProfileScreen({ navigation }) {
  const { logout, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api('/progress/profile'));
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

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!data) {
    return (
      <View style={[styles.center, { backgroundColor: PAPER }]}>
        {error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator size="large" color={GOLD} />}
      </View>
    );
  }

  const { user, stats, books, recent } = data;

  return (
    <ScrollView
      style={{ backgroundColor: PAPER }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
    >
      <Header
        user={user}
        onRenamed={(name) => {
          setData((d) => ({ ...d, user: { ...d.user, name } }));
          updateUser({ name });
        }}
      />

      <View style={styles.stats}>
        <Stat label="Tests done" value={`${stats.papersDone}`} sub={`of ${stats.papersTotal}`} />
        <Stat label="Average" value={stats.average == null ? '—' : `${stats.average}%`} sub={`${stats.attempts} attempt${stats.attempts === 1 ? '' : 's'}`} />
        <Stat label="Best" value={stats.best == null ? '—' : `${stats.best}%`} sub={stats.inProgress ? `${stats.inProgress} in progress` : ' '} />
      </View>

      <SectionTitle>Your books</SectionTitle>
      <View style={styles.card}>
        {books.length === 0 ? <Text style={styles.empty}>No books on your account yet.</Text> : null}
        {books.map((b, i) => {
          const pct = b.papersTotal ? b.papersDone / b.papersTotal : 0;
          return (
            <Pressable
              key={b.slug}
              onPress={() => navigation.navigate('Book', { slug: b.slug, title: b.title })}
              style={({ pressed }) => [styles.bookRow, i > 0 && styles.divider, pressed && styles.pressed]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.bookTitle} numberOfLines={1}>
                  {b.title.split(/\s+[—–]\s+/)[0]}
                </Text>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${pct * 100}%` }]} />
                </View>
                <Text style={styles.small}>
                  {b.papersDone} of {b.papersTotal} test papers
                  {b.average != null ? ` · average ${b.average}%` : ''}
                </Text>
              </View>
              <Text style={styles.chev}>›</Text>
            </Pressable>
          );
        })}
      </View>

      <SectionTitle>Recent tests</SectionTitle>
      <View style={styles.card}>
        {recent.length === 0 ? (
          <Text style={styles.empty}>No tests submitted yet. Open a test paper from any book to begin.</Text>
        ) : null}
        {recent.map((a, i) => (
          <Pressable
            key={a.id}
            onPress={() => navigation.navigate('Reader', { slug: a.bookSlug, key: a.sectionKey, title: a.title })}
            style={({ pressed }) => [styles.recentRow, i > 0 && styles.divider, pressed && styles.pressed]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.recentTitle} numberOfLines={1}>
                {a.title}
              </Text>
              <Text style={styles.small} numberOfLines={1}>
                {a.bookTitle.split(/\s+[—–]\s+/)[0]} · {fmtDate(a.submittedAt)}
              </Text>
            </View>
            <View style={[styles.scorePill, { borderColor: scoreColor(a.percent) }]}>
              <Text style={[styles.scoreText, { color: scoreColor(a.percent) }]}>{a.percent}%</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <SectionTitle>Account</SectionTitle>
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {user.email}
          </Text>
        </View>
        {user.memberSince ? (
          <View style={[styles.infoRow, styles.divider]}>
            <Text style={styles.infoLabel}>Member since</Text>
            <Text style={styles.infoValue}>{fmtDate(user.memberSince)}</Text>
          </View>
        ) : null}
        {user.device ? (
          <View style={[styles.infoRow, styles.divider]}>
            <Text style={styles.infoLabel}>This phone</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {user.device}
            </Text>
          </View>
        ) : null}
        <ChangePassword />
      </View>
      <Text style={styles.note}>Your account can be used on one phone at a time.</Text>

      <Pressable
        onPress={() =>
          Alert.alert('Log out?', 'Your test results stay saved to your account.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log out', style: 'destructive', onPress: logout },
          ])
        }
        style={({ pressed }) => [styles.logout, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

function Header({ user, onRenamed }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const r = await api('/progress/profile', { method: 'PATCH', body: { name } });
      onRenamed(r.name);
      setEditing(false);
    } catch (e) {
      Alert.alert('Could not save', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.avatarRing}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(user.name, user.email)}</Text>
        </View>
      </View>
      {editing ? (
        <View style={styles.editRow}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={MUTED}
            autoFocus
            maxLength={80}
            style={styles.nameInput}
            onSubmitEditing={save}
            returnKeyType="done"
          />
          <Pressable onPress={save} disabled={saving} style={styles.smallBtn}>
            {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.smallBtnText}>Save</Text>}
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.name}>{user.name || 'Add your name'}</Text>
          <Pressable onPress={() => setEditing(true)} hitSlop={8}>
            <Text style={styles.editLink}>Edit name</Text>
          </Pressable>
        </>
      )}
      {user.role === 'admin' ? (
        <View style={styles.roleChip}>
          <Text style={styles.roleText}>ADMIN</Text>
        </View>
      ) : null}
    </View>
  );
}

function ChangePassword() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (next.length < 8) return Alert.alert('Too short', 'The new password needs at least 8 characters.');
    setSaving(true);
    try {
      await api('/progress/profile/password', { method: 'POST', body: { current, next } });
      setOpen(false);
      setCurrent('');
      setNext('');
      Alert.alert('Password changed', 'Use your new password next time you log in.');
    } catch (e) {
      Alert.alert('Could not change password', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <Pressable onPress={() => setOpen(true)} style={({ pressed }) => [styles.infoRow, styles.divider, pressed && styles.pressed]}>
        <Text style={[styles.infoLabel, { color: INK }]}>Change password</Text>
        <Text style={styles.chev}>›</Text>
      </Pressable>
    );
  }
  return (
    <View style={[styles.divider, { paddingVertical: 12 }]}>
      <TextInput
        value={current}
        onChangeText={setCurrent}
        placeholder="Current password"
        placeholderTextColor={MUTED}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        value={next}
        onChangeText={setNext}
        placeholder="New password (8+ characters)"
        placeholderTextColor={MUTED}
        secureTextEntry
        style={[styles.input, { marginTop: 8 }]}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
        <Pressable onPress={() => setOpen(false)} style={[styles.smallBtn, styles.ghost]}>
          <Text style={[styles.smallBtnText, { color: INK }]}>Cancel</Text>
        </Pressable>
        <Pressable onPress={save} disabled={saving || !current || !next} style={[styles.smallBtn, { opacity: current && next ? 1 : 0.5 }]}>
          {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.smallBtnText}>Update</Text>}
        </Pressable>
      </View>
    </View>
  );
}

function Stat({ label, value, sub }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{String(children).toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: '#b3402f', textAlign: 'center' },
  content: { padding: 16, paddingBottom: 48 },

  header: { alignItems: 'center', paddingTop: 12, paddingBottom: 20 },
  avatarRing: { padding: 3, borderRadius: 52, borderWidth: 1.5, borderColor: GOLD },
  avatar: { width: 92, height: 92, borderRadius: 46, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: SERIF, color: GOLD, fontSize: 34, fontWeight: '700', letterSpacing: 1 },
  name: { fontFamily: SERIF, fontSize: 24, color: INK, marginTop: 14, fontWeight: '700' },
  editLink: { color: '#8a6a24', fontWeight: '700', marginTop: 6, fontSize: 13 },
  editRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, alignSelf: 'stretch' },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: CARD,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    fontFamily: SERIF,
    fontSize: 17,
    color: INK,
  },
  roleChip: { marginTop: 10, borderWidth: 1, borderColor: GOLD, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 },
  roleText: { color: '#8a6a24', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },

  stats: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: LINE,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: { fontFamily: SERIF, fontSize: 26, color: INK, fontWeight: '700' },
  statLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, color: MUTED, marginTop: 4 },
  statSub: { fontSize: 11, color: MUTED, marginTop: 2 },

  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: MUTED, marginTop: 26, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: CARD, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: LINE, paddingHorizontal: 14 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: LINE },
  pressed: { backgroundColor: '#f1e8d6' },
  empty: { color: MUTED, paddingVertical: 16, textAlign: 'center' },

  bookRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  bookTitle: { fontFamily: SERIF, fontSize: 16, color: INK },
  track: { height: 5, borderRadius: 3, backgroundColor: LINE, marginTop: 8, overflow: 'hidden' },
  fill: { height: 5, borderRadius: 3, backgroundColor: GOLD },
  small: { fontSize: 12, color: MUTED, marginTop: 6 },
  chev: { fontSize: 22, color: '#b8a77f', marginLeft: 10 },

  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  recentTitle: { fontFamily: SERIF, fontSize: 15, color: INK },
  scorePill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginLeft: 10 },
  scoreText: { fontWeight: '800', fontSize: 13 },

  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  infoLabel: { color: MUTED, fontSize: 14 },
  infoValue: { color: INK, fontSize: 14, flexShrink: 1, marginLeft: 12 },
  input: {
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    color: INK,
  },
  smallBtn: {
    backgroundColor: NAVY,
    borderRadius: 999,
    paddingHorizontal: 18,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: LINE },
  smallBtnText: { color: '#fff', fontWeight: '700' },
  note: { color: MUTED, fontSize: 12, marginTop: 8, marginLeft: 4 },

  logout: {
    marginTop: 28,
    borderWidth: 1,
    borderColor: '#e3c1b9',
    backgroundColor: '#fbefec',
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { color: '#b3402f', fontWeight: '800', fontSize: 15 },
});
