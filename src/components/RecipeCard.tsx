import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useRef, type RefObject } from 'react';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewInstance,
  type ViewStyle,
} from 'react-native';
import { formatDuration } from '../utils/time';
import { useHaptics } from '../hooks/useHaptics';
import type { MeasuredRect } from '../providers/SharedImageProvider';
import type { Recipe } from '../types/recipe';
import {
  colors,
  fonts,
  radii,
  shadows,
  text,
} from '../theme';
import { timing } from '../theme/motion';
import { GlassSurface } from './ui/GlassSurface';
import { PressableScale } from './ui/PressableScale';

type OpenRecipe = (recipe: Recipe, imageRect: MeasuredRect | null) => void;

function measureImage(
  ref: RefObject<ViewInstance | null>,
  onMeasured: (rect: MeasuredRect | null) => void
) {
  const node = ref.current;
  if (!node) {
    onMeasured(null);
    return;
  }
  node.measureInWindow((x, y, width, height) => {
    if (width <= 0 || height <= 0) {
      onMeasured(null);
      return;
    }
    onMeasured({ x, y, width, height });
  });
}

export function RecipeCard({
  recipe,
  onOpen,
  index = 0,
  style,
}: {
  recipe: Recipe;
  onOpen: OpenRecipe;
  index?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const imageRef = useRef<ViewInstance>(null);
  const haptics = useHaptics();

  const handlePress = () => {
    haptics.light();
    measureImage(imageRef, (rect) => onOpen(recipe, rect));
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 18 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={timing({
        duration: 430,
        delay: Math.min(index, 8) * 55,
      })}
      style={style}
    >
      <PressableScale
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${recipe.title}, ${recipe.origin}`}
        scaleTo={0.975}
      >
        <View
          ref={imageRef}
          collapsable={false}
          style={styles.imageFrame}
        >
          <Image
            source={recipe.image}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition="center"
            transition={220}
            cachePolicy="memory-disk"
          />
          <LinearGradient
            colors={['rgba(24, 12, 10, 0.22)', 'rgba(24, 12, 10, 0)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.imageTop}>
            <GlassSurface
              tone="dark"
              radius={radii.pill}
              bordered={false}
              contentStyle={styles.categoryChip}
              blurEnabled={false}
            >
              <View
                style={[styles.categoryDot, { backgroundColor: recipe.accent[1] }]}
              />
              <Text style={styles.categoryText}>{recipe.category}</Text>
            </GlassSurface>
          </View>
          {recipe.isCustom ? (
            <View style={styles.customBadgeWrap}>
              <GlassSurface
                tone="dark"
                radius={radii.pill}
                bordered={false}
                contentStyle={styles.customChip}
                blurEnabled={false}
              >
                <Ionicons
                  name="create-outline"
                  size={10}
                  color={colors.goldSoft}
                />
                <Text style={styles.customChipText}>RESEP SAYA</Text>
              </GlassSurface>
            </View>
          ) : null}
          <View style={styles.imageBottom}>
            <GlassSurface
              tone="strong"
              radius={radii.pill}
              contentStyle={styles.durationChip}
            >
              <Ionicons
                name="time-outline"
                size={12}
                color={colors.ink}
              />
              <Text style={styles.durationText}>
                {formatDuration(recipe.durationMinutes)}
              </Text>
            </GlassSurface>
          </View>
        </View>

        <View style={styles.copy}>
          <Text style={styles.origin} numberOfLines={1}>
            {recipe.origin}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Text>
          <View style={styles.meta}>
            <Text style={styles.metaText}>{recipe.difficulty}</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>{recipe.servings} porsi</Text>
          </View>
        </View>
      </PressableScale>
    </MotiView>
  );
}

export function RecipeRow({
  recipe,
  onOpen,
  index = 0,
}: {
  recipe: Recipe;
  onOpen: OpenRecipe;
  index?: number;
}) {
  const imageRef = useRef<ViewInstance>(null);
  const haptics = useHaptics();

  const handlePress = () => {
    haptics.light();
    measureImage(imageRef, (rect) => onOpen(recipe, rect));
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={timing({
        duration: 380,
        delay: Math.min(index, 8) * 45,
      })}
    >
      <PressableScale
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${recipe.title}, ${recipe.origin}`}
        scaleTo={0.98}
      >
        <View style={styles.row}>
          <View ref={imageRef} collapsable={false} style={styles.rowImage}>
            <Image
              source={recipe.image}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              contentPosition="center"
              transition={200}
              cachePolicy="memory-disk"
            />
          </View>
          <View style={styles.rowCopy}>
            <View style={styles.rowTop}>
              <Text style={styles.rowOrigin} numberOfLines={1}>
                {recipe.origin}
              </Text>
              <View style={styles.rowRating}>
                <Ionicons name="time-outline" size={12} color={colors.inkMuted} />
                <Text style={styles.rowMeta}>
                  {formatDuration(recipe.durationMinutes)}
                </Text>
              </View>
            </View>
            <Text style={styles.rowTitle} numberOfLines={2}>
              {recipe.title}
            </Text>
            <View style={styles.rowBottom}>
              <Text style={styles.rowTag}>
                {recipe.difficulty} · {recipe.servings} porsi
                {recipe.isCustom ? ' · Resep saya' : ''}
              </Text>
              <View style={styles.rowArrow}>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={colors.primary}
                />
              </View>
            </View>
          </View>
        </View>
      </PressableScale>
    </MotiView>
  );
}

