import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChecklistCard } from '../components/ChecklistCard';
import { getHeroHeight, RecipeHero } from '../components/RecipeHero';
import { GlassSurface } from '../components/ui/GlassSurface';
import { IconButton } from '../components/ui/IconButton';
import { PressableScale } from '../components/ui/PressableScale';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useHaptics } from '../hooks/useHaptics';
import { useRecipeChecklist } from '../hooks/useRecipeChecklist';
import { useDapur } from '../providers/DapurProvider';
import { useSharedImage } from '../providers/SharedImageProvider';
import type { RootStackParamList } from '../navigation/types';
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
import { confirmAction } from '../utils/confirm';
import { formatDuration } from '../utils/time';
import { getRecipeById } from '../utils/recipes';

type DetailProps = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'>;

export function RecipeDetailScreen({ route, navigation }: DetailProps) {
  const { allRecipes } = useDapur();
  const recipe = getRecipeById(allRecipes, route.params.recipeId);

  if (!recipe) {
    return (
      <View style={styles.missing}>
        <StatusBar style="dark" />
        <View style={styles.missingIcon}>
          <Ionicons name="restaurant-outline" size={30} color={colors.primary} />
        </View>
        <Text style={styles.missingTitle}>Resep tidak ditemukan</Text>
        <Text style={styles.missingBody}>
          Resep ini mungkin sudah dipindahkan. Kembali dan pilih masakan lain.
        </Text>
        <PressableScale
          onPress={() => navigation.goBack()}
          style={styles.missingButton}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
        >
          <Text style={styles.missingButtonText}>Kembali</Text>
        </PressableScale>
      </View>
    );
  }

  return (
    <RecipeDetailContent
      recipe={recipe}
      navigation={navigation}
    />
  );
}

