import { View, Text, StyleSheet, FlatList, Pressable, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useInventory, Pack, PackItem } from '../../context/InventoryContext';

export default function PacksScreen() {
  const { packs, addPack, deletePack, updatePackName, colors, formatDisplayWeight } = useInventory();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [newPackName, setNewPackName] = useState('');
  const [editingPackId, setEditingPackId] = useState<string | null>(null);

  const handleSavePack = () => {
    if (newPackName.trim()) {
      if (editingPackId) {
        updatePackName(editingPackId, newPackName.trim());
      } else {
        addPack(newPackName.trim());
      }
      setNewPackName('');
      setEditingPackId(null);
      setModalVisible(false);
    }
  };

  const handleCloseModal = () => {
    setNewPackName('');
    setEditingPackId(null);
    setModalVisible(false);
  };

  const getPackWeightString = (packItems: PackItem[]) => {
    let totalWeightKg = 0;
    packItems.forEach(pi => {
      if (!pi.item || !pi.item.weight) return;
      const w = pi.item.weight.toLowerCase().replace(',', '.');
      const isKg = w.includes('kg');
      const val = parseFloat(w) || 0;
      const kg = (isKg ? val : val / 1000) * pi.quantity;
      totalWeightKg += kg;
    });
    return formatDisplayWeight(`${totalWeightKg.toFixed(2)} kg`);
  };

  const renderPackItem = ({ item }: { item: Pack }) => {
    const totalItemsCount = item.items.reduce((sum, pi) => sum + pi.quantity, 0);
    return (
      <Pressable 
        style={[styles.packCard, { backgroundColor: colors.card, borderColor: colors.border }]} 
        onPress={() => router.push(`/pack/${item.id}`)}
      >
        <View style={styles.packHeader}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="briefcase" size={24} color={colors.primary} />
          </View>
          <View style={styles.packInfo}>
            <Text style={[styles.packName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.packMeta, { color: colors.subText }]}>
              {totalItemsCount} {totalItemsCount > 1 ? 'objets' : 'objet'} • {getPackWeightString(item.items)}
            </Text>
          </View>
          <View style={styles.actionsContainer}>
            <Pressable 
              style={styles.actionBtn} 
              onPress={(e) => {
                e.stopPropagation();
                setEditingPackId(item.id);
                setNewPackName(item.name);
                setModalVisible(true);
              }}
            >
              <Ionicons name="pencil-outline" size={18} color={colors.primary} />
            </Pressable>
            <Pressable 
              style={styles.actionBtn} 
              onPress={(e) => {
                e.stopPropagation();
                Alert.alert('Supprimer', 'Voulez-vous supprimer ce sac ?', [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Supprimer', style: 'destructive', onPress: () => deletePack(item.id) }
                ]);
              }}
            >
              <Ionicons name="trash-outline" size={18} color="#E74C3C" />
            </Pressable>
            <Ionicons name="chevron-forward" size={20} color={colors.subText} style={{ marginLeft: 4 }} />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Mes Sacs</Text>
          <Text style={[styles.subtitle, { color: colors.subText }]}>Gérez et préparez vos sacs d'aventure</Text>
        </View>
        <Pressable 
          style={[styles.addBtn, { backgroundColor: colors.primary }]} 
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {packs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.border }]}>
            <Ionicons name="briefcase-outline" size={48} color={colors.subText} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucun sac de prêt</Text>
          <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
            Commencez par créer un sac pour organiser vos équipements de randonnée.
          </Text>
          <Pressable 
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]} 
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.emptyBtnText}>Créer mon premier sac</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={packs}
          keyExtractor={(item) => item.id}
          renderItem={renderPackItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de création / édition rapide */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={handleCloseModal}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          <Pressable style={styles.modalOverlay} onPress={handleCloseModal}>
            <Pressable style={[styles.modalContent, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingPackId ? "Modifier le sac" : "Créer un nouveau sac"}
              </Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Nom du sac (ex: GR20, Rando week-end...)"
                placeholderTextColor={colors.subText}
                value={newPackName}
                onChangeText={setNewPackName}
                autoFocus
              />
              <View style={styles.modalActions}>
                <Pressable style={[styles.modalCancelBtn, { backgroundColor: colors.border }]} onPress={handleCloseModal}>
                  <Text style={[styles.modalCancelText, { color: colors.text }]}>Annuler</Text>
                </Pressable>
                <Pressable style={[styles.modalAddBtn, { backgroundColor: colors.primary }]} onPress={handleSavePack}>
                  <Text style={styles.modalAddText}>{editingPackId ? "Enregistrer" : "Créer"}</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  listContent: {
    padding: 24,
    paddingTop: 8,
    gap: 16,
  },
  packCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
  },
  packHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  packInfo: {
    flex: 1,
  },
  packName: {
    fontSize: 16,
    fontWeight: '700',
  },
  packMeta: {
    fontSize: 13,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  emptyIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  emptyBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  modalCancelText: {
    fontWeight: '600',
  },
  modalAddBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  modalAddText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
