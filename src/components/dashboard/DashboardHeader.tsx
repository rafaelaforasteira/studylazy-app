import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type DashboardHeaderProps = {
  name?: string;
  streak?: number;
};

export default function DashboardHeader({
  name = 'Estudante',
  streak = 1,
}: DashboardHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        Bom dia, {name} 👋
      </Text>

      <Text style={styles.subtitle}>
        Dia {streak} da sua jornada 🔥
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
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
});