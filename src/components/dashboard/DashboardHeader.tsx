import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { getGreeting } from '../../utils/date';

type DashboardHeaderProps = {
  name?: string;
  streak?: number;
  onSettingsPress?: () => void;
};

export default function DashboardHeader({
  name = 'Estudante',
  streak = 0,
  onSettingsPress,
}: DashboardHeaderProps) {
  const greeting = getGreeting();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.textWrapper}>
          <Text style={styles.greeting}>
            {greeting}, {name}
          </Text>

          <Text style={styles.subtitle}>
            {streak > 0
              ? `${streak} ${streak === 1 ? 'dia' : 'dias'} de sequência`
              : 'Comece hoje sua sequência de estudos'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={onSettingsPress}
          accessibilityRole="button"
          accessibilityLabel="Abrir configurações"
        >
          <SymbolView
            name={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' }}
            tintColor={colors.text.primary}
            size={22}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  textWrapper: {
    flex: 1,
    marginRight: spacing.md,
  },

  greeting: {
    color: colors.text.primary,
    ...typography.hero,
  },

  subtitle: {
    color: colors.text.secondary,
    marginTop: spacing.sm,
    ...typography.body,
  },

  settingsButton: {
    width: spacing.touchTarget,
    height: spacing.touchTarget,
    borderRadius: radii.pill,
    backgroundColor: colors.card.background,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
