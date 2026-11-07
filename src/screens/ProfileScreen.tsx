import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RecipeRow } from '../components/RecipeCard';
import { Divider } from '../components/ui/Divider';
import { GlassSurface } from '../components/ui/GlassSurface';
import { PressableScale } from '../components/ui/PressableScale';
import { useHaptics } from '../hooks/useHaptics';
import { useOpenRecipe } from '../hooks/useOpenRecipe';
import { useDapur } from '../providers/DapurProvider';
import type { RootStackParamList, TabParamList } from '../navigation/types';
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

type ProfileProps = BottomTabScreenProps<TabParamList, 'Profile'>;

function formatLastCooked(value: string | undefined): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
  });
}

export function ProfileScreen({ navigation }: ProfileProps) {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const openRecipe = useOpenRecipe();
  const stackNavigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    cookCount,
    favorites,
    cooked,
    customRecipes,
    allRecipes,
    hapticsEnabled,
    setHapticsEnabled,
    lastCookedRecipeId,
    resetAll,
  } = useDapur();

  const triedRecipes = Object.keys(cooked).length;
  const lastCookedRecipe = allRecipes.find(
    (recipe) => recipe.id === lastCookedRecipeId
  );
  const lastCookedDate = lastCookedRecipe
    ? formatLastCooked(cooked[lastCookedRecipe.id]?.lastCookedAt)
    : '';

  const stats = [
    {
      icon: 'flame-outline' as const,
      value: cookCount,
      label: 'Kali masak',
    },
    {
      icon: 'heart-outline' as const,
      value: favorites.length,
      label: 'Disimpan',
    },
    {
      icon: 'restaurant-outline' as const,
      value: triedRecipes,
      label: 'Resep dicoba',
    },
  ];

  const confirmReset = () => {
    haptics.warning();
    confirmAction({
      title: 'Atur ulang semua data?',
      message:
        'Resep simpanan, resep buatanmu, progres checklist, dan catatan masak akan dihapus dari perangkat ini. Tindakan ini tidak bisa dibatalkan.',
      cancelLabel: 'Batal',
      confirmLabel: 'Hapus semua',
      destructive: true,
      onConfirm: async () => {
        await resetAll();
        haptics.success();
      },
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#F7E5DD', colors.background, colors.background]}
        locations={[0, 0.45, 1]}
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
              <Text style={styles.kicker}>DAPURMU</Text>
              <Text style={styles.title} accessibilityRole="header">
                Profil{'\n'}
                <Text style={styles.titleAccent}>dapur</Text>
              </Text>
              <Text style={styles.subtitle}>
                Catatan kecil dari semua yang kamu masak.
              </Text>
            </View>
            <View style={styles.monogramShadow}>
              <LinearGradient
                colors={['#A41D25', colors.primaryDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.monogram}
              >
                <View style={styles.monogramRing}>
                  <Text style={styles.monogramText}>D</Text>
                  <Text style={styles.monogramAccent}>n</Text>
                </View>
                <Text style={styles.monogramLabel}>DAPUR NUSA</Text>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.statsRow}>
            {stats.map((stat, index) => (
              <MotiView
                key={stat.label}
                from={{ opacity: 0, translateY: 12 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={timing({ duration: 430, delay: 90 + index * 60 })}
                style={styles.statWrap}
              >
                <GlassSurface
                  tone="strong"
                  radius={radii.lg}
                  style={styles.statCard}
                  contentStyle={styles.statContent}
                >
                  <Ionicons
                    name={stat.icon}
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </GlassSurface>
              </MotiView>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[text.overline, styles.sectionKicker]}>
                  TERAKHIR DI DAPUR
                </Text>
                <Text style={text.sectionTitle}>Jejak memasak</Text>
              </View>
              <PressableScale
                onPress={() => {
                  haptics.selection();
                  navigation.navigate('Favorites');
                }}
                accessibilityRole="button"
                accessibilityLabel="Buka resep simpanan"
                scaleTo={0.94}
              >
                <Text style={styles.sectionAction}>Simpanan</Text>
              </PressableScale>
            </View>

            {lastCookedRecipe ? (
              <View style={styles.lastCookedWrap}>
                <RecipeRow
                  recipe={lastCookedRecipe}
                  onOpen={openRecipe}
                  index={0}
                />
                {lastCookedDate ? (
                  <View style={styles.lastCookedNote}>
                    <View style={styles.lastCookedDot} />
                    <Text style={styles.lastCookedText}>
                      Terakhir dimasak {lastCookedDate}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <GlassSurface
                tone="strong"
                radius={radii.xl}
                contentStyle={styles.noCookContent}
              >
                <View style={styles.noCookIcon}>
                  <Ionicons
                    name="flame-outline"
                    size={22}
                    color={colors.gold}
                  />
                </View>
                <View style={styles.noCookCopy}>
                  <Text style={styles.noCookTitle}>Dapur masih tenang</Text>
                  <Text style={styles.noCookBody}>
                    Mulai mode masak dari resep mana pun. Setiap langkah yang
                    selesai akan tercatat di sini.
                  </Text>
                </View>
              </GlassSurface>
            )}
          </View>

          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={timing({ duration: 430, delay: 250 })}
            style={styles.section}
          >
            <View>
              <Text style={[text.overline, styles.sectionKicker]}>
                KOLEKSI PRIBADI
              </Text>
              <Text style={text.sectionTitle}>Resep buatanmu</Text>
            </View>

            <GlassSurface
              tone="strong"
              radius={radii.xl}
              contentStyle={styles.composerContent}
            >
              <View style={styles.composerIcon}>
                <Ionicons
                  name="create-outline"
                  size={21}
                  color={colors.primary}
                />
              </View>
              <View style={styles.composerCopy}>
                <Text style={styles.composerTitle}>
                  {customRecipes.length > 0
                    ? `${customRecipes.length} resep tersimpan`
                    : 'Belum ada resep sendiri'}
                </Text>
                <Text style={styles.composerBody}>
                  Tulis resep keluarga dan simpan langsung di perangkat ini.
                </Text>
              </View>
              <PressableScale
                onPress={() => {
                  haptics.selection();
                  stackNavigation.navigate('AddRecipe');
                }}
                accessibilityRole="button"
                accessibilityLabel="Tulis resep sendiri"
                style={styles.composerButton}
                scaleTo={0.94}
              >
                <Ionicons name="add" size={14} color={colors.white} />
                <Text style={styles.composerButtonText}>Tulis</Text>
              </PressableScale>
            </GlassSurface>
          </MotiView>

          <View style={styles.section}>
            <View>
              <Text style={[text.overline, styles.sectionKicker]}>
                PREFERENSI
              </Text>
              <Text style={text.sectionTitle}>Nyaman di tanganmu</Text>
            </View>

            <MotiView
              from={{ opacity: 0, translateY: 14 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={timing({ duration: 430, delay: 310 })}
            >
              <GlassSurface
                tone="strong"
                radius={radii.xl}
                contentStyle={styles.prefsContent}
              >
              <View style={styles.prefRow}>
                <View style={styles.prefIcon}>
                  <Ionicons
                    name="phone-portrait-outline"
                    size={19}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.prefCopy}>
                  <Text style={styles.prefTitle}>Getaran sentuhan</Text>
                  <Text style={styles.prefBody}>
                    Umpan balik halus saat mencentang bahan dan memulai timer.
                  </Text>
                </View>
                <Switch
                  value={hapticsEnabled}
                  onValueChange={(value) => {
                    if (value) {
                      // Pakai preview: state konteks belum berubah saat switch
                      // dinyalakan, jadi selection() biasa masih no-op.
                      haptics.preview();
                    }
                    setHapticsEnabled(value);
                  }}
                  trackColor={{
                    false: 'rgba(74, 43, 34, 0.16)',
                    true: colors.primary,
                  }}
                  thumbColor={colors.white}
                  ios_backgroundColor="rgba(74, 43, 34, 0.16)"
                  accessibilityLabel="Aktifkan getaran sentuhan"
                />
              </View>

              <Divider inset={56} />

              <PressableScale
                onPress={confirmReset}
                accessibilityRole="button"
                accessibilityLabel="Atur ulang semua data aplikasi"
                style={styles.prefRow}
                scaleTo={0.99}
              >
                <View style={[styles.prefIcon, styles.prefIconDanger]}>
                  <Ionicons
                    name="trash-outline"
                    size={19}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.prefCopy}>
                  <Text style={styles.prefTitle}>Atur ulang data</Text>
                  <Text style={styles.prefBody}>
                    Hapus simpanan, checklist, dan catatan memasak.
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.inkFaint}
                />
              </PressableScale>
              </GlassSurface>
            </MotiView>
          </View>

          <View style={styles.section}>
            <View>
              <Text style={[text.overline, styles.sectionKicker]}>
                TENTANG
              </Text>
              <Text style={text.sectionTitle}>Dapur Nusa</Text>
            </View>

            <MotiView
              from={{ opacity: 0, translateY: 14 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={timing({ duration: 430, delay: 360 })}
            >
              <GlassSurface
                tone="strong"
                radius={radii.xl}
                contentStyle={styles.aboutContent}
              >
              <View style={styles.aboutTop}>
                <View style={styles.aboutMark}>
                  <Text style={styles.aboutMarkText}>n</Text>
                  <Ionicons
                    name="sparkles"
                    size={10}
                    color={colors.gold}
                    style={styles.aboutSparkle}
                  />
                </View>
                <View style={styles.aboutCopy}>
                  <Text style={styles.aboutTitle}>
                    Resep lokal, disimpan untukmu.
                  </Text>
                  <Text style={styles.aboutBody}>
                    Dapur Nusa adalah buku resep pribadi untuk masakan rumah
                    Indonesia. Semua data tersimpan di perangkat, tanpa akun
                    dan tanpa koneksi internet.
                  </Text>
                </View>
              </View>

              <View style={styles.aboutRule} />

              <View style={styles.aboutRows}>
                <AboutRow
                  icon="layers-outline"
                  label="Versi aplikasi"
                  value="1.0.0"
                />
                <AboutRow
                  icon="camera-outline"
                  label="Foto masakan"
                  value="Pexels"
                />
                <AboutRow
                  icon="leaf-outline"
                  label="Resep & konten"
                  value="Redaksi Dapur Nusa"
                />
              </View>

              <View style={styles.aboutFooter}>
                <Ionicons name="heart" size={11} color={colors.primary} />
                <Text style={styles.aboutFooterText}>
                  Dibuat untuk dapur rumahan di Indonesia.
                </Text>
              </View>
              </GlassSurface>
            </MotiView>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerRule} />
            <Text style={styles.footerQuote}>
              “Masakan terbaik adalah yang dibuat pelan-pelan.”
            </Text>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}

function AboutRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.aboutRow}>
      <Ionicons name={icon} size={14} color={colors.inkMuted} />
      <Text style={styles.aboutRowLabel}>{label}</Text>
      <Text style={styles.aboutRowValue}>{value}</Text>
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
    height: 440,
  },
  decorOne: {
    position: 'absolute',
    top: -120,
    right: -90,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(180, 35, 42, 0.06)',
  },
  decorTwo: {
    position: 'absolute',
    top: 280,
    left: -110,
    width: 240,
    height: 240,
    borderRadius: 120,
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
    gap: 16,
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
    maxWidth: 230,
  },
  monogramShadow: {
    width: 104,
    height: 118,
    borderRadius: 30,
    backgroundColor: colors.primaryDeep,
    marginTop: 3,
    ...shadows.red,
  },
  monogram: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: 5,
  },
  monogramRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1,
    borderColor: 'rgba(232, 201, 162, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  monogramText: {
    fontFamily: fonts.display,
    fontSize: 25,
    lineHeight: 32,
    color: '#FFF7EF',
    marginRight: -1,
  },
  monogramAccent: {
    fontFamily: fonts.displayItalic,
    fontSize: 23,
    lineHeight: 31,
    color: colors.goldSoft,
  },
  monogramLabel: {
    fontFamily: fonts.bold,
    fontSize: 6.5,
    letterSpacing: 1.4,
    color: 'rgba(255, 244, 233, 0.6)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 28,
  },
  statWrap: {
    flex: 1,
  },
  statCard: {
    width: '100%',
    ...shadows.soft,
  },
  statContent: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 27,
    lineHeight: 32,
    color: colors.ink,
  },
  statLabel: {
    fontFamily: fonts.semibold,
    fontSize: 8.5,
    letterSpacing: 0.6,
    color: colors.inkMuted,
    textTransform: 'uppercase',
  },
  section: {
    marginTop: 30,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionKicker: {
    fontSize: 8.5,
    letterSpacing: 1.6,
    color: colors.primary,
    marginBottom: 3,
  },
  sectionAction: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: colors.primary,
    paddingBottom: 3,
  },
  lastCookedWrap: {
    gap: 9,
  },
  lastCookedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 5,
  },
  lastCookedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  lastCookedText: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: colors.inkFaint,
  },
  noCookContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 16,
  },
  noCookIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(197, 139, 77, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noCookCopy: {
    flex: 1,
    gap: 3,
  },
  noCookTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    color: colors.ink,
  },
  noCookBody: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: colors.inkMuted,
  },
  composerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 11,
  },
  composerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(180, 35, 42, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerCopy: {
    flex: 1,
    gap: 3,
  },
  composerTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.ink,
  },
  composerBody: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: colors.inkMuted,
  },
  composerButton: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    ...shadows.red,
  },
  composerButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: colors.white,
  },
  prefsContent: {
    paddingHorizontal: 6,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  prefIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryWhisper,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(180, 35, 42, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefIconDanger: {
    backgroundColor: colors.primarySoft,
  },
  prefCopy: {
    flex: 1,
    gap: 3,
  },
  prefTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.ink,
  },
  prefBody: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: colors.inkMuted,
    maxWidth: 280,
  },
  aboutContent: {
    padding: 18,
  },
  aboutTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
  },
  aboutMark: {
    width: 50,
    height: 58,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.red,
  },
  aboutMarkText: {
    fontFamily: fonts.displayItalic,
    fontSize: 27,
    lineHeight: 34,
    color: colors.white,
  },
  aboutSparkle: {
    position: 'absolute',
    top: 7,
    right: 8,
  },
  aboutCopy: {
    flex: 1,
    gap: 4,
  },
  aboutTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 18,
    lineHeight: 23,
    color: colors.ink,
  },
  aboutBody: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 17,
    color: colors.inkMuted,
  },
  aboutRule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginVertical: 15,
  },
  aboutRows: {
    gap: 9,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aboutRowLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: colors.inkMuted,
  },
  aboutRowValue: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: colors.inkSoft,
  },
  aboutFooter: {
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  aboutFooterText: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: colors.inkFaint,
  },
  footer: {
    alignItems: 'center',
    marginTop: 36,
    gap: 8,
  },
  footerRule: {
    width: 30,
    height: 1,
    backgroundColor: colors.goldSoft,
    marginBottom: 4,
  },
  footerQuote: {
    fontFamily: fonts.displayItalic,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkSoft,
    textAlign: 'center',
    maxWidth: 270,
  },
});
