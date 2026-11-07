import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useKeepAwake } from 'expo-keep-awake';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SmartTimerSheet } from '../components/SmartTimerSheet';
import { TimerRing } from '../components/TimerRing';
import { GlassSurface } from '../components/ui/GlassSurface';
import { PressableScale } from '../components/ui/PressableScale';
import { useHaptics } from '../hooks/useHaptics';
import { useSmartTimer } from '../hooks/useSmartTimer';
import { useDapur } from '../providers/DapurProvider';
import type { RootStackParamList } from '../navigation/types';
import type { Recipe, RecipeStep } from '../types/recipe';
import {
  colors,
  fonts,
  layout,
  radii,
  shadows,
  text,
} from '../theme';
import { spring, timing } from '../theme/motion';
import { confirmAction } from '../utils/confirm';
import { formatClock, formatDuration } from '../utils/time';
import { getRecipeById } from '../utils/recipes';

type CookingProps = NativeStackScreenProps<RootStackParamList, 'CookingMode'>;

export function CookingModeScreen({ route, navigation }: CookingProps) {
  const { allRecipes } = useDapur();
  const recipe = getRecipeById(allRecipes, route.params.recipeId);

  if (!recipe) {
    return (
      <View style={styles.missing}>
        <StatusBar style="dark" />
        <Text style={styles.missingTitle}>Resep tidak ditemukan</Text>
        <PressableScale
          onPress={() => navigation.goBack()}
          style={styles.missingButton}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
        >
          <Text style={styles.missingButtonText}>Kembali</Text>
        </PressableScale>
      </View>
    );
  }

  return <CookingModeContent recipe={recipe} navigation={navigation} />;
}

