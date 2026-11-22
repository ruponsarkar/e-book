import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { useScreenProtection } from './src/security';
import PrivacyCover from './src/components/PrivacyCover';
import LoginScreen from './src/screens/LoginScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import BookScreen from './src/screens/BookScreen';
import ReaderScreen from './src/screens/ReaderScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import HelpScreen from './src/screens/HelpScreen';
import QueryScreen from './src/screens/QueryScreen';
import NotificationBanner from './src/components/NotificationBanner';
import { useSessionTracking } from './src/activity';

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();
const PAPER_HEADER = {
  headerStyle: { backgroundColor: '#f6f1e7' },
  headerShadowVisible: false,
};

function Root() {
  const { user, loading } = useAuth();
  // Blocks screenshots and screen recording for the whole app (Android always; iOS where supported).
  useScreenProtection();
  // Time spent in the app, sent to the server for the admin's activity reports.
  useSessionTracking(Boolean(user));

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen name="Library" component={LibraryScreen} options={{ title: 'My Books' }} />
          <Stack.Screen
            name="Book"
            component={BookScreen}
            options={{
              title: '',
              headerStyle: { backgroundColor: '#f6f1e7' },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen name="Reader" component={ReaderScreen} options={({ route }) => ({ title: route.params.title })} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile', ...PAPER_HEADER }} />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ title: 'Notifications', ...PAPER_HEADER }}
          />
          <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Help & feedback', ...PAPER_HEADER }} />
          <Stack.Screen name="Query" component={QueryScreen} options={{ title: 'Conversation', ...PAPER_HEADER }} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

function SignedInOnly({ children }) {
  const { user } = useAuth();
  return user ? children : null;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer ref={navigationRef}>
          <StatusBar style="dark" />
          <Root />
          <SignedInOnly>
            <NotificationBanner
              onOpen={(n) =>
                navigationRef.isReady() &&
                (n.kind === 'reply' && n.queryId
                  ? navigationRef.navigate('Query', { id: n.queryId })
                  : navigationRef.navigate('Notifications'))
              }
            />
          </SignedInOnly>
        </NavigationContainer>
        {/* Hides the page in the app switcher so content can't be read from the recent-apps view. */}
        <PrivacyCover />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
