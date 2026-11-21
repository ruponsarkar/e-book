import React, { useCallback, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useCached } from '../cache/useCached';
import OfflineBanner from '../components/OfflineBanner';
import { useAuth } from '../auth/AuthContext';
import BookCover, { PAPER, SERIF } from '../components/BookCover';

const PADDING = 16;
const GAP = 20;

function initials(user) {
  const src = (user.name || user.email.split('@')[0]).trim();
  const parts = src.split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
}

export default function LibraryScreen({ navigation }) {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const { data, error, offline, loading, reload } = useCached('/books');
  const books = data?.books || [];
  const [refreshing, setRefreshing] = useState(false);

  // Two covers per row; the 6px leaves room for the page edges beside each cover.
  const coverWidth = Math.floor((width - PADDING * 2 - GAP) / 2) - 6;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('Profile')} hitSlop={10} style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(user)}</Text>
        </Pressable>
      ),
    });
  }, [navigation, user]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  return (
    <FlatList
      style={{ backgroundColor: PAPER }}
      contentContainerStyle={{ padding: PADDING, paddingBottom: 40 }}
      data={books}
      numColumns={2}
      columnWrapperStyle={{ gap: GAP }}
      keyExtractor={(b) => b.slug}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      ListHeaderComponent={
        <View>
          {offline ? <OfflineBanner /> : null}
          <Text style={styles.hello}>Signed in as {user.email}</Text>
        </View>
      }
      ListEmptyComponent={
        loading && !data ? (
          <ActivityIndicator style={{ marginTop: 40 }} color="#d4b36a" />
        ) : (
          <Text style={styles.empty}>{error?.message || 'No books on your account yet. Contact the publisher to get access.'}</Text>
        )
      }
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.item, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}
          onPress={() => navigation.navigate('Book', { slug: item.slug, title: item.title })}
        >
          <BookCover book={item} width={coverWidth} />
          {item.edition ? (
            <Text style={[styles.edition, { width: coverWidth }]} numberOfLines={1}>
              {item.edition}
            </Text>
          ) : null}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1f3a5f',
    borderWidth: 1.5,
    borderColor: '#d4b36a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#d4b36a', fontWeight: '800', fontSize: 13, fontFamily: SERIF },
  hello: { color: '#8a7a5c', marginBottom: 16 },
  empty: { color: '#667', textAlign: 'center', marginTop: 40 },
  item: { marginBottom: 24 },
  edition: { fontFamily: SERIF, fontStyle: 'italic', fontSize: 12, color: '#8a7a5c', marginTop: 10, textAlign: 'center' },
});
