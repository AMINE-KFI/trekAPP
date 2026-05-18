import { View, Text, StyleSheet, Pressable, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import Constants from 'expo-constants';
import { useInventory, ThemeType, WeightUnit } from '../../context/InventoryContext';

export default function Profile() {
  const { clearAllData, theme, setTheme, colors, weightUnit, setWeightUnit, categories, addCategory, removeCategory } = useInventory();
  const [newCat, setNewCat] = useState('');

  const handleClearData = () => {
    Alert.alert(
      "Êtes-vous sûr ?",
      "Cette action est irréversible. Tout votre équipement et vos sacs seront effacés de ce téléphone.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: async () => {
            await clearAllData();
            Alert.alert("Succès", "Toutes les données ont été effacées.");
          } 
        }
      ]
    );
  };

  const handleAddCategory = () => {
    if (newCat.trim()) {
      addCategory(newCat);
      setNewCat('');
    }
  };

  const renderThemeOption = (title: string, value: ThemeType, icon: string, isLast: boolean = false) => (
    <Pressable style={[styles.cardRow, { backgroundColor: colors.card }, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]} onPress={() => setTheme(value)}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
          <Ionicons name={icon as any} size={18} color={colors.text} />
        </View>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {theme === value && <Ionicons name="checkmark" size={24} color={colors.primary} />}
    </Pressable>
  );

  const renderWeightOption = (title: string, value: WeightUnit, isLast: boolean = false) => (
    <Pressable style={[styles.cardRow, { backgroundColor: colors.card }, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]} onPress={() => setWeightUnit(value)}>
      <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
      {weightUnit === value && <Ionicons name="checkmark" size={24} color={colors.primary} />}
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Paramètres</Text>

        <Text style={[styles.sectionTitle, { color: colors.subText }]}>THÈME</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {renderThemeOption('Automatique', 'automatic', 'contrast-outline')}
          {renderThemeOption('Clair', 'light', 'sunny-outline')}
          {renderThemeOption('Sombre', 'dark', 'moon-outline', true)}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.subText }]}>UNITÉ DE POIDS</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {renderWeightOption('Kilogrammes (kg)', 'kg')}
          {renderWeightOption('Grammes (g)', 'g', true)}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.subText }]}>CATÉGORIES D'ÉQUIPEMENT</Text>
        <View style={[styles.card, { backgroundColor: colors.card, paddingVertical: 8 }]}>
          {categories.map((cat, idx) => (
            <View key={cat} style={[styles.catRow, idx !== categories.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>{cat}</Text>
              <Pressable onPress={() => removeCategory(cat)} style={styles.delBtn}>
                <Ionicons name="close-circle" size={20} color={colors.danger} />
              </Pressable>
            </View>
          ))}
          <View style={styles.addCatRow}>
            <TextInput
              style={[styles.addCatInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Nouvelle catégorie..."
              placeholderTextColor={colors.subText}
              value={newCat}
              onChangeText={setNewCat}
              onSubmitEditing={handleAddCategory}
            />
            <Pressable style={[styles.addCatBtn, { backgroundColor: colors.primary }]} onPress={handleAddCategory}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.subText }]}>INFORMATIONS DE L'APPLICATION</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={[styles.cardRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Version de l'application</Text>
            <Text style={[styles.rowValue, { color: colors.subText }]}>{Constants.expoConfig?.version || '1.0.0'}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Moteur SDK</Text>
            <Text style={[styles.rowValue, { color: colors.subText }]}>{Constants.expoConfig?.sdkVersion || '55'}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.subText }]}>ZONE DE DANGER</Text>
        <View style={[styles.card, { borderColor: colors.danger, borderWidth: StyleSheet.hairlineWidth, backgroundColor: colors.card }]}>
          <Pressable style={styles.dangerBtn} onPress={handleClearData}>
            <Text style={[styles.dangerBtnText, { color: colors.danger }]}>Supprimer toutes les données</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 34, fontWeight: '800', marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginLeft: 16, marginBottom: 8, marginTop: 24 },
  card: { borderRadius: 12, overflow: 'hidden' },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowTitle: { fontSize: 16 },
  rowValue: { fontSize: 16 },
  dangerBtn: { paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  dangerBtnText: { fontSize: 16, fontWeight: '500' },
  catRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16 },
  delBtn: { padding: 4 },
  addCatRow: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingTop: 16 },
  addCatInput: { flex: 1, height: 40, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginRight: 8, fontSize: 15 },
  addCatBtn: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});
