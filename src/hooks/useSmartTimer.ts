import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  runOnJS,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';

type UseSmartTimerOptions = {
  initialSeconds: number;
  onComplete?: () => void;
};

/**
 * Timer yang menghitung sisa waktu memakai jam dinding (bukan jumlah frame).
 * Frame callback hanya dipakai untuk memperbarui progress di UI thread, jadi
 * lingkaran timer tetap halus 60fps. React state hanya diperbarui ketika angka
 * detik berubah, sehingga teks timer tidak memicu re-render tiap frame.
 */
export function useSmartTimer({
  initialSeconds,
  onComplete,
}: UseSmartTimerOptions) {
  const safeInitialSeconds = Math.max(1, Math.round(initialSeconds));
  const [durationSeconds, setDurationSeconds] = useState(safeInitialSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState(safeInitialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const remainingMs = useSharedValue(safeInitialSeconds * 1000);
  const durationMs = useSharedValue(safeInitialSeconds * 1000);
  const endAtMs = useSharedValue(0);
  const lastSecond = useSharedValue(safeInitialSeconds);
  const runningShared = useSharedValue(false);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const finish = useCallback(() => {
    setIsRunning(false);
    setIsFinished(true);
    setRemainingSeconds(0);
    onCompleteRef.current?.();
  }, []);

  const frameCallback = useFrameCallback(() => {
    if (!runningShared.value) {
      return;
    }

    const now = Date.now();
    const nextRemaining = Math.max(0, endAtMs.value - now);
    remainingMs.value = nextRemaining;

    const nextSecond = Math.ceil(nextRemaining / 1000);
    if (nextSecond !== lastSecond.value) {
      lastSecond.value = nextSecond;
      runOnJS(setRemainingSeconds)(nextSecond);
    }

    if (nextRemaining <= 0) {
      runningShared.value = false;
      runOnJS(finish)();
    }
  }, false);

  useEffect(() => {
    frameCallback.setActive(isRunning);
    return () => {
      frameCallback.setActive(false);
    };
  }, [frameCallback, isRunning]);

  const start = useCallback(() => {
    if (remainingMs.value <= 0) {
      remainingMs.value = durationMs.value;
      lastSecond.value = Math.ceil(durationMs.value / 1000);
      setRemainingSeconds(Math.ceil(durationMs.value / 1000));
    }
    setIsFinished(false);
    endAtMs.value = Date.now() + remainingMs.value;
    runningShared.value = true;
    setIsRunning(true);
  }, [durationMs, endAtMs, lastSecond, remainingMs, runningShared]);

  const pause = useCallback(() => {
    // Jangan sentuh sisa waktu kalau timer memang belum pernah berjalan.
    // Tanpa guard ini, endAtMs masih 0 sehingga pause() akan menghapus
    // durasi awal (mis. saat menyelesaikan masak sebelum timer dinyalakan).
    if (!runningShared.value) {
      return;
    }

    runningShared.value = false;
    setIsRunning(false);
    // Recalculate the exact remainder so resuming doesn't add hidden time.
    const exactRemaining = Math.max(0, endAtMs.value - Date.now());
    remainingMs.value = exactRemaining;
    const seconds = Math.ceil(exactRemaining / 1000);
    lastSecond.value = seconds;
    setRemainingSeconds(seconds);
  }, [endAtMs, lastSecond, remainingMs, runningShared]);

  const toggle = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, pause, start]);

  const reset = useCallback(
    (seconds?: number) => {
      const nextDuration = Math.max(1, Math.round(seconds ?? durationSeconds));
      runningShared.value = false;
      setIsRunning(false);
      setIsFinished(false);
      setDurationSeconds(nextDuration);
      setRemainingSeconds(nextDuration);
      durationMs.value = nextDuration * 1000;
      remainingMs.value = nextDuration * 1000;
      endAtMs.value = 0;
      lastSecond.value = nextDuration;
    },
    [
      durationSeconds,
      durationMs,
      endAtMs,
      lastSecond,
      remainingMs,
      runningShared,
    ]
  );

  const addMinute = useCallback(() => {
    const extraMs = 60 * 1000;
    const nextDurationMs = durationMs.value + extraMs;
    durationMs.value = nextDurationMs;
    remainingMs.value = Math.max(1000, remainingMs.value + extraMs);
    if (runningShared.value) {
      endAtMs.value = Date.now() + remainingMs.value;
    }
    const nextDurationSeconds = Math.ceil(nextDurationMs / 1000);
    const nextRemainingSeconds = Math.ceil(remainingMs.value / 1000);
    setDurationSeconds(nextDurationSeconds);
    setRemainingSeconds(nextRemainingSeconds);
    lastSecond.value = nextRemainingSeconds;
    setIsFinished(false);
  }, [durationMs, endAtMs, lastSecond, remainingMs, runningShared]);

  const restartWith = useCallback(
    (seconds: number) => {
      reset(seconds);
      // Shared values are updated synchronously inside reset, so start() reads
      // the new duration immediately even though React state is async.
      start();
    },
    [reset, start]
  );

  return useMemo(
    () => ({
      durationSeconds,
      remainingSeconds,
      isRunning,
      isFinished,
      remainingMs,
      durationMs,
      start,
      pause,
      toggle,
      reset,
      addMinute,
      restartWith,
    }),
    [
      durationSeconds,
      remainingSeconds,
      isRunning,
      isFinished,
      remainingMs,
      durationMs,
      start,
      pause,
      toggle,
      reset,
      addMinute,
      restartWith,
    ]
  );
}

export type SmartTimer = ReturnType<typeof useSmartTimer>;
