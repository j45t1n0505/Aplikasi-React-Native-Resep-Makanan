import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, text } from '../../theme';
import { PressableScale } from './PressableScale';

type SectionHeaderProps = {
  title: string;
  kicker?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({
  title,
  kicker,
  actionLabel,
  onAction,
}: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.titleWrap}>
        {kicker ? <Text style={text.overline}>{kicker}</Text> : null}
        <Text style={text.sectionTitle}>{title}</Text>
      </View>
      {actionLabel && onAction ? (
        <PressableScale
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={styles.action}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.primary} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleWrap: {
    flexShrink: 1,
    gap: 4,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 3,
  },
  actionText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.primary,
  },
});
