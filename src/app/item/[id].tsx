import { View, Text, StyleSheet, Image, Pressable, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useInventory, CATEGORIES_META } from '../../context/InventoryContext';

export default function ItemDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { items, deleteItem, colors } = useInventory();
  
  const item = items.find(i => i.id === id);
  const categoryMeta = item ? CATEGORIES_META[item.category] : null;
  const categoryIcon = categoryMeta?.icon || 'cube';
  const categoryColor = categoryMeta?.color || colors.accent;

  const confirmDelete = (itemId: string) => {
    Alert.alert(
      "Supprimer cet objet ?",
      "Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: () => {
            deleteItem(itemId);
            router.back();
          } 
        }
      ]
    );
  };

  if (!item) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Erreur</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.text }]}>Objet introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Détails de l'objet</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.actionBtn} onPress={() => router.push({ pathname: '/add-item', params: { editId: item.id } })}>
            <Ionicons name="pencil" size={20} color={colors.accent} />
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={() => confirmDelete(item.id)}>
            <Ionicons name="trash" size={20} color={colors.danger} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={[styles.image, { backgroundColor: colors.card }]} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: categoryColor + '20' }]}>
            <Ionicons name={categoryIcon as any} size={80} color={categoryColor} />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            {item.brand ? <Text style={[styles.brand, { color: colors.accent }]}>{item.brand}</Text> : null}
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <View style={styles.infoRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                <Ionicons name="scale-outline" size={24} color="#E67E22" />
              </View>
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: colors.subText }]}>Poids</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{item.weight}</Text>
              </View>
            </View>

            {item.techInfo ? (
              <View style={[styles.infoRow, { marginTop: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }]}>
                <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                  <Ionicons name="information-circle-outline" size={24} color={colors.accent} />
                </View>
                <View style={styles.infoText}>
                  <Text style={[styles.infoLabel, { color: colors.subText }]}>Informations techniques</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{item.techInfo}</Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: -8,
  },
  actionBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666666',
    marginTop: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#FFFFFF',
  },
  imagePlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
  },
  titleSection: {
    marginBottom: 24,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333333',
    marginBottom: 8,
  },
  brand: {
    fontSize: 16,
    color: '#1D6DBF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    lineHeight: 22,
  },
});
