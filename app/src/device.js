import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const DEVICE_KEY = 'device_id';

// A random id created once per installation and kept in the phone's secure storage.
// The server uses it to tell "same phone logging in again" from "a different phone".
export async function getDeviceInfo() {
  let deviceId = await SecureStore.getItemAsync(DEVICE_KEY);
  if (!deviceId) {
    deviceId = Crypto.randomUUID();
    await SecureStore.setItemAsync(DEVICE_KEY, deviceId);
  }
  const deviceName = [Device.manufacturer, Device.modelName].filter(Boolean).join(' ');
  return { deviceId, deviceName, platform: Platform.OS };
}
