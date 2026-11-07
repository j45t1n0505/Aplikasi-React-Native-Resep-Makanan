import type { Recipe } from '../types/recipe';

export function getIngredientCount(recipe: Recipe): number {
  return recipe.ingredientGroups.reduce(
    (total, group) => total + group.items.length,
    0
  );
}

export function getRecipeById(
  recipes: Recipe[],
  recipeId: string | undefined
): Recipe | undefined {
  if (!recipeId) {
    return undefined;
  }
  return recipes.find((recipe) => recipe.id === recipeId);
}
