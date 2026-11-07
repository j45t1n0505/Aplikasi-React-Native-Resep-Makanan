import {
  categoryAccents,
  getRecipeCover,
  type RecipeCoverId,
} from '../data/covers';
import {
  DIFFICULTIES,
  RECIPE_CATEGORIES,
  type Difficulty,
  type EquipmentItem,
  type IngredientGroup,
  type IngredientItem,
  type Recipe,
  type RecipeCategory,
  type RecipeStep,
} from '../types/recipe';

export type CustomRecipeDraft = {
  title: string;
  origin: string;
  tagline: string;
  description: string;
  coverId: RecipeCoverId;
  category: RecipeCategory;
  difficulty: Difficulty;
  durationMinutes: number;
  servings: number;
  tags: string[];
  ingredients: { label: string; note?: string }[];
  equipment: { label: string; note?: string }[];
  steps: {
    title: string;
    description: string;
    tip?: string;
    timerSeconds?: number;
  }[];
  tips: string[];
};

export type CustomRecipeField =
  | 'title'
  | 'origin'
  | 'description'
  | 'ingredients'
  | 'steps'
  | 'duration'
  | 'servings';

export type CustomRecipeErrors = Partial<Record<CustomRecipeField, string>>;

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === 'string'
    ? value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
    : '';
}

function cleanMultiline(value: unknown, maxLength: number): string {
  return typeof value === 'string'
    ? value.trim().slice(0, maxLength)
    : '';
}

function positiveNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function uniqueStrings(values: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(values)) {
    return [];
  }
  const seen = new Set<string>();
  const result: string[] = [];
  values.forEach((value) => {
    const text = cleanText(value, maxLength);
    const key = text.toLowerCase();
    if (text && !seen.has(key) && result.length < maxItems) {
      seen.add(key);
      result.push(text);
    }
  });
  return result;
}

export function validateCustomRecipeDraft(
  draft: CustomRecipeDraft
): CustomRecipeErrors {
  const errors: CustomRecipeErrors = {};

  if (draft.title.trim().length < 2) {
    errors.title = 'Nama resep minimal 2 karakter.';
  }

  if (draft.origin.trim().length < 2) {
    errors.origin = 'Isi daerah asal atau beri nama dapurmu.';
  }

  if (draft.description.trim().length < 10) {
    errors.description = 'Tulis cerita singkat, minimal 10 karakter.';
  }

  const ingredients = draft.ingredients.filter(
    (item) => item.label.trim() || item.note?.trim()
  );
  if (ingredients.length === 0) {
    errors.ingredients = 'Tambahkan minimal satu bahan.';
  } else if (ingredients.some((item) => !item.label.trim())) {
    errors.ingredients = 'Setiap baris bahan perlu nama bahan.';
  }

  const steps = draft.steps.filter(
    (step) => step.title.trim() || step.description.trim() || step.tip?.trim()
  );
  if (steps.length === 0) {
    errors.steps = 'Tambahkan minimal satu langkah memasak.';
  } else if (
    steps.some((step) => !step.title.trim() || !step.description.trim())
  ) {
    errors.steps = 'Lengkapi judul dan deskripsi setiap langkah.';
  } else if (
    steps.some(
      (step) =>
        typeof step.timerSeconds === 'number' &&
        (!Number.isFinite(step.timerSeconds) || step.timerSeconds <= 0)
    )
  ) {
    errors.steps = 'Timer langkah harus lebih dari 0 menit.';
  }

  if (
    !Number.isFinite(draft.durationMinutes) ||
    draft.durationMinutes <= 0
  ) {
    errors.duration = 'Isi total waktu lebih dari 0 menit.';
  } else if (draft.durationMinutes > 1440) {
    errors.duration = 'Total waktu maksimal 24 jam.';
  }

  if (!Number.isFinite(draft.servings) || draft.servings <= 0) {
    errors.servings = 'Isi jumlah porsi lebih dari 0.';
  } else if (draft.servings > 99) {
    errors.servings = 'Jumlah porsi maksimal 99.';
  }

  return errors;
}

