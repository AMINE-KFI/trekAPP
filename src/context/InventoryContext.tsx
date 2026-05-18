import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export type ThemeType = 'light' | 'dark' | 'automatic';
export type WeightUnit = 'kg' | 'g';

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  subText: string;
  border: string;
  primary: string;
  accent: string;
  danger: string;
}

export const lightColors: ThemeColors = {
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#333333',
  subText: '#8E8E93',
  border: '#EAEAEA',
  primary: '#34A853',
  accent: '#1D6DBF',
  danger: '#FF3B30',
};

export const darkColors: ThemeColors = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  subText: '#A0A0A5',
  border: '#2C2C2C',
  primary: '#34A853',
  accent: '#1D6DBF',
  danger: '#FF3B30',
};

export const CATEGORIES_META: Record<string, { icon: string, color: string }> = {
  "Abri": { icon: "home", color: "#34A853" },
  "Sommeil": { icon: "moon", color: "#1D6DBF" },
  "Vêtement": { icon: "shirt", color: "#9b59b6" },
  "Cuisine": { icon: "restaurant", color: "#E67E22" },
  "Électronique": { icon: "battery-charging", color: "#e74c3c" },
  "Hygiène": { icon: "water", color: "#00bcd4" },
  "Consommable": { icon: "fast-food", color: "#f1c40f" },
  "Autre": { icon: "cube", color: "#999999" }
};

export interface InventoryItem {
  id: string;
  name: string;
  weight: string;
  category: string;
  isConsumable: boolean;
  brand?: string;
  techInfo?: string;
  imageUri?: string;
}

export interface PackItem {
  item: InventoryItem;
  quantity: number;
}

export interface Pack {
  id: string;
  name: string;
  items: PackItem[];
}

export interface TrekChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Trek {
  id: string;
  name: string;
  date: string;
  packId: string;
  checklistItems: TrekChecklistItem[];
}

interface InventoryContextType {
  items: InventoryItem[];
  packs: Pack[];
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  colors: ThemeColors;
  weightUnit: WeightUnit;
  setWeightUnit: (u: WeightUnit) => void;
  formatDisplayWeight: (weightStr: string) => string;
  categories: string[];
  addCategory: (cat: string) => void;
  removeCategory: (cat: string) => void;
  addItem: (item: InventoryItem) => void;
  addPack: (name: string) => void;
  deletePack: (id: string) => void;
  updateItemQuantityInPack: (packId: string, item: InventoryItem, quantity: number) => void;
  updatePackName: (packId: string, newName: string) => void;
  updateTrekName: (trekId: string, newName: string) => void;
  deleteItem: (id: string) => void;
  updateItem: (id: string, updatedData: Partial<InventoryItem>) => void;
  clearAllData: () => Promise<void>;
  treks: Trek[];
  addTrek: (name: string, date: string, packId: string) => void;
  deleteTrek: (id: string) => void;
  toggleChecklistItem: (trekId: string, itemId: string) => void;
  addChecklistItem: (trekId: string, text: string) => void;
  removeChecklistItem: (trekId: string, itemId: string) => void;
  updateTrekPack: (trekId: string, newPackId: string) => void;
}

const InventoryContext = createContext<InventoryContextType>({
  items: [],
  packs: [],
  theme: 'automatic',
  setTheme: () => {},
  colors: lightColors,
  weightUnit: 'kg',
  setWeightUnit: () => {},
  formatDisplayWeight: (w) => w,
  categories: [],
  addCategory: () => {},
  removeCategory: () => {},
  addItem: () => {},
  addPack: () => {},
  deletePack: () => {},
  updateItemQuantityInPack: () => {},
  updatePackName: () => {},
  updateTrekName: () => {},
  deleteItem: () => {},
  updateItem: () => {},
  clearAllData: async () => {},
  treks: [],
  addTrek: () => {},
  deleteTrek: () => {},
  toggleChecklistItem: () => {},
  addChecklistItem: () => {},
  removeChecklistItem: () => {},
  updateTrekPack: () => {},
});

export const useInventory = () => useContext(InventoryContext);

const DEFAULT_ITEMS: InventoryItem[] = [
  { id: '1', name: 'Tente MSR Hubba', weight: '1.3 kg', category: 'Abri', isConsumable: false, brand: 'MSR', techInfo: 'Tente 2 places, 3 saisons' },
  { id: '2', name: 'Sac Osprey Exos', weight: '1.2 kg', category: 'Autre', isConsumable: false, brand: 'Osprey', techInfo: 'Volume 58L' },
  { id: '3', name: 'Veste Gore-Tex', weight: '0.4 kg', category: 'Vêtement', isConsumable: false, brand: 'Arc\'teryx', techInfo: 'Imperméabilité 28000mm' },
  { id: '4', name: 'Lyophilisé Pâtes', weight: '0.12 kg', category: 'Consommable', isConsumable: true, brand: 'Trek\'n Eat' },
];

const DEFAULT_CATEGORIES = ["Abri", "Sommeil", "Cuisine", "Vêtement", "Hygiène", "Consommable", "Autre"];

