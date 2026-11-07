import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii } from '../../theme';
import { GlassSurface, type GlassTone } from './GlassSurface';
import { PressableScale } from './PressableScale';

type IconName = ComponentProps<typeof Ionicons>['name'];

type IconButtonProps = {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
  iconSize?: number;
  tone?: 'glass' | 'solid' | 'dark' | 'soft' | 'ghost';
  color?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const glassTone: Record<'glass' | 'dark', GlassTone> = {
  glass: 'strong',
  dark: 'dark',
};

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 44,
  iconSize = 20,
  tone = 'glass',
  color,
  disabled = false,
  style,
}: IconButtonProps) {
  const resolvedColor =
    color ??
    (tone === 'solid'
      ? colors.white
      : tone === 'dark'
        ? colors.white
        : tone === 'ghost'
          ? colors.ink
          : colors.ink);

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.base, { width: size, height: size }, style]}
    >
      <View style={styles.content}>
        {tone === 'glass' || tone === 'dark' ? (
          <GlassSurface
            tone={glassTone[tone]}
            radius={size / 2}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              styles.surface,
              {
                borderRadius: size / 2,
                backgroundColor:
                  tone === 'solid'
                    ? colors.primary
                    : tone === 'soft'
                      ? colors.primarySoft
                      : 'transparent',
              },
            ]}
          />
        )}
        <Ionicons name={icon} size={iconSize} color={resolvedColor} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surface: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
});
