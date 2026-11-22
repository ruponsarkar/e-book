import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api';
import { useAuth } from '../auth/AuthContext';

// Slides down from the top when a new notification arrives while the app is open.
export default function NotificationBanner({ onOpen }) {
  const { unread } = useAuth();
  const insets = useSafeAreaInsets();
  const [item, setItem] = useState(null);
  const prev = useRef(unread);
  const y = useRef(new Animated.Value(-160)).current;
  const hideTimer = useRef(null);

  useEffect(() => {
    const before = prev.current;
    prev.current = unread;
    if (unread <= before) return;
    api('/notifications')
      .then(({ notifications }) => {
        const fresh = notifications.find((n) => !n.read);
        if (!fresh) return;
        setItem(fresh);
        Animated.spring(y, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
        clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(hide, 6000);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unread]);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  function hide() {
    Animated.timing(y, { toValue: -160, duration: 220, useNativeDriver: true }).start(() => setItem(null));
  }

  if (!item) return null;
  return (
    <Animated.View style={[styles.wrap, { paddingTop: insets.top + 6, transform: [{ translateY: y }] }]} pointerEvents="box-none">
      <Pressable
        style={styles.card}
        onPress={() => {
          hide();
          onOpen(item);
        }}
      >
        <View style={styles.icon}>
          <Ionicons name={item.kind === 'reply' ? 'chatbubble-ellipses' : 'notifications'} size={18} color="#d4b36a" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          {item.body ? (
            <Text style={styles.body} numberOfLines={2}>
              {item.body}
            </Text>
          ) : null}
        </View>
        <Pressable onPress={hide} hitSlop={12}>
          <Ionicons name="close" size={18} color="#c9d4e2" />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, top: 0, paddingHorizontal: 12, zIndex: 100 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1f3a5f',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  icon: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: '#d4b36a', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontWeight: '800', fontSize: 15 },
  body: { color: '#dfe6ef', marginTop: 2, fontSize: 13 },
});