function createRecipeId(): string {
  return `custom-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function createCustomRecipe(draft: CustomRecipeDraft): Recipe {
  const id = createRecipeId();
  const cover = getRecipeCover(draft.coverId);

  const ingredientItems: IngredientItem[] = draft.ingredients
    .filter((item) => item.label.trim())
    .map((item, index) => {
      const note = item.note?.trim();
      return {
        id: `${id}-bahan-${index + 1}`,
        label: item.label.trim().slice(0, 120),
        ...(note ? { note: note.slice(0, 160) } : {}),
      };
    });

  const equipment: EquipmentItem[] = draft.equipment
    .filter((item) => item.label.trim())
    .map((item, index) => {
      const note = item.note?.trim();
      return {
        id: `${id}-alat-${index + 1}`,
        label: item.label.trim().slice(0, 120),
        ...(note ? { note: note.slice(0, 160) } : {}),
      };
    });

  const steps: RecipeStep[] = draft.steps
    .filter((step) => step.title.trim() && step.description.trim())
    .map((step, index) => {
      const tip = step.tip?.trim();
      return {
        id: `${id}-langkah-${index + 1}`,
        title: step.title.trim().slice(0, 90),
        description: step.description.trim().slice(0, 1500),
        ...(tip ? { tip: tip.slice(0, 400) } : {}),
        ...(step.timerSeconds && step.timerSeconds > 0
          ? { timerSeconds: Math.round(step.timerSeconds) }
          : {}),
      };
    });

  const tags = uniqueStrings(draft.tags, 8, 30);
  const tips = uniqueStrings(draft.tips, 10, 400);
  const category = draft.category;
  const description =
    draft.description.trim().slice(0, 1500) ||
    'Resep buatan sendiri yang disimpan di perangkat ini.';

  return {
    id,
    title: draft.title.trim().slice(0, 90),
    origin: draft.origin.trim().slice(0, 70),
    tagline:
      draft.tagline.trim().slice(0, 140) || 'Resep buatan sendiri.',
    description,
    image: cover.image,
    durationMinutes: Math.round(draft.durationMinutes),
    prepMinutes: 0,
    difficulty: draft.difficulty,
    servings: Math.round(draft.servings),
    category,
    tags: tags.length > 0 ? tags : ['Resep sendiri'],
    accent: categoryAccents[category],
    ingredientGroups: [
      {
        id: `${id}-grup-bahan`,
        title: 'Bahan-bahan',
        items: ingredientItems,
      },
    ],
    equipment,
    steps,
    tips,
    isCustom: true,
    coverId: cover.id,
    createdAt: new Date().toISOString(),
  };
}

function sanitizeItems(
  rawItems: unknown,
  prefix: string,
  usedIds: Set<string>
): IngredientItem[] {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  const items: IngredientItem[] = [];
  rawItems.slice(0, 60).forEach((rawItem, index) => {
    if (!rawItem || typeof rawItem !== 'object') {
      return;
    }
    const candidate = rawItem as Record<string, unknown>;
    const label = cleanText(candidate.label, 120);
    if (!label) {
      return;
    }

    let itemId = cleanText(candidate.id, 80) || `${prefix}-${index + 1}`;
    let suffix = 2;
    while (usedIds.has(itemId)) {
      itemId = `${prefix}-${index + 1}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(itemId);

    const note = cleanMultiline(candidate.note, 160);
    items.push({
      id: itemId,
      label,
      ...(note ? { note } : {}),
    });
  });

  return items;
}

/**
 * Membersihkan resep buatan pengguna yang dibaca dari AsyncStorage. Data bisa
 * saja rusak karena versi aplikasi lama, edit manual, atau penyimpanan penuh;
 * resep yang tidak valid dilewati, bukan membuat seluruh state gagal dimuat.
 */
