import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeType, useInventory, WeightUnit } from '../../context/InventoryContext';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function Profile() {
  const router = useRouter();
  const {
    clearAllData,
    theme,
    setTheme,
    colors,
    weightUnit,
    setWeightUnit,
    categories,
    addCategory,
    removeCategory,
    moveCategory
  } = useInventory();

  const [newCat, setNewCat] = useState('');
  const [categoriesModalVisible, setCategoriesModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const handleOpenEditProfile = () => {
    setEditingName(user?.user_metadata?.full_name || '');
    setProfileModalVisible(true);
  };

  const updateProfile = async (newName: string) => {
    if (!newName.trim()) {
      Alert.alert("Erreur", "Le nom ne peut pas être vide.");
      return;
    }

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { error: authErr } = await supabase.auth.updateUser({
        data: { full_name: newName.trim() }
      });

      if (authErr) {
        Alert.alert("Erreur", "Impossible de mettre à jour le profil : " + authErr.message);
        return;
      }

      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ full_name: newName.trim() })
        .eq('id', currentUser.id);

      if (dbErr) {
        console.error("Database profiles update error:", dbErr.message);
      }

      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
      setProfileModalVisible(false);
      Alert.alert("Succès", "Votre profil a été mis à jour avec succès !");
    } catch (e: any) {
      console.error("Unexpected profile update error:", e);
      Alert.alert("Erreur", "Une erreur inattendue est survenue.");
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Erreur", error.message);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Réinitialiser l'application ?",
      "Cette action supprimera définitivement tout votre équipement, vos sacs et vos sorties enregistrés de ce téléphone.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Réinitialiser",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            Alert.alert("Réinitialisé !", "Toutes vos données ont été remises à zéro avec succès.");
          }
        }
      ]
    );
  };

  const handleAddCategory = () => {
    if (newCat.trim()) {
      if (categories.includes(newCat.trim())) {
        Alert.alert("Erreur", "Cette catégorie existe déjà.");
        return;
      }
      addCategory(newCat.trim());
      setNewCat('');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Paramètres</Text>

        {/* 1. COMPTE */}
        <Text style={[styles.sectionTitle, { color: colors.subText }]}>Compte</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.accountRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {user ? (
                  user.user_metadata?.full_name
                    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                    : user.email?.substring(0, 2).toUpperCase()
                ) : '...'}
              </Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={[styles.accountName, { color: colors.text }]}>
                {user ? (user.user_metadata?.full_name || 'Randonneur') : 'Chargement...'}
              </Text>
              <Text style={[styles.accountEmail, { color: colors.subText }]}>
                {user ? user.email : ''}
              </Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.cardRow,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={handleOpenEditProfile}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="person-outline" size={18} color={colors.primary} style={styles.rowIcon} />
              <Text style={[styles.rowTitle, { color: colors.text }]}>Modifier les informations</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.subText} />
          </Pressable>
        </View>

        {/* 2. PARAMÈTRES GÉNÉRAUX */}
        <Text style={[styles.sectionTitle, { color: colors.subText }]}>Paramètres Généraux</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Gestion du Thème */}
          <View style={[styles.cardRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={styles.rowLeft}>
              <Ionicons name="color-palette-outline" size={18} color={colors.primary} style={styles.rowIcon} />
              <Text style={[styles.rowTitle, { color: colors.text }]}>Thème</Text>
            </View>
            <View style={[styles.segmentedContainer, { backgroundColor: colors.background }]}>
              {(['automatic', 'light', 'dark'] as ThemeType[]).map((t) => {
                const isActive = theme === t;
                const label = t === 'automatic' ? 'Auto' : t === 'light' ? 'Clair' : 'Sombre';
                return (
                  <Pressable
                    key={t}
                    style={[
                      styles.segmentChip,
                      isActive && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setTheme(t)}
                  >
                    <Text style={[styles.segmentChipText, { color: isActive ? '#FFFFFF' : colors.text }]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Gestion des Catégories */}
          <Pressable
            style={({ pressed }) => [
              styles.cardRow,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={() => setCategoriesModalVisible(true)}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="list-outline" size={18} color={colors.primary} style={styles.rowIcon} />
              <Text style={[styles.rowTitle, { color: colors.text }]}>Gestion des catégories</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 13, color: colors.subText }}>{categories.length} catégories</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.subText} />
            </View>
          </Pressable>
        </View>

        {/* 3. PRÉFÉRENCES DE POIDS & UNITÉS */}
        <Text style={[styles.sectionTitle, { color: colors.subText }]}>Préférences de Poids & Unités</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="scale-outline" size={18} color={colors.primary} style={styles.rowIcon} />
              <Text style={[styles.rowTitle, { color: colors.text }]}>Unité de mesure</Text>
            </View>
            <View style={[styles.segmentedContainer, { backgroundColor: colors.background }]}>
              {(['kg', 'g'] as WeightUnit[]).map((u) => {
                const isActive = weightUnit === u;
                const label = u === 'kg' ? 'Kilogrammes' : 'Grammes';
                return (
                  <Pressable
                    key={u}
                    style={[
                      styles.segmentChip,
                      { paddingHorizontal: 12 },
                      isActive && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setWeightUnit(u)}
                  >
                    <Text style={[styles.segmentChipText, { color: isActive ? '#FFFFFF' : colors.text }]}>
                      {u}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* 4. MAINTENANCE */}
        <Text style={[styles.sectionTitle, { color: colors.subText }]}>Maintenance</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            style={({ pressed }) => [
              styles.cardRow,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={handleClearData}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="refresh-outline" size={18} color={colors.danger} style={styles.rowIcon} />
              <Text style={[styles.rowTitle, { color: colors.text }]}>Réinitialiser l'application</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.subText} />
          </Pressable>
        </View>

        {/* 5. AIDE ET SUPPORT */}
        <Text style={[styles.sectionTitle, { color: colors.subText }]}>Aide & Support</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Guide de Randonnée */}
          <Pressable
            style={({ pressed }) => [
              styles.cardRow,
              { borderBottomWidth: 1, borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={() => Alert.alert(
              "Guide du parfait randonneur",
              "• Optimisation du sac : Classez votre matériel et maintenez un poids de base inférieur à 10 kg.\n\n• Sorties & Treks : Préparez vos aventures à l'avance et cochez vos équipements au moment du départ.\n\n• Consommables : Les objets comme la nourriture ou l'eau ne comptent pas dans votre poids de base."
            )}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="book-outline" size={18} color={colors.primary} style={styles.rowIcon} />
              <Text style={[styles.rowTitle, { color: colors.text }]}>Guide d'utilisation du parfait randonneur</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.subText} />
          </Pressable>

          {/* Contact Support */}
          <Pressable
            style={({ pressed }) => [
              styles.cardRow,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={() => Alert.alert(
              "Contact & Support",
              "Une question, une suggestion ou un bug sur cette version bêta ?\n\nContactez-nous sur : support@trekapp.com"
            )}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} style={styles.rowIcon} />
              <Text style={[styles.rowTitle, { color: colors.text }]}>Contacter le support / Signaler un bug</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.subText} />
          </Pressable>
        </View>

        {/* 6. BOUTON SE DÉCONNECTER */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.danger + '30',
              opacity: pressed ? 0.8 : 1
            }
          ]}
          onPress={() => Alert.alert(
            "Se déconnecter ?",
            "Voulez-vous vous déconnecter de votre compte ?",
            [
              { text: "Annuler", style: "cancel" },
              { text: "Se déconnecter", style: "destructive", onPress: handleLogout }
            ]
          )}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Se déconnecter</Text>
        </Pressable>
      </ScrollView>

      {/* MODAL DE GESTION DES CATÉGORIES */}
      <Modal
        visible={categoriesModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCategoriesModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]} edges={['top']}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Catégories de matériel</Text>
            <Pressable onPress={() => setCategoriesModalVisible(false)} style={styles.modalCloseBtn}>
              <Text style={[styles.modalCloseText, { color: colors.primary }]}>Terminer</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: colors.subText, marginLeft: 4, marginBottom: 8 }]}>Liste des catégories</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {categories.map((cat, idx) => (
                <View
                  key={cat}
                  style={[
                    styles.catRow,
                    idx !== categories.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                  ]}
                >
                  <Text style={[styles.rowTitle, { color: colors.text, flex: 1 }]}>{cat}</Text>
                  <View style={styles.catActions}>
                    {idx > 0 ? (
                      <Pressable onPress={() => moveCategory(idx, 'up')} style={styles.arrowBtn}>
                        <Ionicons name="arrow-up-outline" size={18} color="#888888" />
                      </Pressable>
                    ) : (
                      <View style={{ width: 30 }} />
                    )}
                    {idx < categories.length - 1 ? (
                      <Pressable onPress={() => moveCategory(idx, 'down')} style={styles.arrowBtn}>
                        <Ionicons name="arrow-down-outline" size={18} color="#888888" />
                      </Pressable>
                    ) : (
                      <View style={{ width: 30 }} />
                    )}
                    <Pressable onPress={() => removeCategory(cat)} style={styles.delBtn}>
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.subText, marginLeft: 4, marginBottom: 8, marginTop: 24 }]}>Ajouter une catégorie</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 12 }]}>
              <View style={styles.addCatRow}>
                <TextInput
                  style={[styles.addCatInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="Ex: Éclairage, Cartographie..."
                  placeholderTextColor={colors.subText}
                  value={newCat}
                  onChangeText={setNewCat}
                  onSubmitEditing={handleAddCategory}
                />
                <Pressable style={[styles.addCatBtn, { backgroundColor: colors.primary }]} onPress={handleAddCategory}>
                  <Ionicons name="add" size={22} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* MODAL DE GESTION DU PROFIL */}
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]} edges={['top']}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Modifier le profil</Text>
            <Pressable onPress={() => setProfileModalVisible(false)} style={styles.modalCloseBtn}>
              <Text style={[styles.modalCloseText, { color: colors.primary }]}>Annuler</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: colors.subText, marginLeft: 4, marginBottom: 8 }]}>Informations personnelles</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 16, gap: 14 }]}>
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.subText, marginBottom: 6 }}>Nom complet</Text>
                <TextInput
                  style={[styles.addCatInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="Nom complet"
                  placeholderTextColor={colors.subText}
                  value={editingName}
                  onChangeText={setEditingName}
                />
              </View>
              
              <Pressable 
                style={({ pressed }) => [
                  styles.logoutBtn, 
                  { 
                    backgroundColor: colors.primary, 
                    borderColor: 'transparent',
                    marginTop: 10,
                    opacity: pressed ? 0.8 : 1 
                  }
                ]}
                onPress={() => updateProfile(editingName)}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                <Text style={[styles.logoutText, { color: '#FFFFFF' }]}>Enregistrer les modifications</Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 22,
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  accountInfo: {
    flex: 1,
    marginLeft: 14,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '700',
  },
  accountEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowIcon: {
    width: 24,
    textAlign: 'center',
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  segmentChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalCloseBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  delBtn: {
    padding: 6,
  },
  catActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrowBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
  },
  addCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addCatInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  addCatBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