export const InventoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [theme, setThemeState] = useState<ThemeType>('automatic');
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>('kg');
  const [categories, setCategoriesState] = useState<string[]>(DEFAULT_CATEGORIES);
  const [treks, setTreks] = useState<Trek[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Derive active colors
  const systemColorScheme = Appearance.getColorScheme();
  const isDark = theme === 'dark' || (theme === 'automatic' && systemColorScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedItems = await AsyncStorage.getItem('@trekapp_items');
        const storedPacks = await AsyncStorage.getItem('@trekapp_packs');
        const storedTheme = await AsyncStorage.getItem('@trekapp_theme');
        const storedUnit = await AsyncStorage.getItem('@trekapp_weightUnit');
        const storedCats = await AsyncStorage.getItem('@trekapp_categories');
        const storedTreks = await AsyncStorage.getItem('@trekapp_treks');
        
        if (storedItems) setItems(JSON.parse(storedItems));
        else setItems(DEFAULT_ITEMS);

        if (storedPacks) setPacks(JSON.parse(storedPacks));
        if (storedTheme) setThemeState(storedTheme as ThemeType);
        if (storedUnit) setWeightUnitState(storedUnit as WeightUnit);
        if (storedCats) setCategoriesState(JSON.parse(storedCats));
        if (storedTreks) setTreks(JSON.parse(storedTreks));
      } catch (e) {
        console.error('Failed to load data', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem('@trekapp_items', JSON.stringify(items));
      AsyncStorage.setItem('@trekapp_packs', JSON.stringify(packs));
      AsyncStorage.setItem('@trekapp_theme', theme);
      AsyncStorage.setItem('@trekapp_weightUnit', weightUnit);
      AsyncStorage.setItem('@trekapp_categories', JSON.stringify(categories));
      AsyncStorage.setItem('@trekapp_treks', JSON.stringify(treks));
    }
  }, [items, packs, theme, weightUnit, categories, treks, isLoaded]);

  const setTheme = (t: ThemeType) => setThemeState(t);
  const setWeightUnit = (u: WeightUnit) => setWeightUnitState(u);

  const formatDisplayWeight = (weightStr: string) => {
    if (!weightStr) return '';
    // Assuming weightStr is stored internally as "1.5 kg" (from add-item logic)
    const numMatch = weightStr.match(/([0-9.,]+)/);
    if (!numMatch) return weightStr;
    const num = parseFloat(numMatch[1].replace(',', '.'));
    if (isNaN(num)) return weightStr;

    // Convert from kg to requested unit
    // Since we enforce formatWeightToKg in save, it's always in kg in the state.
    if (weightUnit === 'g') {
      return Math.round(num * 1000) + ' g';
    }
    return num + ' kg';
  };

  const addCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategoriesState(prev => [...prev, trimmed]);
    }
  };

  const removeCategory = (cat: string) => {
    setCategoriesState(prev => prev.filter(c => c !== cat));
  };

  const addItem = (item: InventoryItem) => setItems(prev => [item, ...prev]);
  const deleteItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id: string, updatedData: Partial<InventoryItem>) => setItems(prev => prev.map(i => i.id === id ? { ...i, ...updatedData } : i));

  const addTrek = (name: string, date: string, packId: string) => {
    setTreks(prev => [
      {
        id: Date.now().toString(),
        name,
        date,
        packId,
        checklistItems: []
      },
      ...prev
    ]);
  };

  const deleteTrek = (id: string) => {
    setTreks(prev => prev.filter(t => t.id !== id));
  };

  const toggleChecklistItem = (trekId: string, itemId: string) => {
    setTreks(prev => prev.map(t => {
      if (t.id === trekId) {
        return {
          ...t,
          checklistItems: t.checklistItems.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          )
        };
      }
      return t;
    }));
  };

  const addChecklistItem = (trekId: string, text: string) => {
    setTreks(prev => prev.map(t => {
      if (t.id === trekId) {
        return {
          ...t,
          checklistItems: [
            ...t.checklistItems,
            { id: Date.now().toString(), text, checked: false }
          ]
        };
      }
      return t;
    }));
  };

  const removeChecklistItem = (trekId: string, itemId: string) => {
    setTreks(prev => prev.map(t => {
      if (t.id === trekId) {
        return {
          ...t,
          checklistItems: t.checklistItems.filter(item => item.id !== itemId)
        };
      }
      return t;
    }));
  };

  const addPack = (name: string) => setPacks(prev => [{ id: Date.now().toString(), name, items: [] }, ...prev]);
  const deletePack = (id: string) => setPacks(prev => prev.filter(p => p.id !== id));
  const updateItemQuantityInPack = (packId: string, item: InventoryItem, quantity: number) => {
    setPacks(prev => prev.map(pack => {
      if (pack.id === packId) {
        if (quantity <= 0) return { ...pack, items: pack.items.filter(i => i.item.id !== item.id) };
        const exists = pack.items.some(i => i.item.id === item.id);
        if (exists) return { ...pack, items: pack.items.map(i => i.item.id === item.id ? { ...i, quantity } : i) };
        return { ...pack, items: [...pack.items, { item, quantity }] };
      }
      return pack;
    }));
  };

  const updatePackName = (packId: string, newName: string) => {
    setPacks(prev => prev.map(p => p.id === packId ? { ...p, name: newName } : p));
  };

  const updateTrekName = (trekId: string, newName: string) => {
    setTreks(prev => prev.map(t => t.id === trekId ? { ...t, name: newName } : t));
  };

  const updateTrekPack = (trekId: string, newPackId: string) => {
    setTreks(prev => prev.map(t => t.id === trekId ? { ...t, packId: newPackId } : t));
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.removeItem('@trekapp_items');
      await AsyncStorage.removeItem('@trekapp_packs');
      await AsyncStorage.removeItem('@trekapp_treks');
      setItems([]);
      setPacks([]);
      setTreks([]);
    } catch (e) {
      console.error('Failed to clear data', e);
    }
  };

  return (
    <InventoryContext.Provider value={{
      items, packs, theme, setTheme, colors, weightUnit, setWeightUnit, formatDisplayWeight, categories, addCategory, removeCategory,
      addItem, addPack, deletePack, updateItemQuantityInPack, updatePackName, updateTrekName, deleteItem, updateItem, clearAllData,
      treks, addTrek, deleteTrek, toggleChecklistItem, addChecklistItem, removeChecklistItem, updateTrekPack
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
