import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { recipes } from '../data/recipes';
import type { Recipe } from '../types/recipe';
import { sanitizeCustomRecipe } from '../utils/customRecipe';

const STORAGE_KEY = '@dapur-nusa/app-state/v1';

type CookRecord = {
  count: number;
  lastCookedAt: string;
};

type PersistedState = {
  favorites: string[];
  hapticsEnabled: boolean;
  cookCount: number;
  cooked: Record<string, CookRecord>;
  checklists: Record<string, Record<string, boolean>>;
  customRecipes: Recipe[];
};

type DapurContextValue = PersistedState & {
  isReady: boolean;
  lastCookedRecipeId: string | null;
  allRecipes: Recipe[];
  isFavorite: (recipeId: string) => boolean;
  toggleFavorite: (recipeId: string) => void;
  toggleChecklistItem: (recipeId: string, itemId: string) => void;
  resetChecklist: (recipeId: string) => void;
  clearChecklistItems: (recipeId: string, itemIds: readonly string[]) => void;
  markCooked: (recipeId: string) => void;
  addCustomRecipe: (recipe: Recipe) => void;
  deleteCustomRecipe: (recipeId: string) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  resetAll: () => Promise<void>;
};

const defaultState: PersistedState = {
  favorites: [],
  hapticsEnabled: true,
  cookCount: 0,
  cooked: {},
  checklists: {},
  customRecipes: [],
};

const DapurContext = createContext<DapurContextValue | null>(null);

function sanitizeState(raw: unknown): PersistedState {
  if (!raw || typeof raw !== 'object') {
    return defaultState;
  }

  const candidate = raw as Partial<PersistedState>;
  const seenRecipeIds = new Set(recipes.map((recipe) => recipe.id));
  const customRecipes: Recipe[] = [];

  if (Array.isArray(candidate.customRecipes)) {
    candidate.customRecipes.slice(0, 100).forEach((rawRecipe) => {
      const recipe = sanitizeCustomRecipe(rawRecipe);
      if (recipe && !seenRecipeIds.has(recipe.id)) {
        seenRecipeIds.add(recipe.id);
        customRecipes.push(recipe);
      }
    });
  }

  const knownRecipeIds = new Set(seenRecipeIds);
  const favorites = Array.isArray(candidate.favorites)
    ? candidate.favorites.filter(
        (id): id is string =>
          typeof id === 'string' && knownRecipeIds.has(id)
      )
    : [];

  const cooked: Record<string, CookRecord> = {};
  if (candidate.cooked && typeof candidate.cooked === 'object') {
    Object.entries(candidate.cooked).forEach(([recipeId, record]) => {
      if (
        knownRecipeIds.has(recipeId) &&
        record &&
        typeof record === 'object' &&
        typeof record.count === 'number' &&
        typeof record.lastCookedAt === 'string'
      ) {
        cooked[recipeId] = {
          count: Math.max(0, record.count),
          lastCookedAt: record.lastCookedAt,
        };
      }
    });
  }

  const checklists: Record<string, Record<string, boolean>> = {};
  if (candidate.checklists && typeof candidate.checklists === 'object') {
    Object.entries(candidate.checklists).forEach(([recipeId, checklist]) => {
      if (
        knownRecipeIds.has(recipeId) &&
        checklist &&
        typeof checklist === 'object'
      ) {
        const entries = Object.entries(checklist).filter(
          ([, checked]) => checked === true
        );
        if (entries.length > 0) {
          checklists[recipeId] = Object.fromEntries(entries);
        }
      }
    });
  }

  return {
    favorites: Array.from(new Set(favorites)),
    hapticsEnabled:
      typeof candidate.hapticsEnabled === 'boolean'
        ? candidate.hapticsEnabled
        : true,
    cookCount:
      typeof candidate.cookCount === 'number'
        ? Math.max(0, candidate.cookCount)
        : Object.values(cooked).reduce((total, item) => total + item.count, 0),
    cooked,
    checklists,
    customRecipes,
  };
}

