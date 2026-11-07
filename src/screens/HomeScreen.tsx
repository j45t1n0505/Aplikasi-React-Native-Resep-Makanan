import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RecipeComposerBanner } from '../components/RecipeComposerBanner';
import { SearchTrigger } from '../components/SearchBar';
import {
  FeaturedRecipeCard,
  RecipeCard,
  RecipeRow,
} from '../components/RecipeCard';
import { Chip } from '../components/ui/Chip';
import { GlassSurface } from '../components/ui/GlassSurface';
import { PressableScale } from '../components/ui/PressableScale';
import { SectionHeader } from '../components/ui/SectionHeader';
import {
  featuredRecipe,
  quickRecipes,
  recipeCategories,
} from '../data/recipes';
import { useHaptics } from '../hooks/useHaptics';
import { useOpenRecipe } from '../hooks/useOpenRecipe';
import { useDapur } from '../providers/DapurProvider';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import {
  colors,
  fonts,
  layout,
  shadows,
  text,
} from '../theme';
import { timing } from '../theme/motion';
import { formatIndonesianDate, getGreeting } from '../utils/time';

type HomeProps = BottomTabScreenProps<TabParamList, 'Home'>;

const quickIds = new Set(quickRecipes.map((recipe) => recipe.id));

export function HomeScreen({ navigation }: HomeProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const haptics = useHaptics();
  const openRecipe = useOpenRecipe();
  const { favorites, allRecipes, customRecipes } = useDapur();
  const stackNavigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const cardWidth = (Math.min(width, 760) - layout.screenPadding * 2 - 14) / 2;

  const gridRecipes = useMemo(
    () =>
      allRecipes.filter(
        (recipe) => recipe.id !== featuredRecipe.id && !quickIds.has(recipe.id)
      ),
    [allRecipes]
  );

  const categoryCounts = useMemo(
    () =>
      recipeCategories.map((category) => ({
        category,
        count:
          category === 'Semua'
            ? allRecipes.length
            : allRecipes.filter((recipe) => recipe.category === category)
                .length,
      })),
    [allRecipes]
  );

  const openSearch = (category?: (typeof recipeCategories)[number]) => {
    haptics.selection();
    stackNavigation.navigate('Search', {
      category: category ?? 'Semua',
    });
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#F8E8E0', '#FAF5EF', '#FAF5EF']}
        locations={[0, 0.52, 1]}
        style={styles.background}
      />
      <View pointerEvents="none" style={styles.decorOne} />
      <View pointerEvents="none" style={styles.decorTwo} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 132,
          },
        ]}
      >
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={timing({ duration: 520 })}
          style={styles.inner}
        >
          <View style={styles.header}>
            <View style={styles.brandWrap}>
              <Text style={styles.kicker}>
                {getGreeting().toUpperCase()} · {formatIndonesianDate()}
              </Text>
              <Text style={styles.brand} accessibilityRole="header">
                Dapur{' '}
                <Text style={styles.brandAccent}>Nusa</Text>
              </Text>
              <Text style={styles.tagline}>
                Resep rumahan, rasa Nusantara.
              </Text>
            </View>
            <PressableScale
              onPress={() => {
                haptics.selection();
                navigation.navigate('Favorites');
              }}
              accessibilityRole="button"
              accessibilityLabel={`Buka ${favorites.length} resep simpanan`}
              scaleTo={0.94}
            >
              <GlassSurface
                tone="strong"
                radius={25}
                style={styles.headerButton}
                contentStyle={styles.headerButtonContent}
              >
                <Ionicons
                  name="bookmark-outline"
                  size={21}
                  color={colors.ink}
                />
                {favorites.length > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {favorites.length > 9 ? '9+' : favorites.length}
                    </Text>
                  </View>
                ) : null}
              </GlassSurface>
            </PressableScale>
          </View>

          <View style={styles.searchWrap}>
            <SearchTrigger onPress={() => openSearch()} />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContent}
            style={styles.categoryScroll}
          >
            {categoryCounts.map(({ category, count }, index) => (
              <MotiView
                key={category}
                from={{ opacity: 0, translateY: 8 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={timing({
                  duration: 360,
                  delay: 120 + index * 35,
                })}
              >
                <Chip
                  label={category === 'Semua' ? 'Semua resep' : category}
                  count={count}
                  icon={
                    category === 'Semua'
                      ? 'grid-outline'
                      : category === 'Sapi'
                        ? 'restaurant-outline'
                        : category === 'Ayam'
                          ? 'flame-outline'
                          : category === 'Berkuah'
                            ? 'water-outline'
                            : category === 'Cepat'
                              ? 'flash-outline'
                              : 'leaf-outline'
                  }
                  onPress={() => openSearch(category)}
                />
              </MotiView>
            ))}
          </ScrollView>

          <View style={styles.heroSection}>
            <View style={styles.editorRow}>
              <View style={styles.editorLine} />
              <Text style={[text.overline, styles.editorText]}>
                PILIHAN EDITOR
              </Text>
            </View>
            <FeaturedRecipeCard recipe={featuredRecipe} onOpen={openRecipe} />
          </View>

          <View style={styles.section}>
            <SectionHeader
              kicker="CEPAT & HANGAT"
              title="Siap dalam sekejap"
              actionLabel="Jelajahi"
              onAction={() => openSearch('Cepat')}
            />
            <View style={styles.quickList}>
              {quickRecipes.map((recipe, index) => (
                <RecipeRow
                  key={recipe.id}
                  recipe={recipe}
                  onOpen={openRecipe}
                  index={index}
                />
              ))}
            </View>
          </View>

          <RecipeComposerBanner
            count={customRecipes.length}
            onPress={() => {
              haptics.selection();
              stackNavigation.navigate('AddRecipe');
            }}
          />

          <View style={styles.section}>
            <SectionHeader
              kicker="JELAJAHI NUSANTARA"
              title="Resep untuk dicoba"
              actionLabel="Semua"
              onAction={() => openSearch()}
            />
            <View style={styles.grid}>
              {gridRecipes.map((recipe, index) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onOpen={openRecipe}
                  index={index}
                  style={{ width: cardWidth }}
                />
              ))}
              <ExploreTile
                style={{ width: cardWidth }}
                onPress={() => openSearch()}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerRule} />
            <Ionicons
              name="leaf-outline"
              size={18}
              color={colors.gold}
            />
            <Text style={styles.footerQuote}>
              “Masak adalah cara paling sederhana untuk pulang.”
            </Text>
            <Text style={styles.footerMeta}>
              Dapur Nusa · resep lokal, disimpan untukmu
            </Text>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}