function CookingModeContent({
  recipe,
  navigation,
}: {
  recipe: Recipe;
  navigation: CookingProps['navigation'];
}) {
  useKeepAwake('dapur-nusa-cooking');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const haptics = useHaptics();
  const { markCooked, cooked } = useDapur();
  const listRef = useRef<FlatList<RecipeStep>>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerStepIndex, setTimerStepIndex] = useState(0);
  const [timerVisible, setTimerVisible] = useState(false);
  const [timerAlert, setTimerAlert] = useState(false);
  const [completionVisible, setCompletionVisible] = useState(false);
  const [completionCount, setCompletionCount] = useState(0);
  const finishedRef = useRef(false);

  const timer = useSmartTimer({
    initialSeconds: recipe.steps[0]?.timerSeconds ?? 300,
    onComplete: () => {
      setTimerAlert(true);
      haptics.success();
    },
  });
  const pauseTimer = timer.pause;

  const currentStep = recipe.steps[currentIndex] ?? recipe.steps[0];
  const isLastStep = currentIndex === recipe.steps.length - 1;
  const progress = (currentIndex + 1) / recipe.steps.length;
  const progressValue = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 320 });
  }, [progress, progressValue]);

  // Timer boleh terus berjalan saat pengguna pindah langkah. Simpan langkah
  // asal timer supaya pengingat dan tombol "Ulangi" tidak menunjuk langkah
  // yang salah hanya karena halaman sedang dibuka di langkah lain.
  const timerStep = recipe.steps[timerStepIndex] ?? currentStep;
  const timerIsActive =
    timer.isRunning ||
    timer.isFinished ||
    timer.remainingSeconds < timer.durationSeconds;
  const timerLabelIndex = timerIsActive ? timerStepIndex : currentIndex;
  const timerLabelStep = recipe.steps[timerLabelIndex] ?? currentStep;

  const goToStep = useCallback(
    (nextIndex: number) => {
      const clamped = Math.max(
        0,
        Math.min(recipe.steps.length - 1, nextIndex)
      );
      listRef.current?.scrollToIndex({ index: clamped, animated: true });
      setCurrentIndex(clamped);
      haptics.selection();
      setTimerAlert(false);
    },
    [haptics, recipe.steps.length]
  );

  const finishCooking = useCallback(() => {
    if (finishedRef.current) {
      setCompletionVisible(true);
      return;
    }
    finishedRef.current = true;
    const nextCount = (cooked[recipe.id]?.count ?? 0) + 1;
    markCooked(recipe.id);
    setCompletionCount(nextCount);
    pauseTimer();
    setTimerVisible(false);
    setTimerAlert(false);
    setCompletionVisible(true);
    haptics.success();
  }, [
    cooked,
    haptics,
    markCooked,
    pauseTimer,
    recipe.id,
  ]);

  const handleNext = () => {
    if (isLastStep) {
      finishCooking();
      return;
    }
    goToStep(currentIndex + 1);
  };

  const handleClose = useCallback(() => {
    haptics.warning();
    confirmAction({
      title: 'Keluar dari mode masak?',
      message: 'Timer akan berhenti dan posisi langkah tidak disimpan.',
      cancelLabel: 'Lanjut masak',
      confirmLabel: 'Keluar',
      destructive: true,
      onConfirm: () => {
        pauseTimer();
        navigation.goBack();
      },
    });
  }, [haptics, navigation, pauseTimer]);

  // Android punya tombol back fisik. Tanpa handler ini, pengguna bisa keluar
  // dari Cooking Mode tanpa konfirmasi dan timer langsung berhenti. Saat sheet
  // timer atau modal selesai terbuka, biarkan modal yang menangani back dulu.
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (timerVisible || completionVisible) {
          return false;
        }
        handleClose();
        return true;
      }
    );

    return () => subscription.remove();
  }, [completionVisible, handleClose, timerVisible]);

  const handleSuggestedTimer = useCallback(
    (seconds: number, stepIndex: number) => {
      haptics.selection();
      setTimerStepIndex(stepIndex);
      timer.restartWith(seconds);
      setTimerAlert(false);
      setTimerVisible(true);
    },
    // timer.restartWith stabil; objek timer berubah tiap detik saat berjalan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [haptics, timer.restartWith]
  );

  const handleMomentumEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / Math.max(width, 1)
    );
    if (
      nextIndex !== currentIndex &&
      nextIndex >= 0 &&
      nextIndex < recipe.steps.length
    ) {
      setCurrentIndex(nextIndex);
      haptics.selection();
      setTimerAlert(false);
    }
  };

  const renderStep = useCallback<ListRenderItem<RecipeStep>>(
    ({ item, index }) => (
      <StepSlide
        step={item}
        image={recipe.image}
        index={index}
        total={recipe.steps.length}
        width={width}
        onStartTimer={handleSuggestedTimer}
      />
    ),
    [handleSuggestedTimer, recipe.image, recipe.steps.length, width]
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#F7E7DF', colors.background, colors.background]}
        locations={[0, 0.55, 1]}
        style={styles.background}
      />
      <View pointerEvents="none" style={styles.decor} />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <PressableScale
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Keluar dari mode masak"
          style={styles.closeButton}
          scaleTo={0.92}
        >
          <GlassSurface
            tone="strong"
            radius={23}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="close" size={21} color={colors.ink} />
        </PressableScale>

        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>
            LANGKAH {currentIndex + 1} DARI {recipe.steps.length}
          </Text>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
        </View>

        <PressableScale
          onPress={() => {
            haptics.selection();
            setTimerVisible(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Buka timer pintar"
          style={styles.timerPill}
          scaleTo={0.96}
        >
          <GlassSurface
            tone="strong"
            radius={22}
            style={StyleSheet.absoluteFill}
          />
          <TimerRing
            remainingMs={timer.remainingMs}
            durationMs={timer.durationMs}
            size={30}
            strokeWidth={3}
            centerPadding={0}
            centerFill="transparent"
            trackColor={colors.primarySoft}
            gradientColors={['#D97759', colors.primary]}
          >
            <Ionicons
              name={timer.isRunning ? 'pause' : 'play'}
              size={8}
              color={colors.primary}
              style={timer.isRunning ? undefined : styles.miniPlay}
            />
          </TimerRing>
          <Text style={styles.timerPillText}>
            {formatClock(timer.remainingSeconds)}
          </Text>
        </PressableScale>
      </View>

      {timerAlert ? (
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={timing({ duration: 280 })}
          style={styles.timerAlert}
        >
          <View style={styles.alertIcon}>
            <Ionicons name="notifications" size={16} color={colors.white} />
          </View>
          <View style={styles.alertCopy}>
            <Text style={styles.alertTitle}>Waktunya mengecek!</Text>
            <Text style={styles.alertBody} numberOfLines={1}>
              {timerStep.title} · {formatClock(timer.remainingSeconds)}
            </Text>
          </View>
          <PressableScale
            onPress={() => {
              haptics.selection();
              timer.restartWith(
                timerStep.timerSeconds ?? timer.durationSeconds
              );
              setTimerAlert(false);
            }}
            style={styles.alertAction}
            accessibilityRole="button"
            accessibilityLabel="Ulangi timer langkah ini"
          >
            <Text style={styles.alertActionText}>Ulangi</Text>
          </PressableScale>
          <PressableScale
            onPress={() => setTimerAlert(false)}
            style={styles.alertClose}
            accessibilityRole="button"
            accessibilityLabel="Tutup pengingat timer"
          >
            <Ionicons
              name="close"
              size={15}
              color="rgba(255, 247, 241, 0.7)"
            />
          </PressableScale>
        </MotiView>
      ) : null}

      <FlatList
        ref={listRef}
        data={recipe.steps}
        renderItem={renderStep}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumEnd}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        style={styles.pager}
      />

      <View
        style={[
          styles.footerWrap,
          { paddingBottom: Math.max(insets.bottom, 10) + 4 },
        ]}
      >
        <View style={styles.footerShadow}>
          <GlassSurface
            tone="strong"
            radius={26}
            contentStyle={styles.footer}
          >
            <PressableScale
              onPress={() => goToStep(currentIndex - 1)}
              disabled={currentIndex === 0}
              accessibilityRole="button"
              accessibilityLabel="Langkah sebelumnya"
              style={[
                styles.backButton,
                currentIndex === 0 ? styles.backButtonDisabled : undefined,
              ]}
              scaleTo={0.92}
            >
              <Ionicons
                name="arrow-back"
                size={19}
                color={currentIndex === 0 ? colors.inkFaint : colors.ink}
              />
            </PressableScale>

            <View style={styles.dots}>
              {recipe.steps.map((step, index) => (
                <View
                  key={step.id}
                  style={[
                    styles.dot,
                    index === currentIndex ? styles.dotActive : undefined,
                  ]}
                />
              ))}
            </View>

            <PressableScale
              onPress={handleNext}
              accessibilityRole="button"
              accessibilityLabel={
                isLastStep ? 'Selesaikan masakan' : 'Langkah berikutnya'
              }
              style={styles.nextButton}
              scaleTo={0.96}
            >
              <Text style={styles.nextText}>
                {isLastStep ? 'Selesai' : 'Lanjut'}
              </Text>
              <Ionicons
                name={isLastStep ? 'checkmark' : 'arrow-forward'}
                size={16}
                color={colors.white}
              />
            </PressableScale>
          </GlassSurface>
        </View>
      </View>

      <SmartTimerSheet
        visible={timerVisible}
        onClose={() => setTimerVisible(false)}
        timer={timer}
        stepLabel={`Langkah ${timerLabelIndex + 1} · ${timerLabelStep.title}`}
        onTimerStarted={() => setTimerStepIndex(currentIndex)}
      />

      <CompletionModal
        visible={completionVisible}
        recipe={recipe}
        cookedCount={completionCount}
        onClose={() => setCompletionVisible(false)}
        onBackToDetail={() => {
          setCompletionVisible(false);
          navigation.goBack();
        }}
        onBackHome={() => {
          setCompletionVisible(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Tabs', params: { screen: 'Home' } }],
          });
        }}
      />
    </View>
  );
}

