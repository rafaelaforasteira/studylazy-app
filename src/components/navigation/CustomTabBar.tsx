import { Pressable, Platform, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../constants/colors';
import {
  TAB_CONFIG,
  type TabRouteName,
  tabBarMetrics,
} from '../../constants/tabBar';
import { spacing, layout } from '../../constants/spacing';
import { useMistakeStore } from '../../store/mistakeStore';

import TabBarCenterButton from './TabBarCenterButton';

const TAB_ICONS = {
  atividade: {
    ios: 'waveform.path.ecg',
    android: 'monitoring',
    web: 'monitoring',
  },
  plano: {
    ios: 'calendar',
    android: 'calendar_today',
    web: 'calendar_today',
  },
  estudar: {
    ios: 'bolt.fill',
    android: 'bolt',
    web: 'bolt',
  },
  revisar: {
    ios: 'arrow.clockwise.circle.fill',
    android: 'refresh',
    web: 'refresh',
  },
  voce: {
    ios: 'person.fill',
    android: 'person',
    web: 'person',
  },
} as const;

export type CustomTabBarProps = {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  navigation: {
    emit: (event: {
      type: 'tabPress';
      target?: string;
      canPreventDefault?: true;
    }) => { defaultPrevented?: boolean };
    navigate: (name: string) => void;
  };
};

function formatBadge(count: number) {
  if (count > 99) return '99+';
  return String(count);
}

export default function CustomTabBar({
  state,
  navigation,
}: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const mistakeCount = useMistakeStore((store) => store.mistakes.length);

  return (
    <View
      style={[
        styles.outer,
        { paddingBottom: Math.max(insets.bottom, tabBarMetrics.bottomPadding) },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.row}>
        {state.routes.map((route, index) => {
          const routeName = route.name as TabRouteName;
          const config = TAB_CONFIG[routeName];
          const isFocused = state.index === index;
          const icon = TAB_ICONS[routeName];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (routeName === 'estudar') {
            return (
              <View key={route.key} style={styles.centerSlot}>
                <TabBarCenterButton
                  focused={isFocused}
                  onPress={onPress}
                />
                <Text
                  style={[
                    styles.label,
                    isFocused && styles.labelActive,
                    styles.centerLabel,
                  ]}
                >
                  {config.label}
                </Text>
              </View>
            );
          }

          const showBadge = routeName === 'revisar' && mistakeCount > 0;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityLabel={config.accessibilityLabel}
              accessibilityState={{ selected: isFocused }}
              onPress={onPress}
              style={styles.tabButton}
              hitSlop={6}
            >
              <View style={styles.iconWrap}>
                <SymbolView
                  name={{
                    ios: icon.ios,
                    android: icon.android,
                    web: icon.web,
                  }}
                  tintColor={
                    isFocused
                      ? colors.tabBar.active
                      : colors.tabBar.inactive
                  }
                  size={22}
                />

                {showBadge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {formatBadge(mistakeCount)}
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text
                style={[styles.label, isFocused && styles.labelActive]}
                numberOfLines={1}
              >
                {config.label}
              </Text>
            </Pressable>
          );
        })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    backgroundColor: colors.tabBar.background,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    paddingTop: spacing.sm,
    ...(Platform.OS === 'web'
      ? {
          maxWidth: layout.webMaxWidth,
          alignSelf: 'center',
        }
      : {}),
  },

  container: {
    width: '100%',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: tabBarMetrics.height,
    paddingHorizontal: spacing.sm,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: spacing.touchTarget,
    gap: 4,
  },

  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: spacing.touchTarget,
  },

  iconWrap: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    color: colors.tabBar.inactive,
    fontSize: tabBarMetrics.labelSize,
    fontWeight: '600',
  },

  labelActive: {
    color: colors.tabBar.active,
  },

  centerLabel: {
    marginTop: spacing.xs,
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.background,
  },

  badgeText: {
    color: colors.text.primary,
    fontSize: 10,
    fontWeight: '700',
  },
});
