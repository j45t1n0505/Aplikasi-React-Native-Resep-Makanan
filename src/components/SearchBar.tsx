import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { colors, fonts, radii } from '../theme';
import { GlassSurface } from './ui/GlassSurface';
import { PressableScale } from './ui/PressableScale';

type SearchInputProps = Pick<
  TextInputProps,
  'value' | 'onChangeText' | 'autoFocus' | 'returnKeyType'
> & {
  placeholder?: string;
};

export function SearchInput({
  value,
  onChangeText,
  autoFocus = false,
  placeholder = 'Cari resep, bahan, atau daerah...',
  returnKeyType = 'search',
}: SearchInputProps) {
  return (
    <GlassSurface
      tone="strong"
      radius={radii.pill}
      style={styles.inputShell}
      contentStyle={styles.inputContent}
    >
      <Ionicons name="search" size={19} color={colors.inkSoft} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        returnKeyType={returnKeyType}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        selectionColor={colors.primary}
        style={styles.input}
        autoCorrect={false}
        clearButtonMode="never"
        accessibilityLabel="Cari resep"
      />
      {value && value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText?.('')}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Hapus pencarian"
        >
          <View style={styles.clear}>
            <Ionicons name="close" size={14} color={colors.inkSoft} />
          </View>
        </Pressable>
      ) : (
        <View style={styles.shortcut}>
          <Text style={styles.shortcutText}>Cari</Text>
        </View>
      )}
    </GlassSurface>
  );
}

export function SearchTrigger({
  onPress,
  placeholder = 'Cari resep, bahan, atau daerah...',
}: {
  onPress: () => void;
  placeholder?: string;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="search"
      accessibilityLabel="Buka pencarian resep"
      scaleTo={0.985}
    >
      <GlassSurface
        tone="strong"
        radius={radii.pill}
        style={styles.trigger}
        contentStyle={styles.inputContent}
      >
        <Ionicons name="search" size={19} color={colors.inkSoft} />
        <Text style={styles.placeholder}>{placeholder}</Text>
        <View style={styles.shortcut}>
          <Ionicons name="options-outline" size={13} color={colors.primary} />
        </View>
      </GlassSurface>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  inputShell: {
    height: 54,
    width: '100%',
  },
  trigger: {
    height: 54,
    width: '100%',
  },
  inputContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.ink,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  placeholder: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.inkFaint,
  },
  shortcut: {
    height: 28,
    minWidth: 42,
    paddingHorizontal: 9,
    borderRadius: 14,
    backgroundColor: colors.primaryWhisper,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(180, 35, 42, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: colors.primary,
  },
  clear: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
