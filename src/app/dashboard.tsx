import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { typography } from '../constants/typography';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        🎉 Bem-vindo ao StudyLazy
      </Text>

      <Text style={styles.subtitle}>
        Seu dashboard será construído aqui.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  title: {
    color: colors.text.primary,
    ...typography.title,
    textAlign: 'center',
  },

  subtitle: {
    color: colors.text.secondary,
    marginTop: 12,
    textAlign: 'center',
  },
});