export function DapurProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<PersistedState>(defaultState);
  const [isReady, setIsReady] = useState(false);
  const hasHydrated = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (isMounted && stored) {
          setState(sanitizeState(JSON.parse(stored)));
        }
      } catch {
        // Data lokal rusak atau tidak dapat dibaca: mulai dari keadaan bersih.
      } finally {
        if (isMounted) {
          hasHydrated.current = true;
          setIsReady(true);
        }
      }
    }

    hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady || !hasHydrated.current) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {
      // Penyimpanan lokal bukan hal kritis; aplikasi tetap dapat dipakai.
    });
  }, [isReady, state]);

  const toggleFavorite = useCallback((recipeId: string) => {
    setState((current) => {
      const isSaved = current.favorites.includes(recipeId);
      return {
        ...current,
        favorites: isSaved
          ? current.favorites.filter((id) => id !== recipeId)
          : [recipeId, ...current.favorites],
      };
    });
  }, []);

  const isFavorite = useCallback(
    (recipeId: string) => state.favorites.includes(recipeId),
    [state.favorites]
  );

  const toggleChecklistItem = useCallback(
    (recipeId: string, itemId: string) => {
      setState((current) => {
        const recipeChecklist = current.checklists[recipeId] ?? {};
        const nextRecipeChecklist = {
          ...recipeChecklist,
          [itemId]: !recipeChecklist[itemId],
        };

        if (!nextRecipeChecklist[itemId]) {
          delete nextRecipeChecklist[itemId];
        }

        const nextChecklists = { ...current.checklists };
        if (Object.keys(nextRecipeChecklist).length === 0) {
          delete nextChecklists[recipeId];
        } else {
          nextChecklists[recipeId] = nextRecipeChecklist;
        }

        return { ...current, checklists: nextChecklists };
      });
    },
    []
  );

  const resetChecklist = useCallback((recipeId: string) => {
    setState((current) => {
      if (!current.checklists[recipeId]) {
        return current;
      }
      const nextChecklists = { ...current.checklists };
      delete nextChecklists[recipeId];
      return { ...current, checklists: nextChecklists };
    });
  }, []);

  const clearChecklistItems = useCallback(
    (recipeId: string, itemIds: readonly string[]) => {
      setState((current) => {
        const currentChecklist = current.checklists[recipeId];
        if (!currentChecklist) {
          return current;
        }

        const nextChecklist = { ...currentChecklist };
        itemIds.forEach((itemId) => {
          delete nextChecklist[itemId];
        });

        const nextChecklists = { ...current.checklists };
        if (Object.keys(nextChecklist).length === 0) {
          delete nextChecklists[recipeId];
        } else {
          nextChecklists[recipeId] = nextChecklist;
        }

        return { ...current, checklists: nextChecklists };
      });
    },
    []
  );

  const markCooked = useCallback((recipeId: string) => {
    setState((current) => {
      const existing = current.cooked[recipeId];
      return {
        ...current,
        cookCount: current.cookCount + 1,
        cooked: {
          ...current.cooked,
          [recipeId]: {
            count: (existing?.count ?? 0) + 1,
            lastCookedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  const addCustomRecipe = useCallback((recipe: Recipe) => {
    setState((current) => ({
      ...current,
      customRecipes: [
        recipe,
        ...current.customRecipes.filter((item) => item.id !== recipe.id),
      ].slice(0, 100),
    }));
  }, []);

  const deleteCustomRecipe = useCallback((recipeId: string) => {
    setState((current) => {
      if (!current.customRecipes.some((recipe) => recipe.id === recipeId)) {
        return current;
      }

      const cooked = { ...current.cooked };
      const removedCookCount = cooked[recipeId]?.count ?? 0;
      delete cooked[recipeId];

      const checklists = { ...current.checklists };
      delete checklists[recipeId];

      return {
        ...current,
        customRecipes: current.customRecipes.filter(
          (recipe) => recipe.id !== recipeId
        ),
        favorites: current.favorites.filter((id) => id !== recipeId),
        cooked,
        checklists,
        cookCount: Math.max(0, current.cookCount - removedCookCount),
      };
    });
  }, []);

  const setHapticsEnabled = useCallback((enabled: boolean) => {
    setState((current) => ({ ...current, hapticsEnabled: enabled }));
  }, []);

  const resetAll = useCallback(async () => {
    setState(defaultState);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Abaikan; state in-memory sudah kembali ke awal.
    }
  }, []);

  const lastCookedRecipeId = useMemo(() => {
    const entries = Object.entries(state.cooked);
    if (entries.length === 0) {
      return null;
    }
    entries.sort(
      ([, a], [, b]) =>
        new Date(b.lastCookedAt).getTime() - new Date(a.lastCookedAt).getTime()
    );
    return entries[0][0];
  }, [state.cooked]);

  // Resep buatan pengguna diletakkan di depan supaya langsung terlihat di
  // beranda dan pencarian tanpa harus menggulir koleksi bawaan.
  const allRecipes = useMemo(
    () => [...state.customRecipes, ...recipes],
    [state.customRecipes]
  );

  const value = useMemo<DapurContextValue>(
    () => ({
      ...state,
      isReady,
      lastCookedRecipeId,
      allRecipes,
      isFavorite,
      toggleFavorite,
      toggleChecklistItem,
      resetChecklist,
      clearChecklistItems,
      markCooked,
      addCustomRecipe,
      deleteCustomRecipe,
      setHapticsEnabled,
      resetAll,
    }),
    [
      state,
      isReady,
      lastCookedRecipeId,
      allRecipes,
      isFavorite,
      toggleFavorite,
      toggleChecklistItem,
      resetChecklist,
      clearChecklistItems,
      markCooked,
      addCustomRecipe,
      deleteCustomRecipe,
      setHapticsEnabled,
      resetAll,
    ]
  );

  return (
    <DapurContext.Provider value={value}>{children}</DapurContext.Provider>
  );
}

export function useDapur(): DapurContextValue {
  const context = useContext(DapurContext);
  if (!context) {
    throw new Error('useDapur harus dipakai di dalam DapurProvider');
  }
  return context;
}
