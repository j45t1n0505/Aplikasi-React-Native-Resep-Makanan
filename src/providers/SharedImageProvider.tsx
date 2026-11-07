import { Easing, runOnJS, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { ImageProps } from 'expo-image';

type SharedImageSource = NonNullable<ImageProps['source']>;

export type MeasuredRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type TransitionPhase = 'opening' | 'open' | 'closing';

type SharedTransition = {
  recipeId: string;
  image: SharedImageSource;
  source: MeasuredRect;
  destination: MeasuredRect | null;
  phase: TransitionPhase;
  radius: number;
};

type SharedImageContextValue = {
  transition: SharedTransition | null;
  progress: SharedValue<number>;
  beginTransition: (
    recipeId: string,
    image: SharedImageSource,
    source: MeasuredRect,
    radius?: number
  ) => void;
  setDestination: (recipeId: string, destination: MeasuredRect) => void;
  closeTransition: (recipeId: string, onClosed: () => void) => void;
  isTransitioning: (recipeId: string) => boolean;
  clearTransition: () => void;
};

const SharedImageContext = createContext<SharedImageContextValue | null>(null);

const OPEN_DURATION = 460;
const CLOSE_DURATION = 340;
const openEasing = Easing.bezier(0.22, 1, 0.36, 1);
const closeEasing = Easing.bezier(0.4, 0, 0.2, 1);

export function SharedImageProvider({ children }: PropsWithChildren) {
  const [transition, setTransition] = useState<SharedTransition | null>(null);
  const progress = useSharedValue(0);

  const clearTransitionInternal = useCallback(() => {
    setTransition(null);
    progress.value = 0;
  }, [progress]);

  const finishOpening = useCallback((recipeId: string) => {
    setTransition((current) => {
      if (current?.recipeId !== recipeId || current.phase !== 'opening') {
        return current;
      }
      return { ...current, phase: 'open' };
    });
  }, []);

  useEffect(() => {
    if (
      !transition ||
      transition.phase !== 'opening' ||
      !transition.destination
    ) {
      return;
    }

    const timer = setTimeout(() => {
      progress.value = withTiming(
        1,
        { duration: OPEN_DURATION, easing: openEasing },
        (finished) => {
          if (finished) {
            runOnJS(finishOpening)(transition.recipeId);
          }
        }
      );
    }, 20);

    return () => clearTimeout(timer);
  }, [transition, progress, finishOpening]);

  const beginTransition = useCallback(
    (
      recipeId: string,
      image: SharedImageSource,
      source: MeasuredRect,
      radius = 24
    ) => {
      progress.value = 0;
      setTransition({
        recipeId,
        image,
        source,
        destination: null,
        phase: 'opening',
        radius,
      });
    },
    [progress]
  );

  const setDestination = useCallback(
    (recipeId: string, destination: MeasuredRect) => {
      setTransition((current) => {
        if (
          !current ||
          current.recipeId !== recipeId ||
          current.destination !== null
        ) {
          return current;
        }
        return { ...current, destination };
      });
    },
    []
  );

  const closeTransition = useCallback(
    (recipeId: string, onClosed: () => void) => {
      if (
        !transition ||
        transition.recipeId !== recipeId ||
        !transition.destination
      ) {
        onClosed();
        return;
      }

      const closingRecipeId = recipeId;
      setTransition((current) =>
        current?.recipeId === closingRecipeId
          ? { ...current, phase: 'closing' }
          : current
      );

      progress.value = withTiming(
        0,
        { duration: CLOSE_DURATION, easing: closeEasing },
        (finished) => {
          if (finished) {
            runOnJS(onClosed)();
            runOnJS(clearTransitionInternal)();
          }
        }
      );
    },
    [transition, progress, clearTransitionInternal]
  );

  const isTransitioning = useCallback(
    (recipeId: string) =>
      transition?.recipeId === recipeId &&
      (transition.phase === 'opening' || transition.phase === 'closing'),
    [transition]
  );

  const value = useMemo<SharedImageContextValue>(
    () => ({
      transition,
      progress,
      beginTransition,
      setDestination,
      closeTransition,
      isTransitioning,
      clearTransition: clearTransitionInternal,
    }),
    [
      transition,
      progress,
      beginTransition,
      setDestination,
      closeTransition,
      isTransitioning,
      clearTransitionInternal,
    ]
  );

  return (
    <SharedImageContext.Provider value={value}>
      {children}
    </SharedImageContext.Provider>
  );
}

export function useSharedImage(): SharedImageContextValue {
  const context = useContext(SharedImageContext);
  if (!context) {
    throw new Error(
      'useSharedImage harus dipakai di dalam SharedImageProvider'
    );
  }
  return context;
}
