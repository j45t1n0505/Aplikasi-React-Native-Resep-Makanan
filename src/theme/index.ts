import { Platform, StyleSheet, type ViewStyle } from 'react-native';

/**
 * Dapur Nusa design tokens.
 * The palette is built around a warm paper background, a deep chili red,
 * and brass-like accents. Glass surfaces are intentionally tinted warm
 * so they feel like frosted ceramic instead of clinical iOS blur.
 */
export const colors = {
  background: '#FAF5EF',
  backgroundDeep: '#F3E8DC',
  surface: '#FFFDF9',
  surfaceWarm: '#F7EDE2',
  primary: '#B4232A',
  primaryPressed: '#921A20',
  primaryDeep: '#7C1118',
  primaryDark: '#5E0C11',
  primarySoft: '#F7E4E1',
  primaryWhisper: '#FBEFEB',
  ink: '#251714',
  inkSoft: '#5C4941',
  inkMuted: '#8C7A70',
  inkFaint: '#B6A79D',
  line: 'rgba(74, 43, 34, 0.10)',
  lineStrong: 'rgba(74, 43, 34, 0.16)',
  gold: '#C58B4D',
  goldSoft: '#E8C9A2',
  sage: '#5F7356',
  sageSoft: '#E8EEE2',
  white: '#FFFFFF',
  overlay: 'rgba(37, 23, 20, 0.46)',
  glassLight: 'rgba(255, 253, 249, 0.64)',
  glassStrong: 'rgba(255, 253, 249, 0.82)',
  glassDark: 'rgba(37, 23, 20, 0.42)',
  glassDarkStrong: 'rgba(37, 23, 20, 0.60)',
  glassBorder: 'rgba(255, 255, 255, 0.68)',
  glassBorderDark: 'rgba(255, 255, 255, 0.18)',
} as const;

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
  display: 'PlayfairDisplay_700Bold',
  displaySemibold: 'PlayfairDisplay_600SemiBold',
  displayItalic: 'PlayfairDisplay_600SemiBold_Italic',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 56,
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  xxl: 32,
  pill: 999,
} as const;

export const layout = {
  screenPadding: 22,
  contentBottomPadding: 132,
} as const;

const createShadow = (
  color: string,
  opacity: number,
  radius: number,
  offsetY: number,
  elevation: number
): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: color,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
    },
    android: {
      elevation,
      shadowColor: color,
    },
    default: {},
  }) ?? {};

export const shadows = {
  card: createShadow('#3A2018', 0.09, 18, 10, 5),
  soft: createShadow('#3A2018', 0.06, 12, 6, 3),
  floating: createShadow('#3A2018', 0.16, 26, 14, 12),
  red: createShadow(colors.primaryDeep, 0.28, 20, 10, 9),
  hero: createShadow('#260E0B', 0.22, 28, 18, 14),
} as const;

export const text = StyleSheet.create({
  display: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 46,
    color: colors.ink,
    letterSpacing: -1.1,
  },
  displaySmall: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
    color: colors.ink,
    letterSpacing: -0.7,
  },
  pageTitle: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
    color: colors.ink,
    letterSpacing: -0.8,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 23,
    lineHeight: 29,
    color: colors.ink,
    letterSpacing: -0.35,
  },
  cardTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 21,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.inkSoft,
  },
  bodySmall: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.inkSoft,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.inkSoft,
    letterSpacing: 0.2,
  },
  overline: {
    fontFamily: fonts.bold,
    fontSize: 10,
    lineHeight: 14,
    color: colors.inkMuted,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  caption: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 15,
    color: colors.inkMuted,
  },
  serifItalic: {
    fontFamily: fonts.displayItalic,
    fontStyle: 'italic',
    color: colors.primary,
  },
});
