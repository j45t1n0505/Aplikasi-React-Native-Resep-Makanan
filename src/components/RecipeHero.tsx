import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type ViewInstance,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSharedImage } from '../providers/SharedImageProvider';
import type { Recipe } from '../types/recipe';
import { colors } from '../theme';
import { IconButton } from './ui/IconButton';

export function getHeroHeight(screenWidth: number): number {
  return Math.min(500, Math.max(420, screenWidth * 1.12));
}

export function RecipeHero({
  recipe,
  scrollY,
  isFavorite,
  onBack,
  onToggleFavorite,
  onDelete,
}: {
  recipe: Recipe;
  scrollY: SharedValue<number>;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
  onDelete?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const heroHeight = getHeroHeight(width);
  const heroRef = useRef<ViewInstance>(null);
  const { transition, setDestination, isTransitioning } = useSharedImage();
  const transitioning = isTransitioning(recipe.id);

  const measureHero = useCallback(() => {
    const node = heroRef.current;
    if (!node || transition?.recipeId !== recipe.id) {
      return;
    }
    node.measureInWindow((x, y, measuredWidth, measuredHeight) => {
      if (measuredWidth <= 0 || measuredHeight <= 0) {
        return;
      }
      setDestination(recipe.id, {
        x,
        y,
        width: measuredWidth,
        height: measuredHeight,
      });
    });
  }, [recipe.id, setDestination, transition?.recipeId]);

  useEffect(() => {
    const timer = setTimeout(measureHero, 50);
    return () => clearTimeout(timer);
  }, [measureHero]);

  const handleLayout = (_event: LayoutChangeEvent) => {
    measureHero();
  };

  const imageStyle = useAnimatedStyle(() => {
    const offset = scrollY.value;
    const scale = interpolate(
      offset,
      [-220, 0],
      [1.3, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      offset,
      [0, heroHeight],
      [0, heroHeight * 0.45],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY }, { scale }],
    };
  }, [heroHeight, scrollY]);

  return (
    <View
      ref={heroRef}
      collapsable={false}
      onLayout={handleLayout}
      style={[styles.hero, { height: heroHeight }]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          imageStyle,
          { opacity: transitioning ? 0 : 1 },
        ]}
      >
        <Image
          source={recipe.image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="center"
          cachePolicy="memory-disk"
          transition={260}
        />
      </Animated.View>
      <LinearGradient
        colors={[
          'rgba(23, 11, 9, 0.42)',
          'rgba(23, 11, 9, 0.04)',
          'rgba(23, 11, 9, 0)',
        ]}
        locations={[0, 0.32, 0.6]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(23, 11, 9, 0)', 'rgba(23, 11, 9, 0.38)']}
        style={styles.bottomShade}
      />
      <View
        style={[
          styles.controls,
          { top: insets.top + 10 },
        ]}
      >
        <IconButton
          icon="chevron-back"
          onPress={onBack}
          accessibilityLabel="Kembali"
          tone="dark"
          size={46}
          iconSize={22}
        />
        <View style={styles.actions}>
          {onDelete ? (
            <IconButton
              icon="trash-outline"
              onPress={onDelete}
              accessibilityLabel="Hapus resep buatan sendiri"
              tone="glass"
              color={colors.primary}
              size={46}
              iconSize={20}
            />
          ) : null}
          <IconButton
            icon={isFavorite ? 'heart' : 'heart-outline'}
            onPress={onToggleFavorite}
            accessibilityLabel={
              isFavorite ? 'Hapus dari simpanan' : 'Simpan resep'
            }
            tone="glass"
            color={isFavorite ? colors.primary : colors.ink}
            size={46}
            iconSize={21}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.ink,
  },
  bottomShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
  controls: {
    position: 'absolute',
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
