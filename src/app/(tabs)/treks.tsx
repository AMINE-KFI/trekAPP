import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useInventory, Trek, Pack } from '../../context/InventoryContext';

export default function TreksScreen() {
  const { 
    treks, 
    packs, 
    colors, 
    addTrek, 
    deleteTrek, 
    updateTrekName,
    toggleChecklistItem, 
    addChecklistItem, 
    removeChecklistItem,
    updateTrekPack
  } = useInventory();
  
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [selectedPackId, setSelectedPackId] = useState('');
  const [expandedTrekId, setExpandedTrekId] = useState<string | null>(null);
  const [newTodoText, setNewTodoText] = useState('');
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameTrekId, setRenameTrekId] = useState<string | null>(null);
  const [renameTrekName, setRenameTrekName] = useState('');
  const [selectPackModalVisible, setSelectPackModalVisible] = useState(false);
  const [selectPackTrekId, setSelectPackTrekId] = useState<string | null>(null);

  // Pack items checklist state (checked items are saved in a local record to avoid state-mashing)
  const [packedItems, setPackedItems] = useState<Record<string, boolean>>({});

  const handleCreateTrek = () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom pour la sortie.');
      return;
    }
    if (!date.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une date.');
      return;
    }
    if (!selectedPackId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un sac associé.');
      return;
    }

    addTrek(name, date, selectedPackId);
    setName('');
    setDate('');
    setSelectedPackId('');
    setIsAdding(false);
  };

  const togglePackItemPacked = (trekId: string, itemId: string) => {
    const key = `${trekId}_${itemId}`;
    setPackedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Sorties</Text>
            <Text style={[styles.subtitle, { color: colors.subText }]}>Planifiez vos treks et check-lists</Text>
          </View>
          <Pressable 
            style={[styles.addBtn, { backgroundColor: isAdding ? colors.border : colors.primary }]} 
            onPress={() => {
              if (packs.length === 0) {
                Alert.alert('Info', "Veuillez d'abord créer un sac dans l'onglet 'Mes Sacs'.");
                return;
              }
              setIsAdding(!isAdding);
            }}
          >
            <Ionicons name={isAdding ? 'close' : 'add'} size={24} color={isAdding ? colors.text : '#FFFFFF'} />
          </Pressable>
        </View>

        {/* Add Trek Form */}
        {isAdding && (
          <View style={[styles.addForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Nouvelle aventure</Text>
            
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Nom de la sortie (ex: Tour du Mont Blanc)"
              placeholderTextColor={colors.subText}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Date (ex: 24 Mai 2026)"
              placeholderTextColor={colors.subText}
              value={date}
              onChangeText={setDate}
            />

            <Text style={[styles.label, { color: colors.text }]}>Sélectionner un sac associé :</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.packSelector}>
              {packs.map(p => (
                <Pressable
                  key={p.id}
                  style={[
                    styles.packSelectCard,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    selectedPackId === p.id && { backgroundColor: colors.primary + '15', borderColor: colors.primary }
                  ]}
                  onPress={() => setSelectedPackId(p.id)}
                >
                  <Ionicons 
                    name="briefcase-outline" 
                    size={18} 
                    color={selectedPackId === p.id ? colors.primary : colors.subText} 
                  />
                  <Text style={[
                    styles.packSelectText, 
                    { color: selectedPackId === p.id ? colors.primary : colors.text }
                  ]}>
                    {p.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleCreateTrek}>
              <Text style={styles.saveBtnText}>Planifier la sortie</Text>
            </Pressable>
          </View>
        )}

        {/* Treks List */}
        {treks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.border }]}>
              <Ionicons name="compass-outline" size={48} color={colors.subText} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucune sortie planifiée</Text>
            <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
              Préparez votre prochain départ en planifiant une sortie et en y liant un sac.
            </Text>
          </View>
        ) : (
          treks.map(trek => {
            const associatedPack = packs.find(p => p.id === trek.packId);
            const isExpanded = expandedTrekId === trek.id;

            return (
              <View 
                key={trek.id} 
                style={[
                  styles.trekCard, 
                  { backgroundColor: colors.card, borderColor: colors.border }
                ]}
              >
                {/* Accordion Header */}
                <Pressable 
                  style={styles.trekHeader} 
                  onPress={() => setExpandedTrekId(isExpanded ? null : trek.id)}
                >
                  <View style={styles.trekHeaderLeft}>
                    <View style={[styles.trekIcon, { backgroundColor: colors.primary + '15' }]}>
                      <Ionicons name="trail-sign" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.trekMeta}>
                      <Text style={[styles.trekName, { color: colors.text }]}>{trek.name}</Text>
                      <Text style={[styles.trekDate, { color: colors.subText }]}>
                        {trek.date} • {associatedPack ? associatedPack.name : 'Aucun sac'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.headerRight}>
                    <Pressable 
                      style={styles.editBtn} 
                      onPress={() => {
                        setRenameTrekId(trek.id);
                        setRenameTrekName(trek.name);
                        setRenameModalVisible(true);
                      }}
                    >
                      <Ionicons name="pencil-outline" size={18} color={colors.primary} />
                    </Pressable>
                    <Pressable 
                      style={styles.deleteBtn} 
                      onPress={() => {
                        Alert.alert('Supprimer', 'Voulez-vous supprimer cette sortie ?', [
                          { text: 'Annuler', style: 'cancel' },
                          { text: 'Supprimer', style: 'destructive', onPress: () => deleteTrek(trek.id) }
                        ]);
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color="#E74C3C" />
                    </Pressable>
                    <Ionicons 
                      name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                      size={22} 
                      color={colors.subText} 
                    />
                  </View>
                </Pressable>

                {/* Accordion Body */}
                {isExpanded && (
                  <View style={[styles.trekBody, { borderTopColor: colors.border }]}>
                    
                    {/* Link to associated pack */}
                    <View style={[styles.packLinkContainer, { backgroundColor: colors.background, borderColor: colors.border, marginBottom: 16 }]}>
                      <View style={styles.packLinkLeft}>
                        <Ionicons name="briefcase" size={20} color={colors.primary} />
                        <Text style={[styles.packLinkText, { color: colors.text }]} numberOfLines={1}>
                          Sac associé : <Text style={{ fontWeight: '700' }}>{associatedPack ? associatedPack.name : 'Aucun'}</Text>
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Pressable 
                          style={[styles.changePackBtn, { borderColor: colors.primary, borderWidth: 1 }]}
                          onPress={() => {
                            setSelectPackTrekId(trek.id);
                            setSelectPackModalVisible(true);
                          }}
                        >
                          <Text style={[styles.changePackText, { color: colors.primary }]}>Changer</Text>
                        </Pressable>
                        {associatedPack && (
                          <Pressable 
                            style={[styles.openPackBtn, { backgroundColor: colors.primary }]}
                            onPress={() => router.push(`/pack/${associatedPack.id}`)}
                          >
                            <Text style={styles.openPackText}>Ouvrir</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>

                    {/* Interactive Pack Items Checklist */}
                    <Text style={[styles.sectionHeading, { color: colors.text }]}>Checklist Équipement (Départ)</Text>
                    {associatedPack && associatedPack.items.length > 0 ? (
                      <View style={styles.checklist}>
                        {associatedPack.items.map(pi => {
                          if (!pi.item) return null;
                          const isPacked = !!packedItems[`${trek.id}_${pi.item.id}`];
                          return (
                            <Pressable 
                              key={pi.item.id} 
                              style={styles.checkItem}
                              onPress={() => togglePackItemPacked(trek.id, pi.item.id)}
                            >
                              <Ionicons 
                                name={isPacked ? "checkmark-circle" : "ellipse-outline"} 
                                size={22} 
                                color={isPacked ? colors.primary : colors.subText} 
                                style={styles.checkboxIcon}
                              />
                              <Text 
                                style={[
                                  styles.checkItemText, 
                                  { color: colors.text },
                                  isPacked && { textDecorationLine: 'line-through', color: colors.subText }
                                ]}
                              >
                                {pi.item.name} <Text style={{ color: colors.subText }}>({pi.quantity}x • {pi.item.weight})</Text>
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    ) : (
                      <Text style={[styles.emptyListText, { color: colors.subText }]}>
                        Aucun équipement dans le sac associé pour le moment.
                      </Text>
                    )}

                    {/* Dynamic To-do / To-buy List */}
                    <Text style={[styles.sectionHeading, { color: colors.text, marginTop: 24 }]}>À acheter / Préparer</Text>
                    
                    {/* Add Custom To-do input */}
                    <View style={styles.addTodoRow}>
                      <TextInput
                        style={[styles.todoInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                        placeholder="Ajouter une tâche (ex: Gaz, Nourriture...)"
                        placeholderTextColor={colors.subText}
                        value={newTodoText}
                        onChangeText={setNewTodoText}
                      />
                      <Pressable 
                        style={[styles.todoAddBtn, { backgroundColor: colors.primary }]}
                        onPress={() => {
                          if (newTodoText.trim()) {
                            addChecklistItem(trek.id, newTodoText.trim());
                            setNewTodoText('');
                          }
                        }}
                      >
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                      </Pressable>
                    </View>

                    {trek.checklistItems && trek.checklistItems.length > 0 ? (
                      <View style={styles.todoList}>
                        {trek.checklistItems.map(todo => (
                          <View key={todo.id} style={styles.todoItem}>
                            <Pressable 
                              style={styles.todoItemLeft}
                              onPress={() => toggleChecklistItem(trek.id, todo.id)}
                            >
                              <Ionicons 
                                name={todo.checked ? "checkmark-circle" : "ellipse-outline"} 
                                size={22} 
                                color={todo.checked ? colors.primary : colors.subText} 
                              />
                              <Text 
                                style={[
                                  styles.todoText, 
                                  { color: colors.text },
                                  todo.checked && { textDecorationLine: 'line-through', color: colors.subText }
                                ]}
                              >
                                {todo.text}
                              </Text>
                            </Pressable>
                            <Pressable onPress={() => removeChecklistItem(trek.id, todo.id)}>
                              <Ionicons name="trash-outline" size={18} color={colors.subText} />
                            </Pressable>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={[styles.emptyListText, { color: colors.subText }]}>
                        Rien à préparer d'autre pour l'instant.
                      </Text>
                    )}

                  </View>
                )}
              </View>
            );
          })
        )}

      </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de renommage de sortie */}
      <Modal visible={renameModalVisible} transparent animationType="fade" onRequestClose={() => setRenameModalVisible(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setRenameModalVisible(false)}>
            <Pressable style={[styles.modalContent, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Modifier la sortie</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Nom de la sortie..."
                placeholderTextColor={colors.subText}
                value={renameTrekName}
                onChangeText={setRenameTrekName}
                autoFocus
              />
              <View style={styles.modalActions}>
                <Pressable style={[styles.modalCancelBtn, { backgroundColor: colors.border }]} onPress={() => setRenameModalVisible(false)}>
                  <Text style={[styles.modalCancelText, { color: colors.text }]}>Annuler</Text>
                </Pressable>
                <Pressable 
                  style={[styles.modalAddBtn, { backgroundColor: colors.primary }]} 
                  onPress={() => {
                    if (renameTrekName.trim() && renameTrekId) {
                      updateTrekName(renameTrekId, renameTrekName.trim());
                      setRenameModalVisible(false);
                      setRenameTrekId(null);
                      setRenameTrekName('');
                    }
                  }}
                >
                  <Text style={styles.modalAddText}>Enregistrer</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
      {/* Modal de sélection de sac associé */}
      <Modal visible={selectPackModalVisible} transparent animationType="fade" onRequestClose={() => setSelectPackModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelectPackModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.card, maxHeight: '80%' }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Choisir un sac pour cette sortie</Text>
            
            <ScrollView style={{ marginVertical: 12 }} showsVerticalScrollIndicator={false}>
              {packs.length === 0 ? (
                <Text style={[styles.emptyListText, { color: colors.subText, textAlign: 'center', marginVertical: 20 }]}>
                  Aucun sac disponible. Créez-en un dans l'onglet "Mes Sacs".
                </Text>
              ) : (
                packs.map(p => (
                  <Pressable
                    key={p.id}
                    style={({ pressed }) => [
                      styles.selectPackItem,
                      { 
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        opacity: pressed ? 0.7 : 1
                      }
                    ]}
                    onPress={() => {
                      if (selectPackTrekId) {
                        updateTrekPack(selectPackTrekId, p.id);
                        setSelectPackModalVisible(false);
                        setSelectPackTrekId(null);
                      }
                    }}
                  >
                    <Ionicons name="briefcase" size={20} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.selectPackName, { color: colors.text }]}>{p.name}</Text>
                      <Text style={[styles.selectPackMeta, { color: colors.subText }]}>
                        {p.items.reduce((sum, pi) => sum + pi.quantity, 0)} objets
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.subText} />
                  </Pressable>
                ))
              )}
            </ScrollView>

            <Pressable style={[styles.modalCancelBtn, { backgroundColor: colors.border, marginTop: 8 }]} onPress={() => setSelectPackModalVisible(false)}>
              <Text style={[styles.modalCancelText, { color: colors.text, textAlign: 'center' }]}>Annuler</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
  addForm: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  packSelector: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 8,
  },
  packSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
    gap: 8,
  },
  packSelectText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 60,
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
  },
  trekCard: {
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  trekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  trekHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trekIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  trekMeta: {
    flex: 1,
  },
  trekName: {
    fontSize: 16,
    fontWeight: '700',
  },
  trekDate: {
    fontSize: 13,
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteBtn: {
    padding: 8,
  },
  trekBody: {
    padding: 18,
    borderTopWidth: 1,
  },
  packLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  packLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  packLinkText: {
    fontSize: 14,
  },
  openPackBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  openPackText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  checklist: {
    gap: 10,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxIcon: {
    marginRight: 12,
  },
  checkItemText: {
    fontSize: 14,
    flex: 1,
  },
  emptyListText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  addTodoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  todoInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  todoAddBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todoList: {
    gap: 8,
  },
  todoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EAEAEA',
  },
  todoItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  todoText: {
    fontSize: 14,
    flex: 1,
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
  editBtn: {
    padding: 8,
  },
  changePackBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePackText: {
    fontWeight: '600',
    fontSize: 12,
  },
  selectPackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  selectPackName: {
    fontSize: 14,
    fontWeight: '700',
  },
  selectPackMeta: {
    fontSize: 12,
    marginTop: 2,
  },
});
