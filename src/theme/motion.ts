import type { MotiTransitionProp } from 'moti';

/**
 * Moti 0.30 masih memakai tipe transisi lama, sementara React Native 0.88
 * menambahkan index signature pada style. Cast terpusat di sini menjaga
 * pemakaian di layar tetap ringkas dan type-safe dari sisi API kita.
 */
type TimingOptions = {
  duration?: number;
  delay?: number;
};

type SpringOptions = {
  damping?: number;
  stiffness?: number;
  mass?: number;
  delay?: number;
};

export function timing({
  duration = 420,
  delay = 0,
}: TimingOptions = {}): MotiTransitionProp {
  return {
    type: 'timing',
    duration,
    delay,
  } as unknown as MotiTransitionProp;
}

export function spring({
  damping = 18,
  stiffness = 220,
  mass = 0.7,
  delay = 0,
}: SpringOptions = {}): MotiTransitionProp {
  return {
    type: 'spring',
    damping,
    stiffness,
    mass,
    delay,
  } as unknown as MotiTransitionProp;
}
