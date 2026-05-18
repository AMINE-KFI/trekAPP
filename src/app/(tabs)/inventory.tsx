import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Image, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useInventory, CATEGORIES_META } from '../../context/InventoryContext';

export default function Inventory() {
  const { items, deleteItem, colors, formatDisplayWeight, categories } = useInventory();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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
    const matchesCategory = activeCategory === 'Tout' ? true : (activeCategory ? item.category === activeCategory : true);
    return matchesSearch && matchesCategory;
  });

  const displayCategories = ['Tout', ...categories];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
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
        <Pressable style={[styles.filterButton, { backgroundColor: colors.card }]}>
          <Ionicons name="options" size={20} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.profileSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Ionicons name="person" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>Utilisateur Trek</Text>
          <Text style={[styles.profileStats, { color: colors.subText }]}>{items.length} Objets • 0 Sacs créés</Text>
        </View>
      </View>

      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {displayCategories.map((catName) => {
            const isAll = catName === 'Tout';
            const isActive = isAll
              ? (!activeCategory || activeCategory === 'Tout')
              : activeCategory === catName;
            const meta = CATEGORIES_META[catName];
            return (
              <Pressable 
                key={catName}
                style={[styles.catButton, { backgroundColor: isActive ? colors.primary : colors.card, borderColor: isActive ? colors.primary : colors.border }]}
                onPress={() => setActiveCategory(catName)}
              >
                {!isAll && meta && <Ionicons name={meta.icon as any} size={16} color={isActive ? '#FFFFFF' : colors.subText} />}
                <Text style={[styles.catButtonText, { marginLeft: isAll ? 0 : 6, color: isActive ? '#FFFFFF' : colors.subText }]}>{catName}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.listRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
      />

      <View style={styles.mainFabContainer} pointerEvents="box-none">
        <Pressable style={[styles.mainFab, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={() => router.push('/add-item')}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.mainFabText}>Ajouter un objet</Text>
        </Pressable>
      </View>
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
  categoriesWrapper: {
    marginBottom: 24,
  },
  categories: {
    paddingHorizontal: 20,
    gap: 8,
  },
  catButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  catActive: {
    backgroundColor: '#34A853',
    borderColor: '#34A853',
  },
  catButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  catActiveText: {
    color: '#FFFFFF',
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
