import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Image, ScrollView, Alert, Modal } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useInventory, CATEGORIES_META } from '../../context/InventoryContext';

export default function Inventory() {
  const { items, packs, deleteItem, colors, formatDisplayWeight, categories } = useInventory();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState<string[]>([]);

  const userName = "Amine KFI"; // Renseigné pour la démo bêta
  const greeting = userName ? `Bonjour, ${userName}` : "Bonjour, Randonneur";

  const confirmDelete = (id: string) => {
    Alert.alert(
      "Supprimer cet objet ?",
      "Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => deleteItem(id) }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const icon = CATEGORIES_META[item.category]?.icon || 'cube';
    const color = CATEGORIES_META[item.category]?.color || '#999999';

    return (
      <Pressable style={[styles.itemCard, { backgroundColor: colors.card }]} onPress={() => router.push(`/item/${item.id}`)}>
        <View style={styles.cardActions}>
          <Pressable onPress={() => router.push({ pathname: '/add-item', params: { editId: item.id } })} style={[styles.actionBtn, { backgroundColor: colors.background + 'E0' }]}>
            <Ionicons name="pencil" size={18} color={colors.subText} />
          </Pressable>
          <Pressable onPress={() => confirmDelete(item.id)} style={[styles.actionBtn, { backgroundColor: colors.background + 'E0' }]}>
            <Ionicons name="trash" size={18} color={colors.danger} />
          </Pressable>
        </View>

        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.itemImagePlaceholder} />
        ) : (
          <View style={[styles.itemImagePlaceholder, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon as any} size={40} color={color} />
          </View>
        )}
        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.itemWeight, { color: colors.subText }]}>{formatDisplayWeight(item.weight)} {item.isConsumable && '(Conso)'}</Text>
      </Pressable>
    );
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeFilters.length === 0 ? true : activeFilters.includes(item.category);
    return matchesSearch && matchesCategory;
  });

  const hasActiveFilter = activeFilters.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Barre de Recherche et Bouton de Filtre */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.subText} />
          <TextInput 
            placeholder="Rechercher un objet..." 
            style={[styles.searchInput, { color: colors.text }]}
            placeholderTextColor={colors.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable 
          style={[styles.filterButton, { backgroundColor: colors.card }]}
          onPress={() => {
            setTempFilters(activeFilters);
            setIsFilterModalVisible(true);
          }}
        >
          <Ionicons 
            name="options" 
            size={20} 
            color={hasActiveFilter ? colors.primary : colors.text} 
          />
        </Pressable>
      </View>

      {/* En-tête Utilisateur Adaptatif */}
      <View style={styles.profileSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {userName ? userName.split(' ').map(n => n[0]).join('') : 'R'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>{greeting}</Text>
          <Text style={[styles.profileStats, { color: colors.subText }]}>
            {items.length} {items.length > 1 ? 'Objets' : 'Objet'} • {packs.length} {packs.length > 1 ? 'Sacs créés' : 'Sac créé'}
          </Text>
        </View>
      </View>

      {/* Grille d'Inventaire */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.listRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
      />

      {/* Bouton FAB d'Ajout */}
      <View style={styles.mainFabContainer} pointerEvents="box-none">
        <Pressable style={[styles.mainFab, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={() => router.push('/add-item')}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.mainFabText}>Ajouter un objet</Text>
        </Pressable>
      </View>

      {/* Modal thématique de Filtrage par Catégorie (Multi-sélection) */}
      <Modal visible={isFilterModalVisible} transparent animationType="fade" onRequestClose={() => setIsFilterModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsFilterModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.card, maxHeight: '80%' }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Filtrer par catégorie</Text>
            <Text style={{ fontSize: 13, color: colors.subText, marginBottom: 8 }}>
              Sélectionnez une ou plusieurs catégories. Si aucune n'est cochée, tout sera affiché.
            </Text>
            
            <ScrollView style={{ marginVertical: 12 }} showsVerticalScrollIndicator={false}>
              {/* Liste des catégories dynamiques */}
              {categories.map(cat => {
                const isActive = tempFilters.includes(cat);
                const meta = CATEGORIES_META[cat];
                const icon = meta?.icon || 'cube-outline';
                return (
                  <Pressable
                    key={cat}
                    style={({ pressed }) => [
                      styles.filterItem,
                      { 
                        backgroundColor: isActive ? colors.primary + '15' : colors.background,
                        borderColor: isActive ? colors.primary : colors.border,
                        opacity: pressed ? 0.7 : 1
                      }
                    ]}
                    onPress={() => {
                      if (isActive) {
                        setTempFilters(tempFilters.filter(f => f !== cat));
                      } else {
                        setTempFilters([...tempFilters, cat]);
                      }
                    }}
                  >
                    <Ionicons name={icon as any} size={20} color={isActive ? colors.primary : colors.subText} />
                    <Text style={[styles.filterItemText, { color: colors.text, fontWeight: isActive ? '700' : '500' }]}>
                      {cat}
                    </Text>
                    <View style={[styles.checkbox, { borderColor: isActive ? colors.primary : colors.border, backgroundColor: isActive ? colors.primary : 'transparent' }]}>
                      {isActive && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.modalActionsRow}>
              <Pressable 
                style={[styles.modalActionBtn, { backgroundColor: colors.border, flex: 1 }]} 
                onPress={() => setTempFilters([])}
              >
                <Text style={[styles.modalActionText, { color: colors.text }]}>Réinitialiser</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalActionBtn, { backgroundColor: colors.primary, flex: 1 }]} 
                onPress={() => {
                  setActiveFilters(tempFilters);
                  setIsFilterModalVisible(false);
                }}
              >
                <Text style={[styles.modalActionText, { color: '#FFFFFF', fontWeight: '700' }]}>Appliquer</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333333',
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#34A853',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  profileStats: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
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
  modalCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  modalCancelText: {
    fontWeight: '600',
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  filterItemText: {
    fontSize: 14,
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalActionBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 16,
  },
  listRow: {
    gap: 16,
  },
  itemCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  cardActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    zIndex: 10,
    gap: 8,
  },
  actionBtn: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  itemWeight: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },
  mainFabContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  mainFab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34A853',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#34A853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  mainFabText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
