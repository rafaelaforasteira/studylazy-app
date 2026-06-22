import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />

      <Text style={styles.title}>StudyLazy</Text>

      <Text style={styles.subtitle}>Carregando seus dados...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },

  title: {
    color: colors.text.primary,
    ...typography.title,
    marginTop: spacing.lg,
  },

  subtitle: {
    color: colors.text.secondary,
    ...typography.body,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
