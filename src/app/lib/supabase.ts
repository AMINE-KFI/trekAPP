import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

// Remplacer par TES clés Supabase (Paramètres > API)
const supabaseUrl = 'https://ievlmfrgqxowohipzbbe.supabase.co/rest/v1/';
const supabaseAnonKey = 'sb_publishable_XN24J0lH-2lPTs2brqCcpA_akbrnc1h';

// Adaptateur personnalisé pour sécuriser la session sur le téléphone
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});