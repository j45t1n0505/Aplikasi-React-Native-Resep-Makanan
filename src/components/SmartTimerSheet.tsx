import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatClock } from '../utils/time';
import { useHaptics } from '../hooks/useHaptics';
import type { SmartTimer } from '../hooks/useSmartTimer';
import { colors, fonts, radii } from '../theme';
import { timing } from '../theme/motion';
import { GlassSurface } from './ui/GlassSurface';
import { PressableScale } from './ui/PressableScale';
import { TimerRing } from './TimerRing';

const presets = [
  { seconds: 60, label: '1m' },
  { seconds: 180, label: '3m' },
  { seconds: 300, label: '5m' },
  { seconds: 600, label: '10m' },
  { seconds: 1800, label: '30m' },
];

export function SmartTimerSheet({
  visible,
  onClose,
  timer,
  stepLabel,
  onTimerStarted,
}: {
  visible: boolean;
  onClose: () => void;
  timer: SmartTimer;
  stepLabel?: string;
  onTimerStarted?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const haptics = useHaptics();
  const dialSize = Math.min(252, width - 104);

  const status = timer.isFinished
    ? 'Waktu habis. Periksa masakanmu.'
    : timer.isRunning
      ? 'Timer berjalan di latar belakang.'
      : timer.remainingSeconds < timer.durationSeconds
        ? 'Timer dijeda. Lanjutkan kapan saja.'
        : 'Siap menemani langkah memasakmu.';

  const statusColor = timer.isFinished
    ? '#F3D6B4'
    : timer.isRunning
      ? '#D8E9C8'
      : 'rgba(255, 247, 241, 0.72)';

  const toggleTimer = () => {
    if (timer.isRunning) {
      haptics.soft();
      timer.pause();
    } else {
      haptics.medium();
      // Mulai dari durasi penuh berarti timer baru untuk langkah yang sedang
      // dibuka. Melanjutkan timer yang dijeda tetap memakai langkah asalnya.
      if (timer.remainingSeconds >= timer.durationSeconds) {
        onTimerStarted?.();
      }
      timer.start();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Tutup timer"
        />
        <MotiView
          from={{ translateY: 56, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={timing({ duration: 380 })}
          style={[styles.sheet, { maxHeight: height * 0.93 }]}
        >
          <LinearGradient
            colors={['#8A151C', '#A51F26', '#6B0B10']}
            locations={[0, 0.48, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.glow} />
          <View style={styles.glowSmall} />
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>BANTUAN DAPUR</Text>
              <Text style={styles.title}>Timer pintar</Text>
              {stepLabel ? (
                <Text style={styles.stepLabel} numberOfLines={1}>
                  {stepLabel}
                </Text>
              ) : null}
            </View>
            <PressableScale
              onPress={() => {
                haptics.soft();
                onClose();
              }}
              accessibilityRole="button"
              accessibilityLabel="Tutup timer"
              style={styles.closeButton}
            >
              <GlassSurface
                tone="dark"
                radius={22}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="close" size={20} color={colors.white} />
            </PressableScale>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 18) + 16 },
            ]}
          >
            <View style={styles.dialWrap}>
              <TimerRing
                remainingMs={timer.remainingMs}
                durationMs={timer.durationMs}
                size={dialSize}
                strokeWidth={9}
                showTicks
                centerFill="rgba(255, 247, 241, 0.045)"
                trackColor="rgba(255, 247, 241, 0.16)"
                gradientColors={['#F3D6B4', '#FFF9F3']}
              >
                <Text style={styles.dialLabel}>
                  {timer.isFinished ? 'SELESAI' : 'SISA WAKTU'}
                </Text>
                <Text style={styles.time}>{formatClock(timer.remainingSeconds)}</Text>
                <View style={styles.statusRow}>
                  <View
                    style={[styles.statusDot, { backgroundColor: statusColor }]}
                  />
                  <Text style={[styles.status, { color: statusColor }]}>
                    {timer.isFinished
                      ? 'Selesai'
                      : timer.isRunning
                        ? 'Berjalan'
                        : timer.remainingSeconds < timer.durationSeconds
                          ? 'Dijeda'
                          : 'Siap'}
                  </Text>
                </View>
              </TimerRing>
            </View>

            <Text style={styles.statusMessage}>{status}</Text>

            <View style={styles.controls}>
              <PressableScale
                onPress={() => {
                  haptics.selection();
                  timer.reset(timer.durationSeconds);
                }}
                accessibilityRole="button"
                accessibilityLabel="Atur ulang timer"
                style={styles.secondaryControl}
              >
                <GlassSurface
                  tone="dark"
                  radius={24}
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons name="refresh" size={20} color={colors.white} />
              </PressableScale>

              <PressableScale
                onPress={toggleTimer}
                accessibilityRole="button"
                accessibilityLabel={
                  timer.isRunning ? 'Jeda timer' : 'Mulai timer'
                }
                style={styles.primaryControl}
              >
                <Ionicons
                  name={timer.isRunning ? 'pause' : 'play'}
                  size={30}
                  color={colors.primaryDeep}
                  style={timer.isRunning ? undefined : styles.playIcon}
                />
              </PressableScale>

              <PressableScale
                onPress={() => {
                  haptics.selection();
                  timer.addMinute();
                }}
                accessibilityRole="button"
                accessibilityLabel="Tambah satu menit"
                style={styles.secondaryControl}
              >
                <GlassSurface
                  tone="dark"
                  radius={24}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.plusMinute}>+1</Text>
              </PressableScale>
            </View>

            <View style={styles.presetsHeader}>
              <Text style={styles.presetsTitle}>Atur cepat</Text>
              <Text style={styles.presetsHint}>ketuk untuk memulai</Text>
            </View>
            <View style={styles.presets}>
              {presets.map((preset) => {
                const active = timer.durationSeconds === preset.seconds;
                return (
                  <PressableScale
                    key={preset.seconds}
                    onPress={() => {
                      haptics.selection();
                      onTimerStarted?.();
                      timer.restartWith(preset.seconds);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Timer ${preset.label}`}
                    style={[
                      styles.preset,
                      active ? styles.presetActive : undefined,
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        active ? styles.presetTextActive : undefined,
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>

            <View style={styles.footnote}>
              <Ionicons
                name="sunny-outline"
                size={14}
                color="rgba(255, 247, 241, 0.5)"
              />
              <Text style={styles.footnoteText}>
                Layar tetap menyala selama mode memasak. Tutup panel ini dan
                timer tetap berjalan.
              </Text>
            </View>
          </ScrollView>
        </MotiView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(24, 12, 10, 0.58)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.primaryDeep,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    overflow: 'hidden',
    paddingTop: 9,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  glow: {
    position: 'absolute',
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: 'rgba(255, 219, 184, 0.10)',
    top: -150,
    right: -90,
  },
  glowSmall: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: 50,
    left: -110,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 247, 241, 0.28)',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 8,
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1.9,
    color: 'rgba(255, 224, 199, 0.65)',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 29,
    lineHeight: 36,
    color: colors.white,
    letterSpacing: -0.5,
  },
  stepLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: 'rgba(255, 247, 241, 0.55)',
    marginTop: 2,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  dialWrap: {
    alignItems: 'center',
    marginTop: 2,
  },
  dialLabel: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 2,
    color: 'rgba(255, 240, 224, 0.52)',
    marginBottom: 5,
  },
  time: {
    fontFamily: fonts.bold,
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: -2,
    color: colors.white,
    fontVariant: ['tabular-nums'],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  status: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  statusMessage: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 17,
    color: 'rgba(255, 247, 241, 0.58)',
    textAlign: 'center',
    marginTop: -2,
    marginBottom: 14,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 26,
    marginBottom: 20,
  },
  secondaryControl: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryControl: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B070B',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 9,
  },
  playIcon: {
    marginLeft: 4,
  },
  plusMinute: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.white,
    letterSpacing: -0.3,
  },
  presetsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 9,
    paddingHorizontal: 2,
  },
  presetsTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.white,
  },
  presetsHint: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: 'rgba(255, 247, 241, 0.42)',
  },
  presets: {
    flexDirection: 'row',
    gap: 6,
  },
  preset: {
    flex: 1,
    height: 38,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetActive: {
    backgroundColor: '#FFF8F0',
    borderColor: '#FFF8F0',
  },
  presetText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: 'rgba(255, 247, 241, 0.8)',
  },
  presetTextActive: {
    color: colors.primaryDeep,
  },
  footnote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  footnoteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: 'rgba(255, 247, 241, 0.42)',
  },
});
