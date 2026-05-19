import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../context/InventoryContext';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const router = useRouter();
  const { colors } = useInventory();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs (Email et Mot de passe).');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Erreur de connexion', error.message);
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          bounces={false} 
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>

          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>Bienvenue</Text>
            
            <View style={styles.socialButtons}>
              <Pressable style={[styles.socialBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Ionicons name="logo-google" size={20} color={colors.text} />
                <Text style={[styles.socialBtnText, { color: colors.text }]}>Continuer avec Google</Text>
              </Pressable>
            </View>

            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.subText }]}>ou</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.form}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderWidth: 1, borderColor: colors.border }]}
                placeholder="Email"
                placeholderTextColor={colors.subText}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderWidth: 1, borderColor: colors.border }]}
                placeholder="Mot de passe"
                placeholderTextColor={colors.subText}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              
              <Pressable 
                style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }, loading && { opacity: 0.7 }]} 
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Se connecter</Text>
                )}
              </Pressable>
              
              <Pressable style={styles.linkButton} onPress={() => router.push('/(auth)/signup')}>
                <Text style={[styles.linkText, { color: colors.accent }]}>Pas encore de compte ? S'inscrire</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 32,
  },
  socialButtons: {
    marginBottom: 24,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E67E22',
    borderRadius: 16,
    gap: 12,
  },
  socialBtnText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#F5F5F5',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999999',
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  input: {
    height: 56,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333333',
  },
  button: {
    backgroundColor: '#34A853',
    height: 56,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#34A853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#1D6DBF',
    fontSize: 14,
    fontWeight: '600',
  },
});
