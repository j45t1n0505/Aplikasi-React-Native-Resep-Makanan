import type { NavigatorScreenParams } from '@react-navigation/native';
import type { RecipeCategory } from '../types/recipe';

export type TabParamList = {
  Home: undefined;
  Favorites: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Search: { category?: RecipeCategory | 'Semua' } | undefined;
  RecipeDetail: { recipeId: string };
  CookingMode: { recipeId: string };
  AddRecipe: undefined;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merging untuk typed navigation
    interface RootParamList extends RootStackParamList {}
  }
}
