import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoragePort } from '@ai-detox/core';

/** AsyncStorage adapter for the core StoragePort (localStorage on web). */
export const asyncStoragePort: StoragePort = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};
