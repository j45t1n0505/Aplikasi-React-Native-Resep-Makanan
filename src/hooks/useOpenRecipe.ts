import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { useSharedImage, type MeasuredRect } from '../providers/SharedImageProvider';
import type { Recipe } from '../types/recipe';
import type { RootStackParamList } from '../navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/**
 * Titik masuk tunggal untuk membuka detail resep. Jika kartu berhasil
 * mengukur gambarnya, transisi shared-element disiapkan lebih dulu.
 */
export function useOpenRecipe() {
  const navigation = useNavigation<Navigation>();
  const { beginTransition } = useSharedImage();

  return useCallback(
    (recipe: Recipe, imageRect: MeasuredRect | null, radius = 22) => {
      if (imageRect && imageRect.width > 0 && imageRect.height > 0) {
        beginTransition(recipe.id, recipe.image, imageRect, radius);
      }
      navigation.navigate('RecipeDetail', { recipeId: recipe.id });
    },
    [beginTransition, navigation]
  );
}
