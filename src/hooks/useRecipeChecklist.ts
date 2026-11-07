import { useCallback, useMemo } from 'react';
import { useDapur } from '../providers/DapurProvider';
import type { Recipe } from '../types/recipe';

export function useRecipeChecklist(recipe: Recipe) {
  const {
    checklists,
    toggleChecklistItem,
    resetChecklist,
    clearChecklistItems,
  } = useDapur();
  const checklist = checklists[recipe.id];

  const ingredientItems = useMemo(
    () => recipe.ingredientGroups.flatMap((group) => group.items),
    [recipe.ingredientGroups]
  );

  const isChecked = useCallback(
    (itemId: string) => Boolean(checklist?.[itemId]),
    [checklist]
  );

  const toggleItem = useCallback(
    (itemId: string) => toggleChecklistItem(recipe.id, itemId),
    [recipe.id, toggleChecklistItem]
  );

  const countChecked = useCallback(
    (items: readonly { id: string }[]) =>
      items.reduce(
        (total, item) => total + (checklist?.[item.id] ? 1 : 0),
        0
      ),
    [checklist]
  );

  const reset = useCallback(
    () => resetChecklist(recipe.id),
    [recipe.id, resetChecklist]
  );

  const resetIngredients = useCallback(
    () =>
      clearChecklistItems(
        recipe.id,
        ingredientItems.map((item) => item.id)
      ),
    [clearChecklistItems, ingredientItems, recipe.id]
  );

  const resetEquipment = useCallback(
    () =>
      clearChecklistItems(
        recipe.id,
        recipe.equipment.map((item) => item.id)
      ),
    [clearChecklistItems, recipe.equipment, recipe.id]
  );

  return {
    isChecked,
    toggleItem,
    countChecked,
    reset,
    resetIngredients,
    resetEquipment,
    ingredientItems,
    ingredientCheckedCount: countChecked(ingredientItems),
    equipmentCheckedCount: countChecked(recipe.equipment),
    totalChecked:
      countChecked(ingredientItems) + countChecked(recipe.equipment),
    totalItems: ingredientItems.length + recipe.equipment.length,
  };
}
