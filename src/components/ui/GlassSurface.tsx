import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';
import type { ReactNode } from 'react';
import { colors, radii } from '../../theme';

export type GlassTone = 'light' | 'strong' | 'dark' | 'red';

type GlassSurfaceProps = ViewProps & {
  tone?: GlassTone;
  intensity?: number;
  radius?: number;
  contentStyle?: ViewProps['style'];
  children?: ReactNode;
  bordered?: boolean;
  blurEnabled?: boolean;
};

const palette: Record<
  GlassTone,
  {
    tint: string;
    fallback: string;
    border: string;
    blurTint: 'light' | 'dark';
  }
> = {
  light: {
    tint: 'rgba(255, 252, 247, 0.46)',
    fallback: 'rgba(255, 252, 247, 0.94)',
    border: colors.glassBorder,
    blurTint: 'light',
  },
  strong: {
    tint: 'rgba(255, 253, 249, 0.66)',
    fallback: 'rgba(255, 253, 249, 0.97)',
    border: 'rgba(255, 255, 255, 0.78)',
    blurTint: 'light',
  },
  dark: {
    tint: 'rgba(30, 18, 16, 0.34)',
    fallback: 'rgba(30, 18, 16, 0.88)',
    border: colors.glassBorderDark,
    blurTint: 'dark',
  },
  red: {
    tint: 'rgba(150, 24, 32, 0.62)',
    fallback: 'rgba(150, 24, 32, 0.94)',
    border: 'rgba(255, 232, 220, 0.24)',
    blurTint: 'dark',
  },
};

/**
 * Larutan kaca: blur native hanya di iOS. Android memakai lapisan tint yang
 * lebih pekat karena eksperimen blur di Android membutuhkan BlurTargetView
 * dan dapat menurunkan performa pada perangkat lama.
 */
export function GlassSurface({
  tone = 'light',
  intensity,
  radius = radii.lg,
  contentStyle,
  bordered = true,
  blurEnabled = true,
  style,
  children,
  ...rest
}: GlassSurfaceProps) {
  const tones = palette[tone];
  const useBlur = blurEnabled && Platform.OS === 'ios';

  return (
    <View
      {...rest}
      style={[
        styles.root,
        {
          borderRadius: radius,
          // Tint hanya dipasang sekali pada lapisan di bawah. Sebelumnya
          // fallback juga dipasang di root, sehingga di Android/web warnanya
          // menumpuk dua kali dan permukaan kaca menjadi hampir opak.
          backgroundColor: 'transparent',
          borderColor: bordered ? tones.border : 'transparent',
          borderWidth: bordered ? StyleSheet.hairlineWidth * 1.6 : 0,
        },
        style,
      ]}
    >
      {useBlur ? (
        <BlurView
          intensity={intensity ?? (tone === 'dark' || tone === 'red' ? 42 : 30)}
          tint={tones.blurTint}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: useBlur ? tones.tint : tones.fallback },
        ]}
      />
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
  },
});