export function FeaturedRecipeCard({
  recipe,
  onOpen,
}: {
  recipe: Recipe;
  onOpen: OpenRecipe;
}) {
  const imageRef = useRef<ViewInstance>(null);
  const haptics = useHaptics();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 44, 760);
  const cardHeight = Math.min(440, Math.max(390, cardWidth * 1.12));

  const handlePress = () => {
    haptics.medium();
    measureImage(imageRef, (rect) => onOpen(recipe, rect));
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 18 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={timing({ duration: 500, delay: 80 })}
    >
      <PressableScale
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Resep pilihan hari ini: ${recipe.title}`}
        scaleTo={0.985}
        style={[
          styles.featuredShadow,
          {
            height: cardHeight,
            borderRadius: radii.xxl,
          },
        ]}
      >
      <View
        ref={imageRef}
        collapsable={false}
        style={[
          styles.featuredCard,
          { height: cardHeight, borderRadius: radii.xxl },
        ]}
      >
        <Image
          source={recipe.image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="center"
          transition={300}
          priority="high"
          cachePolicy="memory-disk"
        />
        <LinearGradient
          colors={[
            'rgba(24, 11, 9, 0.02)',
            'rgba(24, 11, 9, 0.14)',
            'rgba(24, 11, 9, 0.78)',
            'rgba(24, 11, 9, 0.92)',
          ]}
          locations={[0, 0.35, 0.72, 1]}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(20, 9, 7, 0.30)', 'rgba(20, 9, 7, 0)']}
          style={styles.featuredTopShade}
        />
        <View style={styles.featuredTopRow}>
          <GlassSurface
            tone="light"
            radius={radii.pill}
            contentStyle={styles.featuredBadge}
          >
            <Ionicons name="sparkles" size={13} color={colors.primary} />
            <Text style={styles.featuredBadgeText}>PILIHAN HARI INI</Text>
          </GlassSurface>
          <GlassSurface
            tone="dark"
            radius={radii.pill}
            contentStyle={styles.featuredServings}
          >
            <Ionicons name="people-outline" size={13} color={colors.white} />
            <Text style={styles.featuredServingsText}>
              {recipe.servings} porsi
            </Text>
          </GlassSurface>
        </View>

        <View style={styles.featuredBottom}>
          <Text style={styles.featuredOrigin}>{recipe.origin}</Text>
          <Text style={styles.featuredTitle}>{recipe.title}</Text>
          <Text style={styles.featuredTagline} numberOfLines={2}>
            {recipe.tagline}
          </Text>
          <View style={styles.featuredFooter}>
            <View style={styles.featuredMeta}>
              <View style={styles.featuredMetaItem}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color="rgba(255,247,241,0.82)"
                />
                <Text style={styles.featuredMetaText}>
                  {formatDuration(recipe.durationMinutes)}
                </Text>
              </View>
              <View style={styles.featuredMetaDivider} />
              <View style={styles.featuredMetaItem}>
                <Ionicons
                  name="flame-outline"
                  size={14}
                  color="rgba(255,247,241,0.82)"
                />
                <Text style={styles.featuredMetaText}>
                  {recipe.difficulty}
                </Text>
              </View>
            </View>
            <View style={styles.featuredArrow}>
              <Ionicons
                name="arrow-forward"
                size={19}
                color={colors.primaryDeep}
              />
            </View>
          </View>
        </View>
      </View>
      </PressableScale>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  imageFrame: {
    width: '100%',
    aspectRatio: 0.83,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.surfaceWarm,
  },
  imageTop: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  imageBottom: {
    position: 'absolute',
    left: 10,
    bottom: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  categoryDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  categoryText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    lineHeight: 13,
    color: colors.white,
    letterSpacing: 0.3,
  },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  durationText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    lineHeight: 13,
    color: colors.ink,
  },
  customBadgeWrap: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  customChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 4,
  },
  customChipText: {
    fontFamily: fonts.bold,
    fontSize: 7.5,
    letterSpacing: 0.9,
    color: colors.goldSoft,
  },
  copy: {
    paddingTop: 11,
    paddingHorizontal: 2,
    gap: 4,
  },
  origin: {
    ...text.overline,
    fontSize: 9,
    letterSpacing: 1.3,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.25,
    color: colors.ink,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaText: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    lineHeight: 14,
    color: colors.inkMuted,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.inkFaint,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
    padding: 10,
    paddingRight: 12,
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    ...shadows.soft,
  },
  rowImage: {
    width: 92,
    height: 106,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surfaceWarm,
  },
  rowCopy: {
    flex: 1,
    paddingVertical: 3,
    justifyContent: 'space-between',
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowOrigin: {
    ...text.overline,
    fontSize: 8.5,
    flex: 1,
    letterSpacing: 1.2,
  },
  rowRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rowMeta: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.inkMuted,
  },
  rowTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 20,
    lineHeight: 25,
    color: colors.ink,
    letterSpacing: -0.3,
    marginVertical: 4,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTag: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: colors.inkMuted,
  },
  rowArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryWhisper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredShadow: {
    width: '100%',
    backgroundColor: colors.ink,
    ...shadows.hero,
  },
  featuredCard: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.ink,
  },
  featuredTopShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 150,
  },
  featuredTopRow: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 34,
  },
  featuredBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 1.4,
    color: colors.primary,
  },
  featuredServings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    height: 32,
  },
  featuredServingsText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: colors.white,
  },
  featuredBottom: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 20,
  },
  featuredOrigin: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    lineHeight: 13,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: 'rgba(255, 232, 216, 0.82)',
    marginBottom: 7,
  },
  featuredTitle: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.8,
    color: colors.white,
  },
  featuredTagline: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 19,
    color: 'rgba(255, 247, 241, 0.78)',
    marginTop: 6,
    maxWidth: '87%',
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featuredMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  featuredMetaText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: 'rgba(255, 247, 241, 0.82)',
  },
  featuredMetaDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  featuredArrow: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
