import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useDapur } from '../providers/DapurProvider';

/**
 * Haptics are opt-out from the Profile screen. Every call is fail-safe so a
 * device without a haptic engine never interrupts the cooking flow.
 */
export function useHaptics() {
  const { hapticsEnabled } = useDapur();

  return useMemo(() => {
    const canFire = hapticsEnabled && Platform.OS !== 'web';

    return {
      selection() {
        if (!canFire) return;
        Haptics.selectionAsync().catch(() => undefined);
      },
      light() {
        if (!canFire) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => undefined
        );
      },
      medium() {
        if (!canFire) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
          () => undefined
        );
      },
      soft() {
        if (!canFire) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(
          () => undefined
        );
      },
      success() {
        if (!canFire) return;
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => undefined);
      },
      warning() {
        if (!canFire) return;
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning
        ).catch(() => undefined);
      },
      /**
       * Umpan balik untuk pratinjau preferensi. Sengaja mengabaikan
       * `hapticsEnabled` karena dipakai tepat saat pengguna menyalakan
       * getaran, ketika state konteks masih bernilai false.
       */
      preview() {
        if (Platform.OS === 'web') return;
        Haptics.selectionAsync().catch(() => undefined);
      },
    };
  }, [hapticsEnabled]);
}
