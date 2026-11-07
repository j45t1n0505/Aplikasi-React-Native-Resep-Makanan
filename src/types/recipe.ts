export const DIFFICULTIES = ['Mudah', 'Sedang', 'Menantang'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const RECIPE_CATEGORIES = [
  'Sapi',
  'Ayam',
  'Berkuah',
  'Cepat',
  'Sayur',
] as const;
export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];

export type IngredientItem = {
  id: string;
  label: string;
  note?: string;
};

export type IngredientGroup = {
  id: string;
  title: string;
  items: IngredientItem[];
};

export type EquipmentItem = {
  id: string;
  label: string;
  note?: string;
};

export type RecipeStep = {
  id: string;
  title: string;
  description: string;
  tip?: string;
  timerSeconds?: number;
  imagePosition?: 'top' | 'center' | 'bottom';
};

export type Recipe = {
  id: string;
  title: string;
  origin: string;
  tagline: string;
  description: string;
  image: number;
  durationMinutes: number;
  prepMinutes: number;
  difficulty: Difficulty;
  servings: number;
  category: RecipeCategory;
  tags: string[];
  accent: readonly [string, string];
  ingredientGroups: IngredientGroup[];
  equipment: EquipmentItem[];
  steps: RecipeStep[];
  tips: string[];
  /** Resep yang ditulis pengguna lewat layar "Tulis resep". */
  isCustom?: boolean;
  /** Kunci foto sampul untuk resep buatan pengguna. */
  coverId?: string;
  createdAt?: string;
};
