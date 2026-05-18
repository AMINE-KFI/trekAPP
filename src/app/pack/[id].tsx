import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useInventory, PackItem, CATEGORIES_META } from '../../context/InventoryContext';

const calculateWeightDetails = (packItems: PackItem[]) => {
  let baseWeightKg = 0;
  let consumablesWeightKg = 0;
  const catWeightsKg: Record<string, number> = {};

  packItems.forEach(pi => {
    let kg = 0;
    const w = pi.item.weight.toLowerCase().replace(',', '.');
    if (w.includes('kg')) kg = parseFloat(w) * pi.quantity;
    else if (w.includes('g')) kg = (parseFloat(w) / 1000) * pi.quantity;
    else kg = parseFloat(w) * pi.quantity;
    if (isNaN(kg)) kg = 0;

    if (pi.item.isConsumable) consumablesWeightKg += kg;
    else baseWeightKg += kg;
    if (!catWeightsKg[pi.item.category]) catWeightsKg[pi.item.category] = 0;
    catWeightsKg[pi.item.category] += kg;
  });

  return { baseWeightKg, consumablesWeightKg, totalWeightKg: baseWeightKg + consumablesWeightKg, catWeightsKg };
};

export default function PackBuilder() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { packs, items, updateItemQuantityInPack, colors, formatDisplayWeight } = useInventory();
  const [modalVisible, setModalVisible] = useState(false);

  const pack = packs.find(p => p.id === id);

  if (!pack) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Erreur</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>Sac introuvable.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { baseWeightKg, consumablesWeightKg, totalWeightKg, catWeightsKg } = calculateWeightDetails(pack.items);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{pack.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tableau de Bord Visuel */}
      <View style={[styles.dashboard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.dashboardRow}>
          <View style={styles.dashboardMain}>
            <Text style={[styles.dashboardLabel, { color: colors.subText }]}>Poids Total</Text>
            <Text style={[styles.dashboardWeight, { color: '#34A853' }]}>
              {formatDisplayWeight(`${totalWeightKg.toFixed(2)} kg`)}
            </Text>
          </View>
          <View style={styles.dashboardSecondary}>
            <Text style={[styles.dashboardLabelSmall, { color: colors.subText }]}>Poids de Base</Text>
            <Text style={[styles.dashboardWeightSmall, { color: '#666666' }]}>
              {formatDisplayWeight(`${baseWeightKg.toFixed(2)} kg`)}
            </Text>
            <Text style={[styles.dashboardLabelSmall, { color: colors.subText, marginTop: 4 }]}>Consommables</Text>
            <Text style={[styles.dashboardWeightSmall, { color: '#E67E22' }]}>
              {formatDisplayWeight(`${consumablesWeightKg.toFixed(2)} kg`)}
            </Text>
          </View>
        </View>

        {totalWeightKg > 0 && (
          <View style={styles.progressBarContainer}>
            {Object.entries(catWeightsKg).map(([cat, weight]) => {
              const flex = weight / totalWeightKg;
              const color = CATEGORIES_META[cat]?.color || '#999999';
              return <View key={cat} style={[styles.progressSegment, { flex, backgroundColor: color }]} />;
            })}
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {pack.items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bag-add-outline" size={64} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.text }]}>Ton sac est vide.</Text>
            <Text style={[styles.emptySubtext, { color: colors.subText }]}>Commence par ajouter du matériel depuis ton inventaire.</Text>
          </View>
        ) : (
          pack.items.map(pi => {
            const icon = CATEGORIES_META[pi.item.category]?.icon || 'cube';
            const color = CATEGORIES_META[pi.item.category]?.color || '#999';
            return (
              <View key={pi.item.id} style={[styles.itemCard, { backgroundColor: colors.card }]}>
                {pi.item.imageUri ? (
                  <Image source={{ uri: pi.item.imageUri }} style={styles.itemImage} />
                ) : (
                  <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon as any} size={24} color={color} />
                  </View>
                )}
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: colors.text }]}>{pi.item.name}</Text>
                  <Text style={[styles.itemWeight, { color: colors.subText }]}>{formatDisplayWeight(pi.item.weight)} {pi.item.isConsumable && '(Conso)'}</Text>
                </View>
                
                <View style={[styles.quantityControls, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Pressable style={[styles.qtyBtn, { backgroundColor: colors.card }]} onPress={() => updateItemQuantityInPack(pack.id, pi.item, pi.quantity - 1)}>
                    <Ionicons name="remove" size={16} color={colors.text} />
                  </Pressable>
                  <Text style={[styles.qtyText, { color: colors.text }]}>{pi.quantity}</Text>
                  <Pressable style={[styles.qtyBtn, { backgroundColor: colors.card }]} onPress={() => updateItemQuantityInPack(pack.id, pi.item, pi.quantity + 1)}>
                    <Ionicons name="add" size={16} color={colors.text} />
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Bouton d'ajout global */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Pressable style={[styles.addMainBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.addMainText}>Ajouter du matériel</Text>
        </Pressable>
      </View>

      {/* Modal d'Inventaire Complet */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Mon Inventaire</Text>
            <Pressable onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
              <Text style={[styles.modalCloseText, { color: colors.accent }]}>Terminer</Text>
            </Pressable>
          </View>
          
          <ScrollView contentContainerStyle={styles.modalScroll}>
            {items.map(item => {
              const pi = pack.items.find(i => i.item.id === item.id);
              const quantity = pi ? pi.quantity : 0;
              const inPack = quantity > 0;
              const icon = CATEGORIES_META[item.category]?.icon || 'cube';
              
              return (
                <View key={item.id} style={[styles.modalItemCard, { borderColor: inPack ? colors.primary : colors.border, backgroundColor: inPack ? colors.primary + '15' : colors.card }]}>
                  {item.imageUri ? (
                    <Image source={{ uri: item.imageUri }} style={styles.modalItemImage} />
                  ) : (
                    <View style={[styles.modalItemImagePlaceholder, { backgroundColor: inPack ? colors.primary + '30' : colors.background }]}>
                      <Ionicons name={icon as any} size={24} color={inPack ? colors.primary : colors.subText} />
                    </View>
                  )}
                  <View style={styles.modalItemInfo}>
                    <Text style={[styles.modalItemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.modalItemWeight, { color: colors.subText }]}>{formatDisplayWeight(item.weight)}</Text>
                  </View>
                  
                  {inPack ? (
                     <View style={[styles.modalQuantityControls, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}>
                       <Pressable style={[styles.qtyBtn, { backgroundColor: colors.card }]} onPress={() => updateItemQuantityInPack(pack.id, item, quantity - 1)}>
                         <Ionicons name="remove" size={16} color={colors.text} />
                       </Pressable>
                       <Text style={[styles.qtyText, { color: colors.text }]}>{quantity}</Text>
                       <Pressable style={[styles.qtyBtn, { backgroundColor: colors.card }]} onPress={() => updateItemQuantityInPack(pack.id, item, quantity + 1)}>
                         <Ionicons name="add" size={16} color={colors.text} />
                       </Pressable>
                     </View>
                  ) : (
                    <Pressable style={[styles.modalAddButton, { backgroundColor: colors.primary + '15' }]} onPress={() => updateItemQuantityInPack(pack.id, item, 1)}>
                      <Ionicons name="add" size={20} color={colors.primary} />
                      <Text style={[styles.modalAddButtonText, { color: colors.primary }]}>Ajouter</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  dashboard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  dashboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  dashboardMain: {
    flex: 1,
  },
  dashboardLabel: {
    fontSize: 13,
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 4,
  },
  dashboardWeight: {
    fontSize: 42,
    fontWeight: '800',
  },
  dashboardSecondary: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  dashboardLabelSmall: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  dashboardWeightSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E67E22',
  },
  progressBarContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  progressSegment: {
    height: '100%',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 16,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  itemWeight: {
    fontSize: 13,
    color: '#999999',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  qtyText: {
    width: 24,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },
  addMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34A853',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#34A853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addMainText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  modalCloseBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D6DBF',
  },
  modalScroll: {
    padding: 20,
  },
  modalItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  modalItemCardActive: {
    borderColor: '#34A853',
    backgroundColor: '#F1F8E9',
  },
  modalItemImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 16,
  },
  modalItemImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalItemInfo: {
    flex: 1,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  modalItemWeight: {
    fontSize: 14,
    color: '#666666',
  },
  modalAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  modalAddButtonText: {
    color: '#34A853',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  modalQuantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
});
