import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { api } from '../api';
import { useAuth } from '../auth/AuthContext';
import BookCover, { PAPER, SERIF } from '../components/BookCover';

const PADDING = 16;
const GAP = 20;

export default function LibraryScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Two covers per row; the 6px leaves room for the page edges beside each cover.
  const coverWidth = Math.floor((width - PADDING * 2 - GAP) / 2) - 6;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={logout} hitSlop={10}>
          <Text style={{ color: '#1f3a5f', fontWeight: '600' }}>Log out</Text>
        </Pressable>
      ),
    });
  }, [navigation, logout]);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await api('/books');
      setBooks(data.books);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <FlatList
      style={{ backgroundColor: PAPER }}
      contentContainerStyle={{ padding: PADDING, paddingBottom: 40 }}
      data={books}
      numColumns={2}
      columnWrapperStyle={{ gap: GAP }}
      keyExtractor={(b) => b.slug}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
      ListHeaderComponent={<Text style={styles.hello}>Signed in as {user.email}</Text>}
      ListEmptyComponent={
        !refreshing ? (
          <Text style={styles.empty}>{error || 'No books on your account yet. Contact the publisher to get access.'}</Text>
        ) : null
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
  hello: { color: '#8a7a5c', marginBottom: 16 },
  empty: { color: '#667', textAlign: 'center', marginTop: 40 },
  item: { marginBottom: 24 },
  edition: { fontFamily: SERIF, fontStyle: 'italic', fontSize: 12, color: '#8a7a5c', marginTop: 10, textAlign: 'center' },
});