function StepSlide({
  step,
  image,
  index,
  total,
  width,
  onStartTimer,
}: {
  step: RecipeStep;
  image: Recipe['image'];
  index: number;
  total: number;
  width: number;
  onStartTimer: (seconds: number, stepIndex: number) => void;
}) {
  const imageHeight = Math.min(280, Math.max(210, width * 0.58));

  return (
    <View style={{ width }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.stepContent}
      >
        <View style={[styles.imageCard, { height: imageHeight }]}>
          <Image
            source={image}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition={step.imagePosition ?? 'center'}
            cachePolicy="memory-disk"
            transition={240}
          />
          <LinearGradient
            colors={['rgba(23, 11, 9, 0.30)', 'rgba(23, 11, 9, 0)']}
            style={styles.imageTopGradient}
          />
          <LinearGradient
            colors={['rgba(23, 11, 9, 0)', 'rgba(23, 11, 9, 0.38)']}
            style={styles.imageBottomGradient}
          />
          <View style={styles.imageTopRow}>
            <GlassSurface
              tone="dark"
              radius={radii.pill}
              contentStyle={styles.stepBadge}
              blurEnabled={false}
            >
              <View style={styles.stepBadgeDot} />
              <Text style={styles.stepBadgeText}>
                LANGKAH {String(index + 1).padStart(2, '0')}
              </Text>
            </GlassSurface>
            {step.timerSeconds ? (
              <GlassSurface
                tone="light"
                radius={radii.pill}
                contentStyle={styles.imageTimerBadge}
              >
                <Ionicons
                  name="timer-outline"
                  size={13}
                  color={colors.primary}
                />
                <Text style={styles.imageTimerText}>
                  ± {formatDuration(
                    Math.max(1, Math.round(step.timerSeconds / 60))
                  )}
                </Text>
              </GlassSurface>
            ) : null}
          </View>
          <View style={styles.imageFooter}>
            <Text style={styles.imageFooterText}>
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </Text>
            <View style={styles.imageFooterLine} />
            <Text style={styles.imageFooterText}>MODE MEMASAK</Text>
          </View>
        </View>

        <View style={styles.stepHeading}>
          <Text style={text.overline}>LANGKAH {index + 1}</Text>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepDescription}>{step.description}</Text>
        </View>

        {step.tip ? (
          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Ionicons name="bulb-outline" size={17} color={colors.gold} />
            </View>
            <View style={styles.tipCopy}>
              <Text style={styles.tipLabel}>CATATAN LANGKAH</Text>
              <Text style={styles.tipText}>{step.tip}</Text>
            </View>
          </View>
        ) : null}

        {step.timerSeconds ? (
          <PressableScale
            onPress={() =>
              onStartTimer(step.timerSeconds as number, index)
            }
            accessibilityRole="button"
            accessibilityLabel={`Mulai timer ${Math.round(
              step.timerSeconds / 60
            )} menit untuk langkah ini`}
            style={styles.suggestedTimer}
            scaleTo={0.98}
          >
            <LinearGradient
              colors={['#FFFDF9', '#F9EEE4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.suggestedIcon}>
              <Ionicons name="timer-outline" size={21} color={colors.primary} />
            </View>
            <View style={styles.suggestedCopy}>
              <Text style={styles.suggestedLabel}>TIMER LANGKAH INI</Text>
              <Text style={styles.suggestedTitle}>
                Mulai {formatDuration(
                  Math.max(1, Math.round(step.timerSeconds / 60))
                )}
              </Text>
              <Text style={styles.suggestedHint}>
                Timer berjalan di latar belakang mode masak
              </Text>
            </View>
            <View style={styles.suggestedArrow}>
              <Ionicons name="play" size={16} color={colors.white} />
            </View>
          </PressableScale>
        ) : null}

        <View style={styles.stepCredit}>
          <Ionicons name="restaurant-outline" size={12} color={colors.inkFaint} />
          <Text style={styles.stepCreditText}>
            Baca pelan-pelan, nikmati prosesnya.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function CompletionModal({
  visible,
  recipe,
  cookedCount,
  onClose,
  onBackHome,
  onBackToDetail,
}: {
  visible: boolean;
  recipe: Recipe;
  cookedCount: number;
  onClose: () => void;
  onBackHome: () => void;
  onBackToDetail: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.successBackdrop}>
        <PressableScale
          onPress={onClose}
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel="Tutup ucapan selamat"
        >
          <View />
        </PressableScale>
        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: 24 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={spring({ damping: 16, stiffness: 180 })}
          style={[
            styles.successCard,
            { marginBottom: Math.max(insets.bottom, 18) + 14 },
          ]}
        >
          <LinearGradient
            colors={['#FFFDF9', '#F8EEE3']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.confettiOne} />
          <View style={styles.confettiTwo} />
          <View style={styles.confettiThree} />
          <View style={styles.successCheck}>
            <Ionicons name="checkmark" size={30} color={colors.white} />
          </View>
          <Text style={[text.overline, styles.successEyebrow]}>
            SELAMAT MASAK
          </Text>
          <Text style={styles.successTitle}>Masakan selesai!</Text>
          <Text style={styles.successBody}>
            {recipe.title} siap disajikan. Semoga jadi hidangan yang bikin
            ingin tambah lagi.
          </Text>

          <View style={styles.successStats}>
            <View style={styles.successStat}>
              <Ionicons name="list-outline" size={16} color={colors.primary} />
              <Text style={styles.successStatValue}>
                {recipe.steps.length} langkah
              </Text>
            </View>
            <View style={styles.successStatDivider} />
            <View style={styles.successStat}>
              <Ionicons name="people-outline" size={16} color={colors.primary} />
              <Text style={styles.successStatValue}>
                {recipe.servings} porsi
              </Text>
            </View>
            <View style={styles.successStatDivider} />
            <View style={styles.successStat}>
              <Ionicons name="flame-outline" size={16} color={colors.primary} />
              <Text style={styles.successStatValue}>
                {cookedCount}× dimasak
              </Text>
            </View>
          </View>

          <PressableScale
            onPress={onBackHome}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke beranda"
            style={styles.successPrimary}
            scaleTo={0.97}
          >
            <Text style={styles.successPrimaryText}>Kembali ke beranda</Text>
            <Ionicons name="arrow-forward" size={17} color={colors.white} />
          </PressableScale>
          <PressableScale
            onPress={onBackToDetail}
            accessibilityRole="button"
            accessibilityLabel="Lihat kembali resep"
            style={styles.successSecondary}
            scaleTo={0.97}
          >
            <Text style={styles.successSecondaryText}>Lihat resep</Text>
          </PressableScale>
        </MotiView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    // Dekorasi di bawah sengaja keluar 100px dari tepi. Tanpa clipping,
    // browser mobile melebarkan layout viewport dan seluruh layar ikut
    // tergeser/terpotong.
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 330,
  },
  decor: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(180, 35, 42, 0.055)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
  },
  closeButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 7,
  },
  headerLabel: {
    fontFamily: fonts.bold,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 1.4,
    color: colors.inkSoft,
  },
  progressTrack: {
    width: 94,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(74, 43, 34, 0.11)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  timerPill: {
    height: 44,
    minWidth: 84,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  timerPillText: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
    lineHeight: 15,
    color: colors.primaryDeep,
    fontVariant: ['tabular-nums'],
  },
  miniPlay: {
    marginLeft: 1,
  },
  timerAlert: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    paddingLeft: 11,
    borderRadius: 18,
    backgroundColor: colors.primaryDeep,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...shadows.red,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertCopy: {
    flex: 1,
    gap: 2,
  },
  alertTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: colors.white,
  },
  alertBody: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: 'rgba(255, 247, 241, 0.62)',
  },
  alertAction: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.13)',
    justifyContent: 'center',
  },
  alertActionText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: colors.white,
  },
  alertClose: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pager: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 16,
    paddingTop: 3,
  },
  imageCard: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.ink,
  },
  imageTopGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  imageBottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 110,
  },
  imageTopRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 28,
    gap: 6,
  },
  stepBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  stepBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1.1,
    color: colors.white,
  },
  imageTimerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 28,
    gap: 4,
  },
  imageTimerText: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: colors.primaryDeep,
  },
  imageFooter: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imageFooterText: {
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 1.1,
    color: 'rgba(255, 247, 241, 0.66)',
  },
  imageFooterLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 247, 241, 0.28)',
  },
  stepHeading: {
    marginTop: 21,
    gap: 8,
  },
  stepTitle: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.7,
    color: colors.ink,
  },
  stepDescription: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 23,
    color: colors.inkSoft,
  },
  tipCard: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(197, 139, 77, 0.09)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(197, 139, 77, 0.18)',
  },
  tipIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(197, 139, 77, 0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCopy: {
    flex: 1,
    gap: 3,
  },
  tipLabel: {
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 1.3,
    color: colors.gold,
  },
  tipText: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 18,
    color: colors.inkSoft,
  },
  suggestedTimer: {
    marginTop: 16,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(180, 35, 42, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
    ...shadows.soft,
  },
  suggestedIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedCopy: {
    flex: 1,
    gap: 2,
  },
  suggestedLabel: {
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 1.2,
    color: colors.inkMuted,
  },
  suggestedTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    color: colors.ink,
  },
  suggestedHint: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: colors.inkMuted,
  },
  suggestedArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCredit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 22,
  },
  stepCreditText: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: colors.inkFaint,
  },
  footerWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  footerShadow: {
    borderRadius: 26,
    backgroundColor: 'rgba(255, 253, 249, 0.92)',
    ...shadows.floating,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryWhisper,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(180, 35, 42, 0.11)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonDisabled: {
    backgroundColor: 'rgba(74, 43, 34, 0.04)',
    borderColor: 'transparent',
  },
  dots: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(74, 43, 34, 0.16)',
  },
  dotActive: {
    width: 17,
    backgroundColor: colors.primary,
  },
  nextButton: {
    height: 44,
    minWidth: 120,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  nextText: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.white,
  },
  successBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(24, 12, 10, 0.66)',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  successCard: {
    borderRadius: 30,
    overflow: 'hidden',
    padding: 24,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...shadows.floating,
  },
  confettiOne: {
    position: 'absolute',
    top: 28,
    left: 34,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primarySoft,
  },
  confettiTwo: {
    position: 'absolute',
    top: 56,
    right: 46,
    width: 6,
    height: 14,
    borderRadius: 3,
    backgroundColor: colors.goldSoft,
    transform: [{ rotate: '28deg' }],
  },
  confettiThree: {
    position: 'absolute',
    top: 100,
    right: 84,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.sageSoft,
  },
  successCheck: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  successEyebrow: {
    color: colors.primary,
    fontSize: 8.5,
    letterSpacing: 1.8,
  },
  successTitle: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
    color: colors.ink,
    marginTop: 4,
    letterSpacing: -0.7,
    textAlign: 'center',
  },
  successBody: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 19,
    color: colors.inkMuted,
    textAlign: 'center',
    maxWidth: 290,
    marginTop: 7,
  },
  successStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 18,
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(180, 35, 42, 0.055)',
    width: '100%',
  },
  successStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  successStatText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.ink,
  },
  successStatValue: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: colors.ink,
  },
  successStatDivider: {
    width: StyleSheet.hairlineWidth,
    height: 14,
    backgroundColor: colors.lineStrong,
  },
  successPrimary: {
    width: '100%',
    height: 52,
    borderRadius: 20,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.red,
  },
  successPrimaryText: {
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    color: colors.white,
  },
  successSecondary: {
    marginTop: 8,
    height: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successSecondaryText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.primary,
  },
  missing: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  missingTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 24,
    color: colors.ink,
  },
  missingButton: {
    height: 44,
    paddingHorizontal: 22,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  missingButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.white,
  },
});
