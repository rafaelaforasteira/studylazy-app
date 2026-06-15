import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type DashboardHeaderProps = {
  name?: string;
  streak?: number;
  onSettingsPress?: () => void;
};

export default function DashboardHeader({
  name = 'Estudante',
  streak = 1,
  onSettingsPress,
}: DashboardHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.textWrapper}>
          <Text style={styles.greeting}>Bom dia, {name} 👋</Text>

          <Text style={styles.subtitle}>Dia {streak} da sua jornada 🔥</Text>
        </View>

        <TouchableOpacity style={styles.settingsButton} onPress={onSettingsPress}>
          <Text style={styles.settingsText}>⚙️</Text>
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
    ...typography.title,
  },

  subtitle: {
    color: colors.text.secondary,
    marginTop: spacing.sm,
    ...typography.body,
  },

  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  settingsText: {
    fontSize: 22,
  },
});