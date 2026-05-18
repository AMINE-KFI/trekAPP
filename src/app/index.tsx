import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInventory } from '../context/InventoryContext';

export default function Onboarding() {
  const router = useRouter();
  const { colors } = useInventory();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.imageContainer}>
        <View style={[styles.placeholderImage, { backgroundColor: colors.card }]}>
          <Text style={[styles.placeholderText, { color: colors.accent }]}>[Image Nature/Montagne]</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Votre assistant de trek propulsé par l'IA</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Optimisez votre sac, suivez votre inventaire et partez léger. L'aventure n'attend plus que vous.
        </Text>
        <Pressable style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.buttonText}>Commencer</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    flex: 1.5,
    padding: 16,
  },
  placeholderImage: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#1D6DBF',
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#34A853',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#34A853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
