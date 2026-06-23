import { Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { colors } from '../../constants/colors';
import {
  TAB_BAR_CENTER_BUTTON_SIZE,
  tabBarMetrics,
} from '../../constants/tabBar';

type TabBarCenterButtonProps = {
  focused: boolean;
  onPress: () => void;
};

export default function TabBarCenterButton({
  focused,
  onPress,
}: TabBarCenterButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Aba Estudar"
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrapper,
        pressed && styles.pressed,
      ]}
      hitSlop={8}
    >
      <View style={[styles.button, focused && styles.buttonFocused]}>
        <SymbolView
          name={{ ios: 'bolt.fill', android: 'bolt', web: 'bolt' }}
          tintColor={colors.text.primary}
          size={28}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    top: tabBarMetrics.centerButtonOffset,
    alignItems: 'center',
    justifyContent: 'center',
  },

  button: {
    width: TAB_BAR_CENTER_BUTTON_SIZE,
    height: TAB_BAR_CENTER_BUTTON_SIZE,
    borderRadius: TAB_BAR_CENTER_BUTTON_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
    shadowColor: colors.tabBar.centerGlow,
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  buttonFocused: {
    backgroundColor: colors.primaryMuted,
  },

  pressed: {
    opacity: 0.92,
  },
});
