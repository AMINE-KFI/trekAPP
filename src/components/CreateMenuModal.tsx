import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useInventory } from '../context/InventoryContext';

interface CreateMenuModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreateMenuModal({ visible, onClose }: CreateMenuModalProps) {
  const router = useRouter();
  const { addPack, colors } = useInventory();
  const [packModalVisible, setPackModalVisible] = useState(false);
  const [newPackName, setNewPackName] = useState('');

  const handleAddPack = () => {
    if (newPackName.trim()) {
      addPack(newPackName);
      setNewPackName('');
      setPackModalVisible(false);
    }
  };

  const openPackModal = () => {
    onClose();
    setTimeout(() => {
      setPackModalVisible(true);
    }, 300);
  };

  return (
    <>
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.menuContainer, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Nouveau...</Text>
            <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.background }]}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>
          
          <View style={styles.options}>
            <Pressable style={[styles.optionItem, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => { onClose(); router.push('/add-item'); }}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="cube-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>Ajouter un objet</Text>
                <Text style={[styles.optionSubtitle, { color: colors.subText }]}>Tente, sac, réchaud, etc.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.subText} />
            </Pressable>

            <Pressable style={[styles.optionItem, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={openPackModal}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accent + '15' }]}>
                <Ionicons name="bag-handle-outline" size={24} color={colors.accent} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>Préparer un sac</Text>
                <Text style={[styles.optionSubtitle, { color: colors.subText }]}>Assembler ton matériel</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.subText} />
            </Pressable>

            <Pressable style={[styles.optionItem, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={onClose}>
              <View style={[styles.iconContainer, { backgroundColor: '#E67E2220' }]}>
                <Ionicons name="list-outline" size={24} color="#E67E22" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>Nouvelle Check-list</Text>
                <Text style={[styles.optionSubtitle, { color: colors.subText }]}>Liste de tâches ou courses</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.subText} />
            </Pressable>
          </View>
        </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={packModalVisible} transparent animationType="fade" onRequestClose={() => setPackModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <Pressable style={styles.packModalOverlay} onPress={() => setPackModalVisible(false)}>
            <Pressable style={[styles.packModalContent, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
              <Text style={[styles.packModalTitle, { color: colors.text }]}>Créer un nouveau sac</Text>
              <TextInput
                style={[styles.packModalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Nom du sac (ex: GR20, Rando week-end...)"
                placeholderTextColor={colors.subText}
                value={newPackName}
                onChangeText={setNewPackName}
                autoFocus
              />
              <View style={styles.packModalActions}>
                <Pressable style={[styles.packModalCancelBtn, { backgroundColor: colors.border }]} onPress={() => setPackModalVisible(false)}>
                  <Text style={[styles.packModalCancelText, { color: colors.text }]}>Annuler</Text>
                </Pressable>
                <Pressable style={[styles.packModalAddBtn, { backgroundColor: colors.primary }]} onPress={handleAddPack}>
                  <Text style={styles.packModalAddText}>Créer</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  options: {
    gap: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#999999',
  },
  packModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  packModalContent: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  packModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  packModalInput: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  packModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  packModalCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  packModalCancelText: {
    color: '#666666',
    fontWeight: '600',
  },
  packModalAddBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#34A853',
  },
  packModalAddText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
