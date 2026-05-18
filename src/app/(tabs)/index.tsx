import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useInventory } from '../../context/InventoryContext';

export default function Dashboard() {
  const { items, packs, treks, colors } = useInventory();
  const router = useRouter();

  // Next upcoming trek is simply treks[0] (or sorted, but treks[0] represents the most recent/upcoming)
  const nextTrek = treks && treks.length > 0 ? treks[0] : null;
  const associatedPack = nextTrek ? packs.find(p => p.id === nextTrek.packId) : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile / Greeting Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.greeting, { color: colors.text }]}>Tableau de bord</Text>
            <Text style={[styles.date, { color: colors.subText }]}>Optimisez et préparez vos aventures</Text>
          </View>
          <Pressable 
            style={[styles.profileBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </Pressable>
        </View>

        {/* Premium Banner */}
        <View style={[styles.banner, { backgroundColor: colors.primary }]}>
          <Ionicons name="leaf" size={32} color="#FFFFFF" style={styles.bannerIcon} />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Prêt pour l'Antigravité ?</Text>
            <Text style={styles.bannerSubtitle}>Chaque gramme en moins est un kilomètre en plus.</Text>
          </View>
        </View>

        {/* Global Statistics Grid */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistiques Globales</Text>
        <View style={styles.statsGrid}>
          
          <Pressable 
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/inventory')}
          >
            <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="shirt-outline" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{items.length}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Objets en armoire</Text>
          </Pressable>

          <Pressable 
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/packs')}
          >
            <View style={[styles.statIconContainer, { backgroundColor: colors.accent + '15' }]}>
              <Ionicons name="briefcase-outline" size={24} color={colors.accent} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{packs.length}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Sacs à dos prêts</Text>
          </Pressable>
        </View>

        {/* Prochaine Sortie Shortcut */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 28 }]}>Prochaine Sortie</Text>
        
        {nextTrek ? (
          <Pressable 
            style={[styles.trekCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/treks')}
          >
            <View style={styles.trekHeader}>
              <View style={[styles.trekIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="compass" size={28} color={colors.primary} />
              </View>
              <View style={styles.trekMeta}>
                <Text style={[styles.trekName, { color: colors.text }]}>{nextTrek.name}</Text>
                <Text style={[styles.trekDate, { color: colors.subText }]}>Planifié pour le {nextTrek.date}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.subText} />
            </View>

            <View style={[styles.trekFooter, { borderTopColor: colors.border }]}>
              <Ionicons name="briefcase-outline" size={18} color={colors.subText} style={styles.footerIcon} />
              <Text style={[styles.trekFooterText, { color: colors.subText }]}>
                Sac lié : <Text style={{ fontWeight: '700', color: colors.text }}>{associatedPack ? associatedPack.name : 'Aucun'}</Text>
              </Text>
            </View>
          </Pressable>
        ) : (
          <Pressable 
            style={[styles.emptyTrekCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/treks')}
          >
            <View style={styles.emptyTrekLeft}>
              <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
              <View style={styles.emptyTrekText}>
                <Text style={[styles.emptyTrekTitle, { color: colors.text }]}>Planifier une sortie</Text>
                <Text style={[styles.emptyTrekSubtitle, { color: colors.subText }]}>Aucune aventure prévue. Lancez-vous !</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.subText} />
          </Pressable>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
  },
  date: {
    fontSize: 14,
    marginTop: 4,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  banner: {
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  bannerIcon: {
    marginRight: 16,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  trekCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  trekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  trekIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 18,
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
  trekFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  footerIcon: {
    marginRight: 8,
  },
  trekFooterText: {
    fontSize: 13,
  },
  emptyTrekCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyTrekLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  emptyTrekText: {
    flex: 1,
  },
  emptyTrekTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyTrekSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
