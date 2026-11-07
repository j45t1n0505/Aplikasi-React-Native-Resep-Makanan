import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts, radii, text } from '../theme';
import { useHaptics } from '../hooks/useHaptics';
import { Divider } from './ui/Divider';
import { GlassSurface } from './ui/GlassSurface';
import { PressableScale } from './ui/PressableScale';

type ChecklistItem = {
  id: string;
  label: string;
  note?: string;
};

type ChecklistGroup = {
  id: string;
  title?: string;
  items: readonly ChecklistItem[];
};

export function ChecklistRow({
  item,
  checked,
  onToggle,
}: {
  item: ChecklistItem;
  checked: boolean;
  onToggle: () => void;
}) {
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: 260 });
  }, [checked, progress]);

  const circleStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.primaryWhisper, colors.primary]
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.lineStrong, colors.primary]
    ),
    transform: [
      {
        scale: interpolate(progress.value, [0, 1], [1, 1.04]),
      },
    ],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        scale: interpolate(progress.value, [0, 1], [0.35, 1]),
      },
    ],
  }));

  const strikeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
    opacity: progress.value,
  }));

  const labelOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [1, 0.48]),
  }));

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      // React Native Web 0.21 tidak lagi memetakan accessibilityState, jadi
      // status centang perlu ditulis eksplisit agar tetap terbaca screen reader.
      aria-checked={checked}
      accessibilityLabel={`${item.label}${
        item.note ? `, ${item.note}` : ''
      }`}
      style={({ pressed }) => [
        styles.row,
        pressed ? { opacity: 0.88 } : undefined,
      ]}
    >
      <Animated.View style={[styles.circle, circleStyle]}>
        <Animated.View style={checkStyle}>
          <Ionicons name="checkmark" size={14} color={colors.white} />
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.copy, labelOpacityStyle]}>
        <View style={styles.labelWrap}>
          <Text style={styles.label}>{item.label}</Text>
          <Animated.View style={[styles.strike, strikeStyle]} />
        </View>
        {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
      </Animated.View>
    </Pressable>
  );
}

export function ChecklistCard({
  title,
  eyebrow = 'CHECKLIST',
  icon = 'leaf-outline',
  groups,
  checkedCount,
  totalCount,
  isChecked,
  onToggle,
  onReset,
}: {
  title: string;
  eyebrow?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  groups: readonly ChecklistGroup[];
  checkedCount: number;
  totalCount: number;
  isChecked: (itemId: string) => boolean;
  onToggle: (itemId: string) => void;
  onReset: () => void;
}) {
  const haptics = useHaptics();

  const handleToggle = (itemId: string) => {
    haptics.selection();
    onToggle(itemId);
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <View style={styles.eyebrowRow}>
            <Ionicons name={icon} size={12} color={colors.primary} />
            <Text style={[text.overline, styles.eyebrow]}>{eyebrow}</Text>
          </View>
          <Text style={text.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.headerActions}>
          {checkedCount > 0 ? (
            <PressableScale
              onPress={() => {
                haptics.soft();
                onReset();
              }}
              accessibilityRole="button"
              accessibilityLabel={`Bersihkan checklist ${title}`}
              scaleTo={0.94}
            >
              <Text style={styles.reset}>Bersihkan</Text>
            </PressableScale>
          ) : null}
          <View style={styles.counter}>
            <Text style={styles.counterValue}>{checkedCount}</Text>
            <Text style={styles.counterTotal}>/{totalCount}</Text>
          </View>
        </View>
      </View>

      <GlassSurface
        tone="strong"
        radius={radii.xl}
        contentStyle={styles.cardContent}
      >
        {groups.map((group, groupIndex) => (
          <View key={group.id}>
            {group.title ? (
              <View
                style={[
                  styles.groupHeader,
                  groupIndex === 0 && styles.groupHeaderFirst,
                ]}
              >
                <Text style={styles.groupTitle}>{group.title}</Text>
                <View style={styles.groupLine} />
              </View>
            ) : null}
            {group.items.map((item, itemIndex) => (
              <View key={item.id}>
                <ChecklistRow
                  item={item}
                  checked={isChecked(item.id)}
                  onToggle={() => handleToggle(item.id)}
                />
                {itemIndex < group.items.length - 1 ? (
                  <Divider inset={48} />
                ) : null}
              </View>
            ))}
          </View>
        ))}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 13,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerTitleWrap: {
    gap: 3,
    flexShrink: 1,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 2,
  },
  reset: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.inkMuted,
    textDecorationLine: 'underline',
  },
  counter: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: colors.primaryWhisper,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(180, 35, 42, 0.14)',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  counterValue: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.primary,
  },
  counterTotal: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.inkMuted,
  },
  cardContent: {
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 6,
  },
  groupHeaderFirst: {
    paddingTop: 12,
  },
  groupTitle: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    lineHeight: 13,
    color: colors.inkMuted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  groupLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  labelWrap: {
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.ink,
    letterSpacing: -0.1,
  },
  strike: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 9.5,
    height: 1.2,
    backgroundColor: colors.primary,
    transformOrigin: 'left center',
  },
  note: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.inkMuted,
  },
});
