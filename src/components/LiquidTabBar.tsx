import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';
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
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHaptics } from '../hooks/useHaptics';
import { colors, fonts, shadows } from '../theme';
import { GlassSurface } from './ui/GlassSurface';

type IconName = ComponentProps<typeof Ionicons>['name'];

const tabMeta: Record<
  string,
  { label: string; icon: IconName; activeIcon: IconName }
> = {
  Home: {
    label: 'Beranda',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  Favorites: {
    label: 'Simpanan',
    icon: 'bookmark-outline',
    activeIcon: 'bookmark',
  },
  Profile: {
    label: 'Profil',
    icon: 'person-outline',
    activeIcon: 'person',
  },
};

function TabItem({
  label,
  icon,
  activeIcon,
  focused,
  onPress,
  onLongPress,
}: {
  label: string;
  icon: IconName;
  activeIcon: IconName;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const activeProgress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    activeProgress.value = withSpring(focused ? 1 : 0, {
      damping: 18,
      stiffness: 220,
      mass: 0.7,
    });
  }, [activeProgress, focused]);

  const pillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      activeProgress.value,
      [0, 1],
      ['rgba(180, 35, 42, 0)', colors.primary]
    ),
    transform: [
      {
        scale: interpolate(activeProgress.value, [0, 1], [0.88, 1]),
      },
    ],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      aria-selected={focused}
      accessibilityLabel={label}
      style={styles.item}
    >
      <Animated.View style={[styles.iconPill, pillStyle]}>
        <Ionicons
          name={focused ? activeIcon : icon}
          size={20}
          color={focused ? colors.white : colors.inkMuted}
        />
      </Animated.View>
      <Text style={[styles.label, focused && styles.labelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function LiquidTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.root,
        { bottom: Math.max(insets.bottom, 10) + 2 },
      ]}
    >
      <View style={styles.barShadow}>
        <GlassSurface
          tone="strong"
          radius={30}
          style={styles.bar}
          contentStyle={styles.barContent}
          intensity={34}
        >
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const options = descriptors[route.key]?.options;
            const meta = tabMeta[route.name] ?? {
              label: route.name,
              icon: 'ellipse-outline' as IconName,
              activeIcon: 'ellipse' as IconName,
            };

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                haptics.selection();
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TabItem
                key={route.key}
                label={
                  options?.tabBarAccessibilityLabel ?? meta.label
                }
                icon={meta.icon}
                activeIcon={meta.activeIcon}
                focused={focused}
                onPress={onPress}
                onLongPress={onLongPress}
              />
            );
          })}
        </GlassSurface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  barShadow: {
    width: '90%',
    maxWidth: 430,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 252, 247, 0.92)',
    ...shadows.floating,
  },
  bar: {
    width: '100%',
    height: 70,
    borderRadius: 30,
  },
  barContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  item: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconPill: {
    width: 38,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    lineHeight: 12,
    letterSpacing: 0.1,
    color: colors.inkMuted,
  },
  labelActive: {
    color: colors.primary,
  },
});
