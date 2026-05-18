import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useInventory, CATEGORIES_META } from '../context/InventoryContext';
import { supabase } from '../lib/supabase';

const isLocalUri = (uri: string) => {
  if (!uri) return false;
  return uri.startsWith('file:') || uri.startsWith('content:') || !uri.startsWith('http');
};

const getCategoryIcon = (catName: string) => {
  const meta = CATEGORIES_META[catName];
  if (meta) return meta.icon;

  const normalized = catName.toLowerCase();
  if (normalized.includes('sac') || normalized.includes('dos') || normalized.includes('pack')) {
    return 'briefcase';
  }
  if (normalized.includes('abri') || normalized.includes('tente')) {
    return 'home';
  }
  if (normalized.includes('vêtement') || normalized.includes('veste') || normalized.includes('pantalon') || normalized.includes('habit')) {
    return 'shirt';
  }
  if (normalized.includes('sommeil') || normalized.includes('duvet') || normalized.includes('matelas')) {
    return 'moon';
  }
  if (normalized.includes('cuisine') || normalized.includes('repas') || normalized.includes('manger')) {
    return 'restaurant';
  }
  if (normalized.includes('secu') || normalized.includes('premiers') || normalized.includes('soin')) {
    return 'shield';
  }
  if (normalized.includes('hygiène') || normalized.includes('douche') || normalized.includes('savon')) {
    return 'water';
  }
  if (normalized.includes('conso') || normalized.includes('nourriture') || normalized.includes('eau')) {
    return 'fast-food';
  }
  return 'cube';
};

