import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MotiView } from 'moti';
import { useMemo, useState } from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RecipeRow } from '../components/RecipeCard';
import { SearchInput } from '../components/SearchBar';
import { Chip } from '../components/ui/Chip';
import { GlassSurface } from '../components/ui/GlassSurface';
import { SectionHeader } from '../components/ui/SectionHeader';
import { PressableScale } from '../components/ui/PressableScale';
import { recipeCategories } from '../data/recipes';
import { useHaptics } from '../hooks/useHaptics';
import { useOpenRecipe } from '../hooks/useOpenRecipe';
import type { RootStackParamList } from '../navigation/types';
import { useDapur } from '../providers/DapurProvider';
import type { RecipeCategory } from '../types/recipe';
import { colors, fonts, layout, text } from '../theme';
import { timing } from '../theme/motion';

type SearchProps = NativeStackScreenProps<RootStackParamList, 'Search'>;
type CategoryFilter = RecipeCategory | 'Semua';

const suggestions = ['Rendang', 'Santan', 'Pedas', 'Solo', 'Cepat saji'];

function matchesQuery(query: string, haystack: string): boolean {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  return tokens.every((token) => haystack.includes(token));
}

export function SearchScreen({ navigation, route }: SearchProps) {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const openRecipe = useOpenRecipe();
  const { allRecipes } = useDapur();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>(
    route.params?.category ?? 'Semua'
  );
  const trimmedQuery = query.trim();

  const filteredRecipes = useMemo(() => {
    const normalized = trimmedQuery.toLowerCase();
    return allRecipes.filter((recipe) => {
      const inCategory =
        category === 'Semua' || recipe.category === category;
      if (!inCategory) {
        return false;
      }
      if (!normalized) {
        return true;
      }
      const ingredientText = recipe.ingredientGroups
        .flatMap((group) =>
          group.items.map((item) => `${item.label} ${item.note ?? ''}`)
        )
        .join(' ');
      const haystack = [
        recipe.title,
        recipe.origin,
        recipe.tagline,
        recipe.description,
        recipe.category,
        recipe.difficulty,
        recipe.tags.join(' '),
        ingredientText,
      ]
        .join(' ')
        .toLowerCase();
      return matchesQuery(normalized, haystack);
    });
  }, [allRecipes, category, trimmedQuery]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        recipeCategories.map((item) => [
          item,
          item === 'Semua'
            ? allRecipes.length
            : allRecipes.filter((recipe) => recipe.category === item).length,
        ])
      ) as Record<CategoryFilter, number>,
    [allRecipes]
  );

  const resetSearch = () => {
    haptics.selection();
    setQuery('');
    setCategory('Semua');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.backdropOne} pointerEvents="none" />
      <View style={styles.backdropTwo} pointerEvents="none" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + 10,
            paddingBottom: insets.bottom + 48,
          },
        ]}
      >
        <View style={styles.header}>
          <PressableScale
            onPress={() => {
              haptics.selection();
              Keyboard.dismiss();
              navigation.goBack();
            }}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            style={styles.backButton}
            scaleTo={0.92}
          >
            <GlassSurface
              tone="strong"
              radius={23}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="chevron-back" size={21} color={colors.ink} />
          </PressableScale>
          <View style={styles.headerCount}>
            <Text style={styles.headerCountText}>
              {allRecipes.length} resep
            </Text>
          </View>
        </View>

        <Text style={styles.title}>Temukan rasa{'\n'}yang kamu cari.</Text>
        <Text style={styles.subtitle}>
          Cari berdasarkan nama masakan, daerah, bahan, atau suasana makan.
        </Text>

        <View style={styles.searchWrap}>
          <SearchInput
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder="Rendang, santan, Solo..."
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          style={styles.filterScroll}
        >
          {recipeCategories.map((item) => (
            <Chip
              key={item}
              label={item === 'Semua' ? 'Semua' : item}
              count={counts[item]}
              selected={category === item}
              onPress={() => {
                haptics.selection();
                setCategory(item);
              }}
            />
          ))}
        </ScrollView>

        {!trimmedQuery && category === 'Semua' ? (
          <View style={styles.suggestions}>
            <Text style={[text.overline, styles.suggestionLabel]}>
              COBA CARI
            </Text>
            <View style={styles.suggestionRow}>
              {suggestions.map((suggestion) => (
                <PressableScale
                  key={suggestion}
                  onPress={() => {
                    haptics.selection();
                    setQuery(suggestion);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Cari ${suggestion}`}
                  style={styles.suggestionChip}
                  scaleTo={0.95}
                >
                  <Ionicons
                    name="search-outline"
                    size={12}
                    color={colors.inkMuted}
                  />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </PressableScale>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.resultsHeader}>
          <SectionHeader
            kicker={trimmedQuery ? 'HASIL PENCARIAN' : 'KOLEKSI RESEP'}
            title={
              trimmedQuery
                ? `Untuk “${
                    trimmedQuery.length > 22
                      ? `${trimmedQuery.slice(0, 22)}…`
                      : trimmedQuery
                  }”`
                : category === 'Semua'
                  ? 'Semua resep'
                  : `Rasa ${category.toLowerCase()}`
            }
          />
          <Text style={styles.resultCount}>
            {filteredRecipes.length} ditemukan
          </Text>
        </View>

        {filteredRecipes.length > 0 ? (
          <MotiView
            key={`results-${trimmedQuery}-${category}`}
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={timing({ duration: 320 })}
            style={styles.results}
          >
            {filteredRecipes.map((recipe, index) => (
              <RecipeRow
                key={recipe.id}
                recipe={recipe}
                onOpen={openRecipe}
                index={index}
              />
            ))}
          </MotiView>
        ) : (
          <MotiView
            key={`empty-${trimmedQuery}-${category}`}
            from={{ opacity: 0, translateY: 12, scale: 0.99 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={timing({ duration: 360 })}
            style={styles.empty}
          >
            <View style={styles.emptyIcon}>
              <Ionicons
                name="search-outline"
                size={30}
                color={colors.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>Belum ketemu, nih.</Text>
            <Text style={styles.emptyBody}>
              Coba kata kunci lain atau jelajahi semua resep yang tersimpan di
              Dapur Nusa.
            </Text>
            <PressableScale
              onPress={resetSearch}
              accessibilityRole="button"
              accessibilityLabel="Atur ulang pencarian"
              style={styles.resetButton}
              scaleTo={0.97}
            >
              <Text style={styles.resetText}>Atur ulang pencarian</Text>
            </PressableScale>
          </MotiView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  backdropOne: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(180, 35, 42, 0.055)',
  },
  backdropTwo: {
    position: 'absolute',
    top: 260,
    left: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(197, 139, 77, 0.05)',
  },
  scroll: {
    paddingHorizontal: layout.screenPadding,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCount: {
    height: 28,
    paddingHorizontal: 11,
    borderRadius: 14,
    backgroundColor: colors.primaryWhisper,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(180, 35, 42, 0.12)',
    justifyContent: 'center',
  },
  headerCountText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: colors.primary,
  },
  title: {
    ...text.pageTitle,
    marginTop: 26,
    fontSize: 34,
    lineHeight: 41,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.inkSoft,
    marginTop: 8,
    maxWidth: 310,
  },
  searchWrap: {
    marginTop: 22,
  },
  filterScroll: {
    marginTop: 15,
    marginHorizontal: -layout.screenPadding,
  },
  filters: {
    paddingHorizontal: layout.screenPadding,
    gap: 8,
  },
  suggestions: {
    marginTop: 22,
    gap: 9,
  },
  suggestionLabel: {
    fontSize: 8.5,
    letterSpacing: 1.5,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  suggestionChip: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 253, 249, 0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  suggestionText: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: colors.inkMuted,
  },
  resultsHeader: {
    marginTop: 30,
    gap: 8,
  },
  resultCount: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: colors.inkFaint,
  },
  results: {
    gap: 11,
    marginTop: 14,
  },
  empty: {
    marginTop: 16,
    paddingVertical: 34,
    paddingHorizontal: 22,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 253, 249, 0.65)',
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 24,
    color: colors.ink,
  },
  emptyBody: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    color: colors.inkMuted,
    marginTop: 7,
    maxWidth: 260,
  },
  resetButton: {
    marginTop: 18,
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  resetText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.white,
  },
});
