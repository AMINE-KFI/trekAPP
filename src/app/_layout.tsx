import { Stack } from 'expo-router';
import { InventoryProvider } from '../context/InventoryContext';

export default function RootLayout() {
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