export function sanitizeCustomRecipe(raw: unknown): Recipe | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const candidate = raw as Record<string, unknown>;
  const id = cleanText(candidate.id, 80);
  if (!id.startsWith('custom-')) {
    return null;
  }

  const title = cleanText(candidate.title, 90);
  const origin = cleanText(candidate.origin, 70);
  const durationMinutes = positiveNumber(candidate.durationMinutes);
  const servings = positiveNumber(candidate.servings);

  if (!title || !origin || !durationMinutes || !servings) {
    return null;
  }

  const usedItemIds = new Set<string>();
  const groups: IngredientGroup[] = [];
  if (Array.isArray(candidate.ingredientGroups)) {
    candidate.ingredientGroups.slice(0, 10).forEach((rawGroup, index) => {
      if (!rawGroup || typeof rawGroup !== 'object') {
        return;
      }
      const group = rawGroup as Record<string, unknown>;
      const items = sanitizeItems(
        group.items,
        `${id}-bahan-${index + 1}`,
        usedItemIds
      );
      if (items.length === 0) {
        return;
      }
      groups.push({
        id: cleanText(group.id, 80) || `${id}-grup-${index + 1}`,
        title: cleanText(group.title, 60) || 'Bahan-bahan',
        items,
      });
    });
  }

  if (groups.length === 0) {
    return null;
  }

  const usedStepIds = new Set<string>();
  const steps: RecipeStep[] = [];
  if (Array.isArray(candidate.steps)) {
    candidate.steps.slice(0, 40).forEach((rawStep, index) => {
      if (!rawStep || typeof rawStep !== 'object') {
        return;
      }
      const step = rawStep as Record<string, unknown>;
      const stepTitle = cleanText(step.title, 90);
      const description = cleanMultiline(step.description, 1500);
      if (!stepTitle || !description) {
        return;
      }

      let stepId =
        cleanText(step.id, 80) || `${id}-langkah-${index + 1}`;
      let suffix = 2;
      while (usedStepIds.has(stepId)) {
        stepId = `${id}-langkah-${index + 1}-${suffix}`;
        suffix += 1;
      }
      usedStepIds.add(stepId);

      const timerSeconds = positiveNumber(step.timerSeconds);
      const tip = cleanMultiline(step.tip, 400);
      const imagePosition =
        step.imagePosition === 'top' ||
        step.imagePosition === 'bottom' ||
        step.imagePosition === 'center'
          ? step.imagePosition
          : undefined;

      steps.push({
        id: stepId,
        title: stepTitle,
        description,
        ...(tip ? { tip } : {}),
        ...(timerSeconds && timerSeconds <= 86400
          ? { timerSeconds: Math.round(timerSeconds) }
          : {}),
        ...(imagePosition ? { imagePosition } : {}),
      });
    });
  }

  if (steps.length === 0) {
    return null;
  }

  const equipment = sanitizeItems(
    candidate.equipment,
    `${id}-alat`,
    new Set<string>()
  );

  const category = RECIPE_CATEGORIES.includes(
    candidate.category as RecipeCategory
  )
    ? (candidate.category as RecipeCategory)
    : 'Cepat';
  const difficulty = DIFFICULTIES.includes(
    candidate.difficulty as Difficulty
  )
    ? (candidate.difficulty as Difficulty)
    : 'Mudah';
  const cover = getRecipeCover(candidate.coverId);
  const createdAt =
    typeof candidate.createdAt === 'string' &&
    !Number.isNaN(new Date(candidate.createdAt).getTime())
      ? candidate.createdAt
      : new Date(0).toISOString();

  return {
    id,
    title,
    origin,
    tagline:
      cleanText(candidate.tagline, 140) || 'Resep buatan sendiri.',
    description:
      cleanMultiline(candidate.description, 1500) ||
      'Resep buatan sendiri yang disimpan di perangkat ini.',
    image: cover.image,
    durationMinutes: Math.min(1440, Math.round(durationMinutes)),
    prepMinutes: Math.max(
      0,
      Math.round(positiveNumber(candidate.prepMinutes) ?? 0)
    ),
    difficulty,
    servings: Math.min(99, Math.round(servings)),
    category,
    tags:
      uniqueStrings(candidate.tags, 8, 30).length > 0
        ? uniqueStrings(candidate.tags, 8, 30)
        : ['Resep sendiri'],
    accent: categoryAccents[category],
    ingredientGroups: groups,
    equipment,
    steps,
    tips: uniqueStrings(candidate.tips, 10, 400),
    isCustom: true,
    coverId: cover.id,
    createdAt,
  };
}
