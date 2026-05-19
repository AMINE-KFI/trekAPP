import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { InventoryProvider } from '../context/InventoryContext';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // Écoute de l'Auth (useEffect 1)
  useEffect(() => {
    // Récupérer la session initiale
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setIsInitialized(true);
    });

    // Listener sur les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setIsInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Logique de Redirection (useEffect 2)
  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (session && inAuthGroup) {
      // Si l'utilisateur est connecté et dans le groupe d'auth, redirection vers l'accueil
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      // Si l'utilisateur n'est pas connecté et hors du groupe d'auth, redirection vers le login
      router.replace('/(auth)/login');
    }
  }, [session, isInitialized, segments]);

  // Affichage du Chargement
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <InventoryProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* On déclare l'ordre et l'existence des pages principales */}
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        
        {/* On garde ton modal par-dessus le reste */}
        <Stack.Screen name="add-item" options={{ presentation: 'modal' }} />
      </Stack>
    </InventoryProvider>
  );
}

