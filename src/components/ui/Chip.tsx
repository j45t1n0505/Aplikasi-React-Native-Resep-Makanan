import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../../theme';
import { PressableScale } from './PressableScale';

type IconName = ComponentProps<typeof Ionicons>['name'];

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  count?: number;
};

export function Chip({
  label,
  selected = false,
  onPress,
  icon,
  count,
}: ChipProps) {
  const content = (
    <View style={[styles.content, selected && styles.contentSelected]}>
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={selected ? colors.white : colors.inkSoft}
        />
      ) : null}
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
      {typeof count === 'number' ? (
        <View style={[styles.count, selected && styles.countSelected]}>
          <Text
            style={[styles.countText, selected && styles.countTextSelected]}
          >
            {count}
          </Text>
        </View>
      ) : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      aria-pressed={selected}
      accessibilityLabel={label}
      scaleTo={0.96}
    >
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  content: {
    height: 38,
    paddingHorizontal: 15,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineStrong,
    backgroundColor: 'rgba(255, 253, 249, 0.78)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  contentSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    lineHeight: 16,
    color: colors.inkSoft,
    letterSpacing: -0.1,
  },
  labelSelected: {
    color: colors.white,
  },
  count: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  countText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: colors.primary,
  },
  countTextSelected: {
    color: colors.white,
  },
});