export default function AddItem() {
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId: string }>();
  const { items, addItem, updateItem, colors, categories } = useInventory();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [weight, setWeight] = useState('');
  const [techInfo, setTechInfo] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState('Neutre');
  const [isConsumable, setIsConsumable] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('matériel randonnée');

  const pickImage = async () => {
    Alert.alert(
      "Ajouter une photo",
      "Choisissez le mode de capture :",
      [
        {
          text: "Prendre une photo",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert("Permission requise", "Nous avons besoin de l'accès à l'appareil photo pour prendre une photo.");
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });
            if (!result.canceled) {
              setImageUri(result.assets[0].uri);
            }
          }
        },
        {
          text: "Choisir depuis la galerie",
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert("Permission requise", "Nous avons besoin de l'accès à la galerie pour choisir une photo.");
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });
            if (!result.canceled) {
              setImageUri(result.assets[0].uri);
            }
          }
        },
        {
          text: "Annuler",
          style: "cancel"
        }
      ]
    );
  };

  const handleOpenScanner = async () => {
    if (!permission) return;
    if (!permission.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        // Will be managed inside the modal content UI
      }
    }
    setScanned(false);
    setIsScannerOpen(true);
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setSearchQuery(data);
    setIsScannerOpen(false);
    setIsBrowserOpen(true);
  };

  useEffect(() => {
    if (editId) {
      const itemToEdit = items.find(i => i.id === editId);
      if (itemToEdit) {
        setName(itemToEdit.name);
        setBrand(itemToEdit.brand || '');
        setWeight(itemToEdit.weight);
        setTechInfo(itemToEdit.techInfo || '');
        setImageUri(itemToEdit.imageUri || null);
        setCategory(itemToEdit.category);
        setIsConsumable(itemToEdit.isConsumable);
      }
    }
  }, [editId, items]);

  const extractScript = `
    (function() {
      try {
        let image = '';
        let title = document.title || '';
        let brand = '';
        let weight = '';
        let techInfo = '';
        
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) image = ogImage.content;
        
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) title = ogTitle.content;

        // Extraire la description (Infos techniques)
        const ogDesc = document.querySelector('meta[property="og:description"]') || document.querySelector('meta[name="description"]');
        if (ogDesc) techInfo = ogDesc.content;

        // Extraire la marque (Brand)
        const metaBrand = document.querySelector('meta[property="product:brand"]') || document.querySelector('meta[itemprop="brand"]');
        if (metaBrand) brand = metaBrand.content;
        
        // Extraire le poids (Recherche de mots-clés "poids" et regex "kg" / "g")
        const bodyText = document.body.innerText || '';
        const weightMatch = bodyText.match(/(?:poids|weight)[^0-9]*([0-9]+[,.]?[0-9]*)\\s*(kg|g)/i);
        if (weightMatch) {
          weight = weightMatch[1] + ' ' + weightMatch[2].toLowerCase();
        } else {
          // Fallback moins strict si "poids" n'est pas sur la même ligne
          const lightMatch = bodyText.match(/\\b([0-9]+[,.]?[0-9]*)\\s*(kg|g)\\b/i);
          if (lightMatch && parseFloat(lightMatch[1]) < 10000) { 
             weight = lightMatch[1] + ' ' + lightMatch[2].toLowerCase();
          }
        }
        
        window.ReactNativeWebView.postMessage(JSON.stringify({ image, title, brand, weight, techInfo }));
      } catch (e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ error: e.message }));
      }
    })();
    true;
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.error) {
        Alert.alert('Erreur', "Impossible d'extraire les données depuis cette page.");
        return;
      }
      
      if (data.title) setName(data.title.substring(0, 50));
      if (data.image) setImageUri(data.image);
      if (data.brand) setBrand(data.brand.substring(0, 30));
      if (data.weight) setWeight(data.weight);
      if (data.techInfo) setTechInfo(data.techInfo.substring(0, 150));
      
      setIsBrowserOpen(false);
      setShowSuccessMsg(true);
      setTimeout(() => setShowSuccessMsg(false), 3000);
      Alert.alert('Produit importé !', "Vérifiez que le poids et les informations sont corrects.");
    } catch (e) {
      console.log('Error parsing WebView message', e);
    }
  };

  const formatWeightToKg = (input: string): string => {
    let w = input.replace(/,/g, '.').replace(/\\s/g, '').toLowerCase();
    let num = parseFloat(w);
    if (isNaN(num)) return input;

    if (w.endsWith('kg')) {
      return num + ' kg';
    } else if (w.endsWith('g')) {
      return (num / 1000) + ' kg';
    } else {
      return num + ' kg';
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Erreur", "Vous devez être connecté pour uploader des images.");
        return null;
      }

      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from('equipments')
        .upload(filePath, blob, {
          contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
          upsert: true
        });

      if (error) {
        console.error("Storage upload error:", error);
        Alert.alert("Erreur lors de l'envoi de l'image", "Impossible d'enregistrer l'image sur le serveur.");
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('equipments')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error("Unexpected upload error:", err);
      Alert.alert("Erreur lors de l'envoi de l'image", "Une erreur est survenue pendant l'envoi de l'image.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name || !weight) {
      Alert.alert('Erreur', 'Le nom et le poids sont obligatoires.');
      return;
    }

    const formattedWeight = formatWeightToKg(weight);
    let finalImageUri = imageUri;

    if (imageUri && isLocalUri(imageUri)) {
      const uploadedUrl = await uploadImage(imageUri);
      if (!uploadedUrl) {
        return;
      }
      finalImageUri = uploadedUrl;
    }
    
    const data = {
      name,
      brand,
      weight: formattedWeight,
      techInfo,
      category,
      isConsumable,
      imageUri: finalImageUri || undefined,
    };

    if (editId) {
      updateItem(editId, data);
    } else {
      addItem({
        id: Date.now().toString(),
        ...data,
      });
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{editId ? "Modifier l'objet" : "Nouvel Objet"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Recherche via In-App Browser & Scanner */}
        <View style={styles.searchSection}>
          <View style={{ gap: 10 }}>
            <Pressable 
              style={[styles.browserBtn, { backgroundColor: colors.accent, shadowColor: colors.accent }]} 
              onPress={() => {
                setSearchQuery('matériel randonnée');
                setIsBrowserOpen(true);
              }}
            >
              <Ionicons name="search" size={20} color="#FFFFFF" />
              <Text style={styles.browserBtnText}>Rechercher un produit sur le Web</Text>
            </Pressable>

            <Pressable 
              style={[styles.browserBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
              onPress={handleOpenScanner}
            >
              <Ionicons name="barcode-outline" size={20} color="#FFFFFF" />
              <Text style={styles.browserBtnText}>Scanner un code-barres</Text>
            </Pressable>
          </View>

          {showSuccessMsg && (
            <View style={styles.successMessage}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={[styles.successMessageText, { color: colors.primary }]}>Produit extrait avec succès !</Text>
            </View>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Pressable style={[styles.imagePicker, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={40} color={colors.accent} />
              <Text style={[styles.imagePickerText, { color: colors.accent }]}>Ajouter une photo</Text>
            </>
          )}
        </Pressable>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Catégorie</Text>
          <Pressable 
            style={[styles.dropdownSelector, { backgroundColor: colors.card, borderColor: colors.border }]} 
            onPress={() => setIsDropdownVisible(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name={getCategoryIcon(category) as any} size={20} color={colors.primary} />
              <Text style={{ color: colors.text, fontSize: 16 }}>{category}</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={colors.subText} />
          </Pressable>
        </View>

        <View style={[styles.switchGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.switchLabel}>
            <Text style={[styles.label, { color: colors.text }]}>C'est un consommable</Text>
            <Text style={[styles.subLabel, { color: colors.subText }]}>(Eau, Nourriture, Gaz)</Text>
          </View>
          <Switch
            value={isConsumable}
            onValueChange={setIsConsumable}
            trackColor={{ false: colors.border, true: colors.primary + '60' }}
            thumbColor={isConsumable ? colors.primary : '#FFFFFF'}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Nom de l'équipement *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Ex: Tente Hubba Hubba"
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.subText}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Marque</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Ex: MSR"
            value={brand}
            onChangeText={setBrand}
            placeholderTextColor={colors.subText}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Poids *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Ex: 1.3 kg"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholderTextColor={colors.subText}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Informations techniques</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Ex: 2 places, 3 saisons, imperméabilité 3000mm..."
            value={techInfo}
            onChangeText={setTechInfo}
            multiline
            numberOfLines={4}
            placeholderTextColor={colors.subText}
          />
        </View>

        <Pressable style={[styles.saveButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Enregistrer l'objet</Text>
        </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* WebView Modal pour le Scraping */}
      <Modal visible={isBrowserOpen} animationType="slide" onRequestClose={() => setIsBrowserOpen(false)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Pressable style={styles.modalCloseBtn} onPress={() => setIsBrowserOpen(false)}>
              <Text style={[styles.modalCancelText, { color: colors.subText }]}>Annuler</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Moteur de recherche</Text>
            <Pressable 
              style={[styles.modalExtractBtn, { backgroundColor: colors.primary }]} 
              onPress={() => webViewRef.current?.injectJavaScript(extractScript)}
            >
              <Ionicons name="download-outline" size={18} color="#FFFFFF" />
              <Text style={styles.modalExtractText}>Extraire</Text>
            </Pressable>
          </View>
          <WebView
            ref={webViewRef}
            source={{ uri: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(searchQuery)}` }}
            onMessage={handleWebViewMessage}
            style={styles.webview}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.webviewLoader}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* Scanner Modal pour les Codes-barres */}
      <Modal 
        visible={isScannerOpen} 
        animationType="slide" 
        onRequestClose={() => setIsScannerOpen(false)}
      >
        {permission && !permission.granted ? (
          <SafeAreaView style={[styles.scannerModalContainer, { backgroundColor: '#121212' }]}>
            <View style={styles.permissionContainer}>
              <Ionicons name="camera-outline" size={64} color={colors.primary} style={{ marginBottom: 20 }} />
              <Text style={styles.permissionTitle}>Accès à l'appareil photo requis</Text>
              <Text style={styles.permissionDesc}>
                Nous avons besoin de votre autorisation pour utiliser l'appareil photo afin de scanner le code-barres de vos équipements.
              </Text>
              <Pressable style={[styles.permissionBtn, { backgroundColor: colors.primary }]} onPress={requestPermission}>
                <Text style={styles.permissionBtnText}>Autoriser la caméra</Text>
              </Pressable>
            </View>
            <Pressable style={styles.scannerCloseBtn} onPress={() => setIsScannerOpen(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
          </SafeAreaView>
        ) : (
          <View style={[styles.scannerModalContainer, { backgroundColor: '#000000', flex: 1 }]}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              barcodeScannerSettings={{
                barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39', 'upc_a', 'upc_e'],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />
            <View style={styles.scannerOverlay}>
              <View style={styles.scanTargetFrame} />
              <Text style={styles.scanTargetText}>Placez le code-barres dans le cadre</Text>
            </View>
            <Pressable style={styles.scannerCloseBtn} onPress={() => setIsScannerOpen(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
      </Modal>

      {/* Modal Dropdown pour la Catégorie (Style Antigravyty) */}
      <Modal visible={isDropdownVisible} transparent animationType="fade" onRequestClose={() => setIsDropdownVisible(false)}>
        <Pressable style={styles.dropdownModalOverlay} onPress={() => setIsDropdownVisible(false)}>
          <Pressable style={[styles.dropdownModalContent, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.dropdownModalTitle, { color: colors.text }]}>Sélectionner une catégorie</Text>
            <ScrollView style={{ marginVertical: 12 }} showsVerticalScrollIndicator={false}>
              {categories.map((catName) => {
                const iconName = getCategoryIcon(catName);
                const isSelected = category === catName;
                return (
                  <Pressable
                    key={catName}
                    style={({ pressed }) => [
                      styles.dropdownFilterItem,
                      {
                        backgroundColor: isSelected ? colors.primary + '15' : colors.background,
                        borderColor: isSelected ? colors.primary : colors.border,
                        opacity: pressed ? 0.7 : 1
                      }
                    ]}
                    onPress={() => {
                      setCategory(catName);
                      setIsDropdownVisible(false);
                    }}
                  >
                    <Ionicons name={iconName as any} size={20} color={isSelected ? colors.primary : colors.subText} />
                    <Text style={[styles.dropdownFilterItemText, { color: colors.text, fontWeight: isSelected ? '700' : '500' }]}>
                      {catName}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable style={[styles.dropdownModalCancelBtn, { backgroundColor: colors.border }]} onPress={() => setIsDropdownVisible(false)}>
              <Text style={[styles.dropdownModalCancelText, { color: colors.text, textAlign: 'center' }]}>Fermer</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {isUploading && (
        <View style={styles.uploadOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.uploadOverlayText, { color: '#FFFFFF' }]}>Envoi de l'image en cours...</Text>
        </View>
      )}
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
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  searchSection: {
    marginBottom: 24,
  },
  browserBtn: {
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
  browserBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  successMessageText: {
    marginLeft: 8,
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginBottom: 24,
  },
  imagePicker: {
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#EAEAEA',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePickerText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1D6DBF',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  textArea: {
    height: 100,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#34A853',
    height: 56,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#34A853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  dropdownSelector: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dropdownModalContent: {
    width: '90%',
    maxHeight: '60%',
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  dropdownModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  dropdownModalCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  dropdownModalCancelText: {
    fontWeight: '600',
  },
  dropdownFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  dropdownFilterItemText: {
    fontSize: 14,
    flex: 1,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  switchLabel: {
    flex: 1,
  },
  subLabel: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  modalCloseBtn: {
    padding: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666666',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  modalExtractBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34A853',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalExtractText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  webview: {
    flex: 1,
  },
  webviewLoader: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  // Camera Scanner Modal Styles
  scannerModalContainer: {
    flex: 1,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanTargetFrame: {
    width: 280,
    height: 180,
    borderWidth: 2,
    borderColor: '#34A853',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  scanTargetText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  scannerCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionDesc: {
    color: '#A0A0A5',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  permissionBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  permissionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  uploadOverlayText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
});
