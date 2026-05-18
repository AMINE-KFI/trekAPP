import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';

// Remplacer par TES clés Supabase (Paramètres > API)
const supabaseUrl = 'https://ievlmfrgqxowohipzbbe.supabase.co';
const supabaseAnonKey = 'sb_publishable_XN24J0lH-2lPTs2brqCcpA_akbrnc1h';

// Adaptateur personnalisé pour sécuriser la session sur le téléphone (avec fallback web)
const ExpoSecureStoreAdapter = {
    getItem: (key: string) => {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.localStorage) {
                return window.localStorage.getItem(key);
            }
            return null;
        }
        return SecureStore.getItemAsync(key);
    },
    setItem: (key: string, value: string) => {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(key, value);
            }
            return;
        }
        SecureStore.setItemAsync(key, value);
    },
    removeItem: (key: string) => {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem(key);
            }
            return;
        }
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