import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { ReactNode } from 'react';

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  pressedScale?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Pressable dengan feedback skala berbasis Reanimated. Transform berjalan di
 * UI thread sehingga tetap responsif walaupun layar sedang melakukan animasi
 * masuk atau memuat daftar resep.
 */
export function PressableScale({
  children,
  style,
  scaleTo = 0.965,
  pressedScale,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const targetScale = pressedScale ?? scaleTo;

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ scale: scale.value }],
    }),
    [scale]
  );

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(event) => {
        scale.value = withSpring(targetScale, {
          damping: 18,
          stiffness: 320,
          mass: 0.6,
        });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, {
          damping: 18,
          stiffness: 280,
          mass: 0.6,
        });
        onPressOut?.(event);
      }}
      style={[
        style,
        animatedStyle,
        disabled ? { opacity: 0.55 } : undefined,
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}
