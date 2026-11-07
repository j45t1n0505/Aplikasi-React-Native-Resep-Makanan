import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadows, text } from '../theme';
import { timing } from '../theme/motion';
import { PressableScale } from './ui/PressableScale';

export function RecipeComposerBanner({
  count,
  onPress,
}: {
  count: number;
  onPress: () => void;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={timing({ duration: 480, delay: 180 })}
      style={styles.shadow}
    >
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Tulis resep sendiri"
        scaleTo={0.98}
        style={styles.card}
      >
        <LinearGradient
          colors={['#FFFDF9', '#F7E9DD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" style={styles.glow} />
        <View style={styles.iconWrap}>
          <Ionicons name="create-outline" size={21} color={colors.primary} />
          {count > 0 ? (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{count > 9 ? '9+' : count}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.copy}>
          <Text style={styles.kicker}>RESEP KELUARGA</Text>
          <Text style={styles.title}>
            {count > 0 ? `${count} resep buatanmu` : 'Tulis resep sendiri'}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            Simpan resep andalan rumah, lengkap dengan bahan, langkah, dan
            timer.
          </Text>
        </View>
        <View style={styles.action}>
          <Ionicons name="add" size={19} color={colors.white} />
        </View>
      </PressableScale>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  shadow: {
    marginTop: 26,
    borderRadius: radii.xl,
    ...shadows.soft,
  },
  card: {
    minHeight: 104,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(180, 35, 42, 0.14)',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 13,
  },
  glow: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(180, 35, 42, 0.06)',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(180, 35, 42, 0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 19,
    height: 19,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: fonts.bold,
    fontSize: 8,
    color: colors.white,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    ...text.overline,
    fontSize: 8,
    letterSpacing: 1.45,
    color: colors.primary,
  },
  title: {
    fontFamily: fonts.displaySemibold,
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: colors.inkMuted,
  },
  action: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.red,
  },
});
