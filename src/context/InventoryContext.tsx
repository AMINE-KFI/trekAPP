import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

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
  "Neutre": { icon: "cube", color: "#999999" }
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
  moveCategory: (index: number, direction: 'up' | 'down') => void;
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
  moveCategory: () => {},
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
  { id: '2', name: 'Sac Osprey Exos', weight: '1.2 kg', category: 'Neutre', isConsumable: false, brand: 'Osprey', techInfo: 'Volume 58L' },
  { id: '3', name: 'Veste Gore-Tex', weight: '0.4 kg', category: 'Vêtement', isConsumable: false, brand: 'Arc\'teryx', techInfo: 'Imperméabilité 28000mm' },
  { id: '4', name: 'Lyophilisé Pâtes', weight: '0.12 kg', category: 'Consommable', isConsumable: true, brand: 'Trek\'n Eat' },
];

const DEFAULT_CATEGORIES = ["Abri", "Sommeil", "Cuisine", "Vêtement", "Hygiène", "Consommable", "Neutre"];

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

  const loadDataFromSupabase = async (user: any) => {
    try {
      // 1. Fetch Items
      const { data: dbItems, error: itemsErr } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id);
        
      if (itemsErr) {
        console.error('Error loading items:', itemsErr.message);
      } else if (dbItems) {
        const mappedItems = dbItems.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          weight: item.weight,
          category: item.category,
          isConsumable: item.is_consumable !== undefined ? item.is_consumable : (item.isConsumable || false),
          brand: item.brand,
          techInfo: item.tech_info !== undefined ? item.tech_info : item.techInfo,
          imageUri: item.image_uri !== undefined ? item.image_uri : item.imageUri,
        }));
        setItems(mappedItems);
      }

      // 2. Fetch Packs
      const { data: dbPacks, error: packsErr } = await supabase
        .from('packs')
        .select('*')
        .eq('user_id', user.id);

      if (packsErr) {
        console.error('Error loading packs:', packsErr.message);
      } else if (dbPacks) {
        const mappedPacks = dbPacks.map((p: any) => ({
          id: p.id.toString(),
          name: p.name,
          items: Array.isArray(p.items) ? p.items : (typeof p.items === 'string' ? JSON.parse(p.items) : []),
        }));
        setPacks(mappedPacks);
      }

      // 3. Fetch Treks
      const { data: dbTreks, error: treksErr } = await supabase
        .from('treks')
        .select('*')
        .eq('user_id', user.id);

      if (treksErr) {
        console.error('Error loading treks:', treksErr.message);
      } else if (dbTreks) {
        const mappedTreks = dbTreks.map((t: any) => ({
          id: t.id.toString(),
          name: t.name,
          date: t.date,
          packId: t.pack_id !== undefined ? t.pack_id?.toString() : t.packId?.toString(),
          checklistItems: Array.isArray(t.checklist_items) ? t.checklist_items : (typeof t.checklist_items === 'string' ? JSON.parse(t.checklist_items) : []),
        }));
        setTreks(mappedTreks);
      }

      // 4. Fetch Profile Settings
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        if (profile.theme) setThemeState(profile.theme as ThemeType);
        if (profile.weight_unit) setWeightUnitState(profile.weight_unit as WeightUnit);
        else if (profile.weightUnit) setWeightUnitState(profile.weightUnit as WeightUnit);
        
        if (profile.categories) {
          try {
            setCategoriesState(Array.isArray(profile.categories) ? profile.categories : JSON.parse(profile.categories));
          } catch (e) {
            console.error('Failed to parse categories:', e);
          }
        }
      }
    } catch (e) {
      console.error('Unexpected error loading data from Supabase:', e);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    let subscription: any = null;

    const setupAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadDataFromSupabase(session.user);
      } else {
        setIsLoaded(true);
      }

      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await loadDataFromSupabase(session.user);
        } else {
          setItems([]);
          setPacks([]);
          setTreks([]);
          setIsLoaded(true);
        }
      });
      subscription = sub;
    };

    setupAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const saveCategoriesToSupabase = async (cats: string[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ categories: cats }).eq('id', user.id);
    }
  };

  const setTheme = async (t: ThemeType) => {
    setThemeState(t);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ theme: t }).eq('id', user.id);
    }
  };

  const setWeightUnit = async (u: WeightUnit) => {
    setWeightUnitState(u);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ weight_unit: u, weightUnit: u }).eq('id', user.id);
    }
  };

  const formatDisplayWeight = (weightStr: string) => {
    if (!weightStr) return '';
    const numMatch = weightStr.match(/([0-9.,]+)/);
    if (!numMatch) return weightStr;
    const num = parseFloat(numMatch[1].replace(',', '.'));
    if (isNaN(num)) return weightStr;

    if (weightUnit === 'g') {
      return Math.round(num * 1000) + ' g';
    }
    return num + ' kg';
  };

  const addCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (trimmed && !categories.includes(trimmed)) {
      const newCats = [...categories, trimmed];
      setCategoriesState(newCats);
      saveCategoriesToSupabase(newCats);
    }
  };

  const removeCategory = (cat: string) => {
    const newCats = categories.filter(c => c !== cat);
    setCategoriesState(newCats);
    saveCategoriesToSupabase(newCats);
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    if (index < 0 || index >= categories.length) return;
    const nextCategories = [...categories];
    if (direction === 'up' && index > 0) {
      const temp = nextCategories[index];
      nextCategories[index] = nextCategories[index - 1];
      nextCategories[index - 1] = temp;
      setCategoriesState(nextCategories);
      saveCategoriesToSupabase(nextCategories);
    } else if (direction === 'down' && index < categories.length - 1) {
      const temp = nextCategories[index];
      nextCategories[index] = nextCategories[index + 1];
      nextCategories[index + 1] = temp;
      setCategoriesState(nextCategories);
      saveCategoriesToSupabase(nextCategories);
    }
  };

  const addItem = async (item: InventoryItem) => {
    setItems(prev => [item, ...prev]);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('items').insert({
        id: item.id,
        user_id: user.id,
        name: item.name,
        weight: item.weight,
        category: item.category,
        is_consumable: item.isConsumable,
        brand: item.brand,
        tech_info: item.techInfo,
        image_uri: item.imageUri,
      });

      if (error) {
        Alert.alert('Erreur', "Impossible de sauvegarder l'équipement sur le cloud : " + error.message);
        setItems(prev => prev.filter(i => i.id !== item.id));
      }
    }
  };

  const deleteItem = async (id: string) => {
    let previousItems: InventoryItem[] = [];
    setItems(prev => {
      previousItems = prev;
      return prev.filter(i => i.id !== id);
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        Alert.alert('Erreur', "Impossible de supprimer l'équipement du cloud : " + error.message);
        setItems(previousItems);
      }
    }
  };

  const updateItem = async (id: string, updatedData: Partial<InventoryItem>) => {
    let previousItems: InventoryItem[] = [];
    setItems(prev => {
      previousItems = prev;
      return prev.map(i => i.id === id ? { ...i, ...updatedData } : i);
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const dbData: any = {};
      if (updatedData.name !== undefined) dbData.name = updatedData.name;
      if (updatedData.weight !== undefined) dbData.weight = updatedData.weight;
      if (updatedData.category !== undefined) dbData.category = updatedData.category;
      if (updatedData.isConsumable !== undefined) dbData.is_consumable = updatedData.isConsumable;
      if (updatedData.brand !== undefined) dbData.brand = updatedData.brand;
      if (updatedData.techInfo !== undefined) dbData.tech_info = updatedData.techInfo;
      if (updatedData.imageUri !== undefined) dbData.image_uri = updatedData.imageUri;

      const { error } = await supabase
        .from('items')
        .update(dbData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        Alert.alert('Erreur', "Impossible de mettre à jour l'équipement sur le cloud : " + error.message);
        setItems(previousItems);
      }
    }
  };

  const addTrek = async (name: string, date: string, packId: string) => {
    const newTrek: Trek = {
      id: Date.now().toString(),
      name,
      date,
      packId,
      checklistItems: []
    };
    setTreks(prev => [newTrek, ...prev]);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('treks').insert({
        id: newTrek.id,
        user_id: user.id,
        name: newTrek.name,
        date: newTrek.date,
        pack_id: newTrek.packId,
        checklist_items: newTrek.checklistItems,
      });

      if (error) {
        Alert.alert('Erreur', "Impossible de créer la sortie sur le cloud : " + error.message);
        setTreks(prev => prev.filter(t => t.id !== newTrek.id));
      }
    }
  };

  const deleteTrek = async (id: string) => {
    let previousTreks: Trek[] = [];
    setTreks(prev => {
      previousTreks = prev;
      return prev.filter(t => t.id !== id);
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('treks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        Alert.alert('Erreur', "Impossible de supprimer la sortie du cloud : " + error.message);
        setTreks(previousTreks);
      }
    }
  };

  const toggleChecklistItem = async (trekId: string, itemId: string) => {
    let updatedTrek: Trek | null = null;
    let previousTreks: Trek[] = [];

    setTreks(prev => {
      previousTreks = prev;
      return prev.map(t => {
        if (t.id === trekId) {
          updatedTrek = {
            ...t,
            checklistItems: t.checklistItems.map(item =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            )
          };
          return updatedTrek;
        }
        return t;
      });
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user && updatedTrek) {
      const { error } = await supabase
        .from('treks')
        .update({ checklist_items: (updatedTrek as Trek).checklistItems })
        .eq('id', trekId)
        .eq('user_id', user.id);

      if (error) {
        Alert.alert('Erreur', "Impossible de mettre à jour la checklist sur le cloud : " + error.message);
        setTreks(previousTreks);
      }
    }
  };

  const addChecklistItem = async (trekId: string, text: string) => {
    let updatedTrek: Trek | null = null;
    let previousTreks: Trek[] = [];

    setTreks(prev => {
      previousTreks = prev;
      return prev.map(t => {
        if (t.id === trekId) {
          updatedTrek = {
            ...t,
            checklistItems: [
              ...t.checklistItems,
              { id: Date.now().toString(), text, checked: false }
            ]
          };
          return updatedTrek;
        }
        return t;
      });
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user && updatedTrek) {
      const { error } = await supabase
        .from('treks')
        .update({ checklist_items: (updatedTrek as Trek).checklistItems })
        .eq('id', trekId)
        .eq('user_id', user.id);

      if (error) {
        Alert.alert('Erreur', "Impossible d'ajouter l'élément sur le cloud : " + error.message);
        setTreks(previousTreks);
      }
    }
  };

  const removeChecklistItem = async (trekId: string, itemId: string) => {
    let updatedTrek: Trek | null = null;
    let previousTreks: Trek[] = [];

    setTreks(prev => {
      previousTreks = prev;
      return prev.map(t => {
        if (t.id === trekId) {
          updatedTrek = {
            ...t,
            checklistItems: t.checklistItems.filter(item => item.id !== itemId)
          };
          return updatedTrek;
        }
        return t;
      });
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user && updatedTrek) {
      const { error } = await supabase
        .from('treks')
        .update({ checklist_items: (updatedTrek as Trek).checklistItems })
        .eq('id', trekId)
        .eq('user_id', user.id);

      if (error) {
        Alert.alert('Erreur', "Impossible de supprimer l'élément du cloud : " + error.message);
        setTreks(previousTreks);
      }
    }
  };

  const addPack = async (name: string) => {
    const newPack: Pack = { id: Date.now().toString(), name, items: [] };
    setPacks(prev => [newPack, ...prev]);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('packs').insert({
        id: newPack.id,
        user_id: user.id,
        name: newPack.name,
        items: newPack.items,
      });

      if (error) {
        Alert.alert('Erreur', "Impossible de créer le sac sur le cloud : " + error.message);
        setPacks(prev => prev.filter(p => p.id !== newPack.id));
      }
    }
  };

  const deletePack = async (id: string) => {
    let previousPacks: Pack[] = [];
    setPacks(prev => {
      previousPacks = prev;
      return prev.filter(p => p.id !== id);
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('packs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        Alert.alert('Erreur', "Impossible de supprimer le sac du cloud : " + error.message);
        setPacks(previousPacks);
      }
    }
  };

  const updateItemQuantityInPack = async (packId: string, item: InventoryItem, quantity: number) => {
    let updatedPack: Pack | null = null;
    let previousPacks: Pack[] = [];

    setPacks(prev => {
      previousPacks = prev;
      return prev.map(pack => {
        if (pack.id === packId) {
          let newItems = [...pack.items];
          if (quantity <= 0) {
            newItems = newItems.filter(i => i.item.id !== item.id);
          } else {
            const exists = newItems.some(i => i.item.id === item.id);
            if (exists) {
              newItems = newItems.map(i => i.item.id === item.id ? { ...i, quantity } : i);
            } else {
              newItems.push({ item, quantity });
            }
          }
          updatedPack = { ...pack, items: newItems };
          return updatedPack;
        }
        return pack;
      });
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user && updatedPack) {
      const { error } = await supabase
        .from('packs')
        .update({ items: (updatedPack as Pack).items })
        .eq('id', packId)
        .eq('user_id', user.id);

      if (error) {
        Alert.alert('Erreur', "Impossible de mettre à jour le contenu du sac sur le cloud : " + error.message);
        setPacks(previousPacks);
      }
    }
  };

  const updatePackName = async (packId: string, newName: string) => {
    let previousPacks: Pack[] = [];
    setPacks(prev => {
      previousPacks = prev;
      return prev.map(p => p.id === packId ? { ...p, name: newName } : p);
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('packs')
        .update({ name: newName })
        .eq('id', packId)
        .eq('user_id', user.id);

      if (error) {
        Alert.alert('Erreur', "Impossible de renommer le sac sur le cloud : " + error.message);
        setPacks(previousPacks);
      }
    }
  };

  const updateTrekName = async (trekId: string, newName: string) => {
    let previousTreks: Trek[] = [];
    setTreks(prev => {
      previousTreks = prev;
      return prev.map(t => t.id === trekId ? { ...t, name: newName } : t);
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('treks')
        .update({ name: newName })
        .eq('id', trekId)
        .eq('user_id', user.id);

      if (error) {
        Alert.alert('Erreur', "Impossible de renommer la sortie sur le cloud : " + error.message);
        setTreks(previousTreks);
      }
    }
  };

  const updateTrekPack = async (trekId: string, newPackId: string) => {
    let previousTreks: Trek[] = [];
    setTreks(prev => {
      previousTreks = prev;
      return prev.map(t => t.id === trekId ? { ...t, packId: newPackId } : t);
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('treks')
        .update({ pack_id: newPackId })
        .eq('id', trekId)
        .eq('user_id', user.id);

      if (error) {
        Alert.alert('Erreur', "Impossible de lier le sac à la sortie sur le cloud : " + error.message);
        setTreks(previousTreks);
      }
    }
  };

  const clearAllData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: itemsErr } = await supabase.from('items').delete().eq('user_id', user.id);
        const { error: packsErr } = await supabase.from('packs').delete().eq('user_id', user.id);
        const { error: treksErr } = await supabase.from('treks').delete().eq('user_id', user.id);

        if (itemsErr || packsErr || treksErr) {
          Alert.alert('Erreur', "Une erreur est survenue lors de la réinitialisation sur le cloud.");
        }
      }
      setItems([]);
      setPacks([]);
      setTreks([]);
    } catch (e) {
      console.error('Failed to clear data', e);
    }
  };

  return (
    <InventoryContext.Provider value={{
      items, packs, theme, setTheme, colors, weightUnit, setWeightUnit, formatDisplayWeight, categories, addCategory, removeCategory, moveCategory,
      addItem, addPack, deletePack, updateItemQuantityInPack, updatePackName, updateTrekName, deleteItem, updateItem, clearAllData,
      treks, addTrek, deleteTrek, toggleChecklistItem, addChecklistItem, removeChecklistItem, updateTrekPack
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