function RecipeDetailContent({
  recipe,
  navigation,
}: {
  recipe: Recipe;
  navigation: DetailProps['navigation'];
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const heroHeight = getHeroHeight(width);
  const scrollY = useSharedValue(0);
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const haptics = useHaptics();
  const { favorites, toggleFavorite, deleteCustomRecipe } = useDapur();
  const { clearTransition, closeTransition } = useSharedImage();
  const checklist = useRecipeChecklist(recipe);
  const isFavorite = favorites.includes(recipe.id);
  const totalMinutes = recipe.durationMinutes;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useAnimatedReaction(
    () => scrollY.value > heroHeight - 170,
    (isPastHero, previous) => {
      if (isPastHero !== previous) {
        runOnJS(setShowFloatingNav)(isPastHero);
      }
    },
    [heroHeight]
  );

  const handleBack = useCallback(() => {
    haptics.selection();
    closeTransition(recipe.id, () => navigation.goBack());
  }, [closeTransition, haptics, navigation, recipe.id]);

  // Back gesture / hardware back tidak melewati handleBack, jadi state
  // transisi dibersihkan saat layar benar-benar dilepas. Tanpa ini overlay
  // shared-element bisa tertinggal mengarah ke layar yang sudah ditutup.
  useEffect(() => {
    return () => clearTransition();
  }, [clearTransition]);

  const handleFavorite = () => {
    toggleFavorite(recipe.id);
    if (isFavorite) {
      haptics.soft();
    } else {
      haptics.success();
    }
  };

  const handleCook = useCallback(() => {
    haptics.medium();
    navigation.navigate('CookingMode', { recipeId: recipe.id });
  }, [haptics, navigation, recipe.id]);

  const handleDelete = useCallback(() => {
    haptics.warning();
    confirmAction({
      title: 'Hapus resep ini?',
      message: `“${recipe.title}” akan dihapus dari perangkat. Simpanan dan catatan memasaknya juga ikut terhapus.`,
      cancelLabel: 'Batal',
      confirmLabel: 'Hapus resep',
      destructive: true,
      onConfirm: () => {
        // Tunggu animasi tutup selesai sebelum resep dihapus, supaya layar
        // detail tidak berkedip ke keadaan "tidak ditemukan".
        closeTransition(recipe.id, () => {
          deleteCustomRecipe(recipe.id);
          haptics.success();
          navigation.goBack();
        });
      },
    });
  }, [
    closeTransition,
    deleteCustomRecipe,
    haptics,
    navigation,
    recipe.id,
    recipe.title,
  ]);

  const groups = recipe.ingredientGroups.map((group) => ({
    id: group.id,
    title: group.title,
    items: group.items,
  }));

  return (
    <View style={styles.screen}>
      <StatusBar style={showFloatingNav ? 'dark' : 'light'} />
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <RecipeHero
          recipe={recipe}
          scrollY={scrollY}
          isFavorite={isFavorite}
          onBack={handleBack}
          onToggleFavorite={handleFavorite}
          onDelete={recipe.isCustom ? handleDelete : undefined}
        />

        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.sheetInner}>
            <View style={styles.heading}>
              <View style={styles.originRow}>
                <View style={styles.originLeft}>
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={colors.primary}
                  />
                  <Text style={styles.origin}>{recipe.origin}</Text>
                </View>
                <View style={styles.headingPills}>
                  {recipe.isCustom ? (
                    <View style={styles.customPill}>
                      <Ionicons
                        name="create-outline"
                        size={10}
                        color={colors.gold}
                      />
                      <Text style={styles.customPillText}>RESEP SAYA</Text>
                    </View>
                  ) : null}
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryText}>{recipe.category}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.title}>{recipe.title}</Text>
              <Text style={styles.tagline}>{recipe.tagline}</Text>
              <Text style={styles.description}>{recipe.description}</Text>
            </View>

            <MotiView
              from={{ opacity: 0, translateY: 14 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={timing({ duration: 420, delay: 80 })}
            >
              <GlassSurface
                tone="strong"
                radius={radii.xl}
                contentStyle={styles.metaStrip}
                style={styles.metaShadow}
              >
                <MetaItem
                  icon="time-outline"
                  value={formatDuration(totalMinutes)}
                  label="Total waktu"
                />
                <View style={styles.metaDivider} />
                <MetaItem
                  icon="speedometer-outline"
                  value={recipe.difficulty}
                  label="Tingkat"
                />
                <View style={styles.metaDivider} />
                <MetaItem
                  icon="people-outline"
                  value={`${recipe.servings} porsi`}
                  label="Hasil"
                />
              </GlassSurface>
            </MotiView>

            <View style={styles.checklistSection}>
              <MotiView
                from={{ opacity: 0, translateY: 16 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={timing({ duration: 420, delay: 150 })}
              >
                <ChecklistCard
                  title="Bahan-bahan"
                  eyebrow="SIAPKAN BAHAN"
                  icon="leaf-outline"
                  groups={groups}
                  checkedCount={checklist.ingredientCheckedCount}
                  totalCount={checklist.ingredientItems.length}
                  isChecked={checklist.isChecked}
                  onToggle={checklist.toggleItem}
                  onReset={checklist.resetIngredients}
                />
              </MotiView>
              {recipe.equipment.length > 0 ? (
                <MotiView
                  from={{ opacity: 0, translateY: 16 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={timing({ duration: 420, delay: 220 })}
                >
                  <ChecklistCard
                    title="Peralatan"
                    eyebrow="SIAPKAN ALAT"
                    icon="construct-outline"
                    groups={[
                      {
                        id: 'equipment',
                        items: recipe.equipment,
                      },
                    ]}
                    checkedCount={checklist.equipmentCheckedCount}
                    totalCount={recipe.equipment.length}
                    isChecked={checklist.isChecked}
                    onToggle={checklist.toggleItem}
                    onReset={checklist.resetEquipment}
                  />
                </MotiView>
              ) : null}
            </View>

            <View style={styles.stepsSection}>
              <SectionHeader
                kicker="PANDUAN MEMASAK"
                title="Cara membuat"
                actionLabel="Mode masak"
                onAction={handleCook}
              />
              <View style={styles.stepsList}>
                {recipe.steps.map((step, index) => (
                  <MotiView
                    key={step.id}
                    from={{ opacity: 0, translateY: 12 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={timing({
                      duration: 360,
                      delay: Math.min(index, 7) * 40,
                    })}
                  >
                    <View style={styles.stepRow}>
                      <View style={styles.timeline}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>
                            {index + 1}
                          </Text>
                        </View>
                        {index < recipe.steps.length - 1 ? (
                          <View style={styles.timelineLine} />
                        ) : null}
                      </View>
                      <View style={styles.stepCopy}>
                        <View style={styles.stepTitleRow}>
                          <Text style={styles.stepTitle}>{step.title}</Text>
                          {step.timerSeconds ? (
                            <View style={styles.timerChip}>
                              <Ionicons
                                name="timer-outline"
                                size={11}
                                color={colors.primary}
                              />
                              <Text style={styles.timerText}>
                                {formatDuration(
                                  Math.max(
                                    1,
                                    Math.round(step.timerSeconds / 60)
                                  )
                                )}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.stepDescription}>
                          {step.description}
                        </Text>
                      </View>
                    </View>
                  </MotiView>
                ))}
              </View>
            </View>

            {recipe.tips.length > 0 ? (
              <MotiView
                from={{ opacity: 0, translateY: 16 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={timing({ duration: 420, delay: 120 })}
                style={styles.tipsSection}
              >
                <GlassSurface
                  tone="strong"
                  radius={radii.xl}
                  contentStyle={styles.tipsContent}
                >
                  <View style={styles.tipsHeader}>
                    <View style={styles.tipsIcon}>
                      <Ionicons
                        name="bulb-outline"
                        size={18}
                        color={colors.gold}
                      />
                    </View>
                    <View style={styles.tipsTitleWrap}>
                      <Text style={[text.overline, styles.tipsEyebrow]}>
                        CATATAN DAPUR
                      </Text>
                      <Text style={styles.tipsTitle}>Supaya makin nikmat</Text>
                    </View>
                  </View>
                  <View style={styles.tipsList}>
                    {recipe.tips.map((tip, index) => (
                      <View
                        key={`${recipe.id}-tip-${index}`}
                        style={styles.tipRow}
                      >
                        <View style={styles.tipDot} />
                        <Text style={styles.tipText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                </GlassSurface>
              </MotiView>
            ) : null}

            <View style={styles.creditWrap}>
              <Ionicons
                name={recipe.isCustom ? 'create-outline' : 'camera-outline'}
                size={12}
                color={colors.inkFaint}
              />
              <Text style={styles.credit}>
                {recipe.isCustom
                  ? 'Resep buatanmu · Foto dari koleksi Dapur Nusa'
                  : 'Foto oleh Pexels · Resep ditulis oleh Dapur Nusa'}
              </Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {showFloatingNav ? (
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={timing({ duration: 280 })}
          style={[styles.floatingNav, { top: insets.top + 6 }]}
        >
          <IconButton
            icon="chevron-back"
            onPress={handleBack}
            accessibilityLabel="Kembali"
            tone="glass"
            size={44}
          />
          <GlassSurface
            tone="strong"
            radius={radii.pill}
            style={styles.floatingTitle}
            contentStyle={styles.floatingTitleContent}
          >
            <Text style={styles.floatingTitleText} numberOfLines={1}>
              {recipe.title}
            </Text>
          </GlassSurface>
          <IconButton
            icon={isFavorite ? 'heart' : 'heart-outline'}
            onPress={handleFavorite}
            accessibilityLabel={
              isFavorite ? 'Hapus dari simpanan' : 'Simpan resep'
            }
            tone="glass"
            color={isFavorite ? colors.primary : colors.ink}
            size={44}
          />
        </MotiView>
      ) : null}

      <View
        pointerEvents="box-none"
        style={styles.ctaDock}
      >
        <LinearGradient
          pointerEvents="none"
          colors={[
            'rgba(250, 245, 239, 0)',
            'rgba(250, 245, 239, 0.86)',
            colors.background,
          ]}
          locations={[0, 0.48, 1]}
          style={styles.ctaFade}
        />
        <View
          style={[
            styles.ctaWrap,
            { paddingBottom: Math.max(insets.bottom, 10) + 4 },
          ]}
        >
          <MotiView
            from={{ opacity: 0, translateY: 18 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={timing({ duration: 420, delay: 220 })}
          >
            <PressableScale
              onPress={handleCook}
              accessibilityRole="button"
              accessibilityLabel="Mulai memasak"
              scaleTo={0.98}
              style={styles.ctaShadow}
            >
              <View style={styles.cta}>
                <LinearGradient
                  colors={[colors.primary, '#981920', colors.primaryDeep]}
                  locations={[0, 0.58, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.ctaIcon}>
                  <Ionicons name="flame" size={20} color={colors.primary} />
                </View>
                <View style={styles.ctaCopy}>
                  <Text style={styles.ctaTitle}>Mulai masak</Text>
                  <Text style={styles.ctaSubtitle}>
                    {recipe.steps.length} langkah · timer pintar
                  </Text>
                </View>
                <View style={styles.ctaArrow}>
                  <Ionicons
                    name="arrow-forward"
                    size={17}
                    color={colors.primaryDeep}
                  />
                </View>
              </View>
            </PressableScale>
          </MotiView>
        </View>
      </View>
    </View>
  );
}

function MetaItem({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.metaItem}>
      <View style={styles.metaIcon}>
        <Ionicons name={icon} size={15} color={colors.primary} />
      </View>
      <Text style={styles.metaValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  sheet: {
    marginTop: -38,
    backgroundColor: colors.background,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingTop: 10,
    paddingBottom: 140,
    minHeight: 500,
  },
  handle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(74, 43, 34, 0.16)',
    marginBottom: 18,
  },
  sheetInner: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  heading: {
    gap: 8,
  },
  originRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  originLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  origin: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    lineHeight: 13,
    letterSpacing: 1.45,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  headingPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customPill: {
    height: 24,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(197, 139, 77, 0.13)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(197, 139, 77, 0.24)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customPillText: {
    fontFamily: fonts.bold,
    fontSize: 7.5,
    letterSpacing: 0.9,
    color: colors.gold,
  },
  categoryPill: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: colors.primaryWhisper,
    justifyContent: 'center',
  },
  categoryText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: colors.primary,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -1,
    color: colors.ink,
    marginTop: 2,
  },
  tagline: {
    fontFamily: fonts.displayItalic,
    fontSize: 16.5,
    lineHeight: 23,
    color: colors.primary,
    letterSpacing: -0.1,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 22,
    color: colors.inkSoft,
    marginTop: 4,
  },
  metaShadow: {
    marginTop: 22,
    ...shadows.soft,
  },
  metaStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 4,
  },
  metaIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryWhisper,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  metaValue: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    lineHeight: 15,
    color: colors.ink,
    textAlign: 'center',
  },
  metaLabel: {
    fontFamily: fonts.medium,
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 1,
    color: colors.inkMuted,
    textTransform: 'uppercase',
  },
  metaDivider: {
    width: StyleSheet.hairlineWidth,
    height: 40,
    backgroundColor: colors.line,
  },
  checklistSection: {
    marginTop: 30,
    gap: 26,
  },
  stepsSection: {
    marginTop: 34,
    gap: 16,
  },
  stepsList: {
    marginTop: 2,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 13,
  },
  timeline: {
    width: 32,
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(180, 35, 42, 0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.primary,
  },
  timelineLine: {
    width: 1,
    flex: 1,
    minHeight: 18,
    backgroundColor: 'rgba(180, 35, 42, 0.16)',
    marginVertical: 6,
  },
  stepCopy: {
    flex: 1,
    paddingBottom: 22,
    paddingTop: 1,
    gap: 5,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  stepTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14.5,
    lineHeight: 19,
    color: colors.ink,
    letterSpacing: -0.15,
    flexShrink: 1,
  },
  timerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 22,
    paddingHorizontal: 7,
    borderRadius: 11,
    backgroundColor: colors.primaryWhisper,
  },
  timerText: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: colors.primary,
  },
  stepDescription: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 20,
    color: colors.inkSoft,
  },
  tipsSection: {
    marginTop: 8,
  },
  tipsContent: {
    padding: 20,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 14,
  },
  tipsIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(197, 139, 77, 0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsTitleWrap: {
    gap: 2,
    flex: 1,
  },
  tipsEyebrow: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: colors.gold,
  },
  tipsTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 20,
    lineHeight: 25,
    color: colors.ink,
  },
  tipsList: {
    gap: 9,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  tipDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.gold,
    marginTop: 8,
  },
  tipText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 19,
    color: colors.inkSoft,
  },
  creditWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 26,
  },
  credit: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: colors.inkFaint,
  },
  floatingNav: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 30,
    elevation: 30,
  },
  floatingTitle: {
    flex: 1,
    height: 44,
    ...shadows.soft,
  },
  floatingTitleContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  floatingTitleText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.ink,
  },
  ctaDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    elevation: 20,
  },
  ctaFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
  },
  ctaWrap: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingTop: 20,
  },
  ctaShadow: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: colors.primaryDeep,
    ...shadows.red,
  },
  cta: {
    height: 64,
    borderRadius: 24,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 12,
  },
  ctaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaCopy: {
    flex: 1,
    gap: 1,
  },
  ctaTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.white,
    letterSpacing: -0.1,
  },
  ctaSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: 'rgba(255, 240, 229, 0.7)',
  },
  ctaArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missing: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  missingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  missingTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 25,
    color: colors.ink,
  },
  missingBody: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 20,
    color: colors.inkMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  missingButton: {
    marginTop: 14,
    height: 44,
    paddingHorizontal: 22,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  missingButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.white,
  },
});
