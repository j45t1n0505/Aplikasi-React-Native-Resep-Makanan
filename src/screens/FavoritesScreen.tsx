import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RecipeCard, RecipeRow } from '../components/RecipeCard';
import { GlassSurface } from '../components/ui/GlassSurface';
import { PressableScale } from '../components/ui/PressableScale';
import { SectionHeader } from '../components/ui/SectionHeader';
import { quickRecipes } from '../data/recipes';
import { useHaptics } from '../hooks/useHaptics';
import { useOpenRecipe } from '../hooks/useOpenRecipe';
import { useDapur } from '../providers/DapurProvider';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import type { Recipe } from '../types/recipe';
import {
  colors,
  fonts,
  layout,
  radii,
  shadows,
  text,
} from '../theme';
import { timing } from '../theme/motion';

type FavoritesProps = BottomTabScreenProps<TabParamList, 'Favorites'>;

export function FavoritesScreen({ navigation }: FavoritesProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { favorites, allRecipes, toggleFavorite } = useDapur();
  const openRecipe = useOpenRecipe();
  const haptics = useHaptics();
  const stackNavigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [managing, setManaging] = useState(false);

  const savedRecipes = useMemo(
    () =>
      favorites
        .map((id) => allRecipes.find((recipe) => recipe.id === id))
        .filter((recipe): recipe is Recipe => Boolean(recipe)),
    [allRecipes, favorites]
  );

  const cardWidth = (Math.min(width, 760) - layout.screenPadding * 2 - 14) / 2;
  const isEmpty = savedRecipes.length === 0;

  // Mode kelola selalu ditutup saat meninggalkan tab, jadi tombol hapus tidak
  // terbawa ketika pengguna kembali dengan simpanan yang berbeda.
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setManaging(false);
    });
    return unsubscribe;
  }, [navigation]);

  const handleRemove = (recipeId: string) => {
    haptics.success();
    toggleFavorite(recipeId);
    if (savedRecipes.length === 1) {
      setManaging(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#F8E6DE', colors.background, colors.background]}
        locations={[0, 0.42, 1]}
        style={styles.background}
      />
      <View pointerEvents="none" style={styles.decorOne} />
      <View pointerEvents="none" style={styles.decorTwo} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 132,
          },
        ]}
      >
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={timing({ duration: 460 })}
          style={styles.inner}
        >
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.kicker}>KOLEKSI PRIBADI</Text>
              <Text style={styles.title} accessibilityRole="header">
                Resep{'\n'}
                <Text style={styles.titleAccent}>simpanan</Text>
              </Text>
              <Text style={styles.subtitle}>
                Kumpulan rasa yang ingin kamu masak lagi.
              </Text>
            </View>
            <GlassSurface
              tone="strong"
              radius={28}
              style={styles.headerBadge}
              contentStyle={styles.headerBadgeContent}
            >
              <Ionicons name="bookmark" size={23} color={colors.primary} />
              <Text style={styles.headerBadgeValue}>{savedRecipes.length}</Text>
              <Text style={styles.headerBadgeLabel}>RESEP</Text>
            </GlassSurface>
          </View>

          {isEmpty ? (
            <>
              <MotiView
                from={{ opacity: 0, translateY: 16, scale: 0.98 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                transition={timing({ duration: 520, delay: 90 })}
                style={styles.emptyShadow}
              >
                <LinearGradient
                  colors={['#FFFDF9', '#F7EAE0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.emptyGlow} />
                <View style={styles.emptyIconRing}>
                  <View style={styles.emptyIconInner}>
                    <Ionicons
                      name="heart-outline"
                      size={32}
                      color={colors.primary}
                    />
                  </View>
                </View>
                <Text style={styles.emptyKicker}>MULAI DARI SINI</Text>
                <Text style={styles.emptyTitle}>Belum ada resep tersimpan</Text>
                <Text style={styles.emptyBody}>
                  Ketuk ikon hati di halaman resep untuk menyimpannya. Nanti,
                  semua inspirasi masakmu ada di sini.
                </Text>
                <PressableScale
                  onPress={() => {
                    haptics.selection();
                    navigation.navigate('Home');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Jelajahi resep di beranda"
                  style={styles.emptyButton}
                  scaleTo={0.97}
                >
                  <Ionicons
                    name="compass-outline"
                    size={17}
                    color={colors.white}
                  />
                  <Text style={styles.emptyButtonText}>Jelajahi resep</Text>
                </PressableScale>
                <PressableScale
                  onPress={() => {
                    haptics.selection();
                    stackNavigation.navigate('AddRecipe');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Tulis resep sendiri"
                  style={styles.emptySecondary}
                  scaleTo={0.97}
                >
                  <Ionicons
                    name="create-outline"
                    size={15}
                    color={colors.primary}
                  />
                  <Text style={styles.emptySecondaryText}>
                    Tulis resep sendiri
                  </Text>
                </PressableScale>
              </MotiView>

              <View style={styles.suggestSection}>
                <SectionHeader
                  kicker="COBA DULU"
                  title="Siap dalam sekejap"
                />
                <View style={styles.suggestList}>
                  {quickRecipes.slice(0, 3).map((recipe, index) => (
                    <RecipeRow
                      key={recipe.id}
                      recipe={recipe}
                      onOpen={openRecipe}
                      index={index}
                    />
                  ))}
                </View>
              </View>
            </>
          ) : (
            <>
              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={timing({ duration: 380, delay: 80 })}
                style={styles.toolbar}
              >
                <View style={styles.toolbarCopy}>
                  <Ionicons
                    name="sparkles-outline"
                    size={14}
                    color={colors.gold}
                  />
                  <Text style={styles.toolbarText}>
                    {savedRecipes.length} resep siap dimasak
                  </Text>
                </View>
                <PressableScale
                  onPress={() => {
                    haptics.selection();
                    setManaging((current) => !current);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={
                    managing ? 'Selesai mengelola simpanan' : 'Kelola simpanan'
                  }
                  scaleTo={0.94}
                >
                  <Text style={styles.toolbarAction}>
                    {managing ? 'Selesai' : 'Kelola'}
                  </Text>
                </PressableScale>
              </MotiView>

              <View style={styles.grid}>
                {savedRecipes.map((recipe, index) => (
                  <View
                    key={recipe.id}
                    style={[styles.cardWrap, { width: cardWidth }]}
                  >
                    <RecipeCard
                      recipe={recipe}
                      onOpen={openRecipe}
                      index={index}
                      style={styles.card}
                    />
                    {managing ? (
                      <PressableScale
                        onPress={() => handleRemove(recipe.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`Hapus ${recipe.title} dari simpanan`}
                        style={styles.removeButton}
                        scaleTo={0.9}
                      >
                        <Ionicons
                          name="close"
                          size={15}
                          color={colors.white}
                        />
                      </PressableScale>
                    ) : null}
                  </View>
                ))}
              </View>

              <View style={styles.footerNote}>
                <View style={styles.footerRule} />
                <Ionicons
                  name="heart-outline"
                  size={15}
                  color={colors.primary}
                />
                <Text style={styles.footerText}>
                  Simpanan tersimpan otomatis di perangkatmu.
                </Text>
              </View>
            </>
          )}
        </MotiView>
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
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 420,
  },
  decorOne: {
    position: 'absolute',
    top: -110,
    right: -100,
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: 'rgba(180, 35, 42, 0.055)',
  },
  decorTwo: {
    position: 'absolute',
    top: 230,
    left: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(197, 139, 77, 0.055)',
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
    gap: 18,
  },
  headerCopy: {
    flex: 1,
    gap: 5,
  },
  kicker: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    letterSpacing: 1.5,
    color: colors.primary,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 37,
    lineHeight: 44,
    letterSpacing: -1,
    color: colors.ink,
  },
  titleAccent: {
    fontFamily: fonts.displayItalic,
    color: colors.primary,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.inkSoft,
    maxWidth: 250,
  },
  headerBadge: {
    width: 88,
    height: 100,
    marginTop: 4,
    ...shadows.soft,
  },
  headerBadgeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  headerBadgeValue: {
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 29,
    color: colors.ink,
  },
  headerBadgeLabel: {
    fontFamily: fonts.bold,
    fontSize: 7.5,
    letterSpacing: 1.4,
    color: colors.inkMuted,
  },
  toolbar: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toolbarCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  toolbarText: {
    fontFamily: fonts.medium,
    fontSize: 11.5,
    color: colors.inkMuted,
  },
  toolbarAction: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 14,
    rowGap: 23,
    marginTop: 16,
  },
  cardWrap: {
    position: 'relative',
  },
  card: {
    width: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryDeep,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    elevation: 6,
    ...shadows.red,
  },
  footerNote: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  footerRule: {
    width: 22,
    height: 1,
    backgroundColor: colors.goldSoft,
  },
  footerText: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: colors.inkFaint,
  },
  emptyShadow: {
    marginTop: 30,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    padding: 26,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    ...shadows.soft,
  },
  emptyGlow: {
    position: 'absolute',
    top: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(180, 35, 42, 0.06)',
  },
  emptyIconRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    borderColor: 'rgba(180, 35, 42, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  emptyIconInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyKicker: {
    ...text.overline,
    fontSize: 8.5,
    letterSpacing: 1.7,
    color: colors.primary,
  },
  emptyTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 6,
  },
  emptyBody: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 20,
    color: colors.inkMuted,
    textAlign: 'center',
    maxWidth: 290,
    marginTop: 8,
  },
  emptyButton: {
    marginTop: 20,
    height: 48,
    paddingHorizontal: 22,
    borderRadius: 24,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...shadows.red,
  },
  emptyButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.white,
  },
  emptySecondary: {
    marginTop: 6,
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emptySecondaryText: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: colors.primary,
  },
  suggestSection: {
    marginTop: 32,
    gap: 15,
  },
  suggestList: {
    gap: 11,
  },
});
