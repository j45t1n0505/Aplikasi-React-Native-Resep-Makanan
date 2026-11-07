import { Image } from 'expo-image';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { useSharedImage } from '../providers/SharedImageProvider';

/**
 * A custom shared-element surface. The card measures its image, the detail
 * screen measures its hero, and this overlay morphs between the two rectangles
 * above the navigator. All geometry is animated on the UI thread.
 */
export function SharedImageOverlay() {
  const { transition, progress } = useSharedImage();

  const destination = transition?.destination;
  const source = transition?.source;
  const radius = transition?.radius ?? 24;

  const animatedStyle = useAnimatedStyle(() => {
    if (!source || !destination) {
      return {};
    }

    const value = progress.value;
    return {
      left: interpolate(value, [0, 1], [source.x, destination.x]),
      top: interpolate(value, [0, 1], [source.y, destination.y]),
      width: interpolate(
        value,
        [0, 1],
        [source.width, destination.width],
        Extrapolation.CLAMP
      ),
      height: interpolate(
        value,
        [0, 1],
        [source.height, destination.height],
        Extrapolation.CLAMP
      ),
      borderRadius: interpolate(value, [0, 1], [radius, 0]),
      opacity: interpolate(value, [0, 0.02, 1], [0.98, 1, 1]),
    };
  }, [source, destination, radius, progress]);

  if (
    !transition ||
    !destination ||
    transition.phase === 'open'
  ) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      collapsable={false}
      style={[styles.overlay, animatedStyle]}
    >
      <Image
        source={transition.image}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
        cachePolicy="memory-disk"
        transition={0}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: '#E9DED2',
    zIndex: 9999,
    elevation: 9999,
  },
});
