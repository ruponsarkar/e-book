import React from 'react';
import { ActivityIndicator, LogBox, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { useScreenProtection } from './src/security';
import PrivacyCover from './src/components/PrivacyCover';
import LoginScreen from './src/screens/LoginScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import BookScreen from './src/screens/BookScreen';
import ReaderScreen from './src/screens/ReaderScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Known, harmless dev-only warning: @react-navigation/elements 2.9 passes a ref to
// react-native-safe-area-context 4.12's SafeAreaProvider (Expo SDK 52's version), which
// can't take one. Goes away when safe-area-context is upgraded with the next Expo SDK.
LogBox.ignoreLogs([/Function components cannot be given refs[\s\S]*FrameSizeProvider/]);

const Stack = createNativeStackNavigator();

function Root() {
  const { user, loading } = useAuth();
  // Blocks screenshots and screen recording for the whole app (Android always; iOS where supported).
  useScreenProtection();

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
            options={{ title: '', headerStyle: { backgroundColor: '#f6f1e7' }, headerShadowVisible: false }}
          />
          <Stack.Screen name="Reader" component={ReaderScreen} options={({ route }) => ({ title: route.params.title })} />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'Profile', headerStyle: { backgroundColor: '#f6f1e7' }, headerShadowVisible: false }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Root />
      </NavigationContainer>
      {/* Hides the page in the app switcher so content can't be read from the recent-apps view. */}
      <PrivacyCover />
    </AuthProvider>
  );
}