function ExploreTile({
  style,
  onPress,
}: {
  style: { width: number };
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Jelajahi semua resep"
      style={[styles.exploreTile, style]}
      scaleTo={0.97}
    >
      <LinearGradient
        colors={['#9F1C24', '#7C1118']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.exploreGlow} />
      <Ionicons
        name="compass-outline"
        size={26}
        color="rgba(255, 244, 233, 0.9)"
      />
      <View style={styles.exploreCopy}>
        <Text style={styles.exploreKicker}>KAMUS RASA</Text>
        <Text style={styles.exploreTitle}>
          Masak apa{'\n'}hari ini?
        </Text>
      </View>
      <View style={styles.exploreButton}>
        <Ionicons name="arrow-forward" size={16} color={colors.primaryDeep} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 430,
  },
  decorOne: {
    position: 'absolute',
    top: -130,
    right: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(180, 35, 42, 0.06)',
  },
  decorTwo: {
    position: 'absolute',
    top: 150,
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(197, 139, 77, 0.06)',
  },
  scrollContent: {
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 760,
    paddingHorizontal: layout.screenPadding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  brandWrap: {
    flex: 1,
    gap: 4,
  },
  kicker: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    lineHeight: 13,
    letterSpacing: 1.35,
    color: colors.inkMuted,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 37,
    lineHeight: 45,
    letterSpacing: -1.1,
    color: colors.ink,
  },
  brandAccent: {
    fontFamily: fonts.displayItalic,
    color: colors.primary,
  },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.inkSoft,
    marginTop: 1,
  },
  headerButton: {
    width: 50,
    height: 50,
    marginTop: 3,
  },
  headerButtonContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 8,
    color: colors.white,
  },
  searchWrap: {
    marginTop: 20,
  },
  categoryScroll: {
    marginTop: 16,
    marginHorizontal: -layout.screenPadding,
  },
  categoryContent: {
    paddingHorizontal: layout.screenPadding,
    gap: 8,
  },
  heroSection: {
    marginTop: 26,
    gap: 12,
  },
  editorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editorLine: {
    width: 20,
    height: 1,
    backgroundColor: colors.primary,
  },
  editorText: {
    color: colors.primary,
    fontSize: 9,
    letterSpacing: 1.6,
  },
  section: {
    marginTop: 30,
    gap: 14,
  },
  quickList: {
    gap: 11,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 14,
    rowGap: 22,
    marginTop: 2,
  },
  exploreTile: {
    height: 252,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 18,
    justifyContent: 'space-between',
    ...shadows.red,
  },
  exploreGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -60,
    right: -60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  exploreCopy: {
    gap: 4,
  },
  exploreKicker: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    letterSpacing: 1.5,
    color: 'rgba(255, 239, 226, 0.55)',
  },
  exploreTitle: {
    fontFamily: fonts.display,
    fontSize: 27,
    lineHeight: 31,
    letterSpacing: -0.5,
    color: colors.white,
  },
  exploreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  footer: {
    alignItems: 'center',
    marginTop: 46,
    gap: 8,
  },
  footerRule: {
    width: 32,
    height: 1,
    backgroundColor: colors.goldSoft,
    marginBottom: 6,
  },
  footerQuote: {
    fontFamily: fonts.displayItalic,
    fontSize: 17,
    lineHeight: 24,
    color: colors.inkSoft,
    textAlign: 'center',
    maxWidth: 280,
  },
  footerMeta: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    letterSpacing: 0.6,
    color: colors.inkFaint,
  },
});
