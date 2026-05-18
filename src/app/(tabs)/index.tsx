import { View, Text, StyleSheet, ScrollView, Pressable, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useInventory } from '../../context/InventoryContext';

export default function Dashboard() {
  const { items, packs, treks, colors } = useInventory();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Next upcoming trek is treks[0]
  const nextTrek = treks && treks.length > 0 ? treks[0] : null;
  const associatedPack = nextTrek ? packs.find(p => p.id === nextTrek.packId) : null;

  return (
    <ImageBackground
      source={require('../../../assets/images/20240724-trek3vallees-jour3-creuxnoirs-coldufruit-aiguilledufruit-tueda-lacduborgne-1920x1080-cc-lailafranchini-expinf-929 (Modifié).jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Couche d'assombrissement semi-transparente pour une lisibilité parfaite */}
      <ScrollView 
        style={styles.darkOverlay} 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 24 }]} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* Profile / Greeting Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Tableau de bord</Text>
            <Text style={styles.date}>Optimisez et préparez vos aventures</Text>
          </View>
          <Pressable 
            style={styles.profileBtn}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
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
        <Text style={styles.sectionTitle}>Statistiques Globales</Text>
        <View style={styles.statsGrid}>
          
          <Pressable 
            style={styles.statCard}
            onPress={() => router.push('/(tabs)/inventory')}
          >
            <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="shirt-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{items.length}</Text>
            <Text style={styles.statLabel}>Objets en armoire</Text>
          </Pressable>

          <Pressable 
            style={styles.statCard}
            onPress={() => router.push('/(tabs)/packs')}
          >
            <View style={[styles.statIconContainer, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="briefcase-outline" size={24} color={colors.accent} />
            </View>
            <Text style={styles.statValue}>{packs.length}</Text>
            <Text style={styles.statLabel}>Sacs à dos prêts</Text>
          </Pressable>
        </View>

        {/* Prochaine Sortie Shortcut */}
        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Prochaine Sortie</Text>
        
        {nextTrek ? (
          <Pressable 
            style={styles.trekCard}
            onPress={() => router.push('/(tabs)/treks')}
          >
            <View style={styles.trekHeader}>
              <View style={[styles.trekIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="compass" size={28} color={colors.primary} />
              </View>
              <View style={styles.trekMeta}>
                <Text style={styles.trekName}>{nextTrek.name}</Text>
                <Text style={styles.trekDate}>Planifié pour le {nextTrek.date}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#666666" />
            </View>

            <View style={styles.trekFooter}>
              <Ionicons name="briefcase-outline" size={18} color="#666666" style={styles.footerIcon} />
              <Text style={styles.trekFooterText}>
                Sac lié : <Text style={{ fontWeight: '700', color: '#222222' }}>{associatedPack ? associatedPack.name : 'Aucun'}</Text>
              </Text>
            </View>
          </Pressable>
        ) : (
          <Pressable 
            style={styles.emptyTrekCard}
            onPress={() => router.push('/(tabs)/treks')}
          >
            <View style={styles.emptyTrekLeft}>
              <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
              <View style={styles.emptyTrekText}>
                <Text style={styles.emptyTrekTitle}>Planifier une sortie</Text>
                <Text style={styles.emptyTrekSubtitle}>Aucune aventure prévue. Lancez-vous !</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </Pressable>
        )}

      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // 40% assombrissement pour la lisibilité
  },
  scrollContent: {
    paddingHorizontal: 24,
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
    color: '#FFFFFF', // Texte blanc premium
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  date: {
    fontSize: 14,
    marginTop: 4,
    color: 'rgba(255, 255, 255, 0.85)', // Blanc semi-transparent
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
    shadowOpacity: 0.15,
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
    color: '#FFFFFF', // Titre blanc premium
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Rendu semi-transparent Glassmorphism
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
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
    color: '#222222', // Texte sombre ultra-lisible
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
    color: '#666666', // Sous-texte sombre
  },
  trekCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Semi-transparent
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
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
    color: '#222222',
  },
  trekDate: {
    fontSize: 13,
    marginTop: 4,
    color: '#666666',
  },
  trekFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  footerIcon: {
    marginRight: 8,
  },
  trekFooterText: {
    fontSize: 13,
    color: '#666666',
  },
  emptyTrekCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Semi-transparent
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
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
    color: '#222222',
  },
  emptyTrekSubtitle: {
    fontSize: 13,
    marginTop: 2,
    color: '#666666',
  },
});
