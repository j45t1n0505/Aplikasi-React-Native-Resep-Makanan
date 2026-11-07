import { useId, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgGradient,
  Stop,
} from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type TimerRingProps = {
  remainingMs: SharedValue<number>;
  durationMs: SharedValue<number>;
  size: number;
  strokeWidth?: number;
  children?: ReactNode;
  trackColor?: string;
  gradientColors?: readonly [string, string];
  showTicks?: boolean;
  centerFill?: string;
  centerPadding?: number;
};

export function TimerRing({
  remainingMs,
  durationMs,
  size,
  strokeWidth = 10,
  children,
  trackColor = 'rgba(255, 247, 241, 0.18)',
  gradientColors = ['#F6DFC3', '#FFFFFF'],
  showTicks = false,
  centerFill = 'rgba(255, 247, 241, 0.05)',
  centerPadding = 28,
}: TimerRingProps) {
  const rawId = useId();
  const gradientId = `timer-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProps = useAnimatedProps(() => {
    const total = durationMs.value;
    const ratio =
      total > 0 ? Math.min(1, Math.max(0, remainingMs.value / total)) : 0;
    return {
      strokeDashoffset: circumference * (1 - ratio),
    };
  }, [circumference, durationMs, remainingMs]);

  const tickRadius = radius - strokeWidth - 8;
  const tickOuter = tickRadius - 2;
  const tickInner = tickRadius - (showTicks ? 7 : 0);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradientColors[0]} />
            <Stop offset="100%" stopColor={gradientColors[1]} />
          </SvgGradient>
        </Defs>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={centerFill}
          strokeWidth={strokeWidth + 18}
          fill="transparent"
        />
        {showTicks
          ? Array.from({ length: 24 }).map((_, index) => {
              const angle = (index / 24) * 2 * Math.PI;
              const isMajor = index % 6 === 0;
              const isMedium = index % 3 === 0;
              const inner = isMajor
                ? tickInner - 3
                : isMedium
                  ? tickInner - 1
                  : tickInner;
              const x1 = center + Math.cos(angle) * inner;
              const y1 = center + Math.sin(angle) * inner;
              const x2 = center + Math.cos(angle) * tickOuter;
              const y2 = center + Math.sin(angle) * tickOuter;
              return (
                <Line
                  key={index}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={
                    isMajor
                      ? 'rgba(255, 247, 241, 0.55)'
                      : 'rgba(255, 247, 241, 0.18)'
                  }
                  strokeWidth={isMajor ? 1.6 : 1}
                  strokeLinecap="round"
                />
              );
            })
          : null}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${center} ${center})`}
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={[styles.center, { padding: centerPadding }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
