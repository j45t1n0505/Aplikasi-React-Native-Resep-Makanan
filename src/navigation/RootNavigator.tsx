import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LiquidTabBar } from '../components/LiquidTabBar';
import { AddRecipeScreen } from '../screens/AddRecipeScreen';
import { CookingModeScreen } from '../screens/CookingModeScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RecipeDetailScreen } from '../screens/RecipeDetailScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { colors } from '../theme';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.ink,
    border: colors.line,
    notification: colors.primary,
  },
};

function TabsNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <LiquidTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Beranda' }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Simpanan' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Tabs" component={TabsNavigator} />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            animation: 'fade_from_bottom',
          }}
        />
        <Stack.Screen
          name="RecipeDetail"
          component={RecipeDetailScreen}
          options={{
            animation: 'fade',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="CookingMode"
          component={CookingModeScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="AddRecipe"
          component={AddRecipeScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
