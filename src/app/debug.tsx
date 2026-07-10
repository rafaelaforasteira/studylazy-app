import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useOnboardingStore } from '../store/onboardingStore';

import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';

export default function DebugScreen() {
  if (!__DEV__) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>
          Tela disponível apenas em desenvolvimento.
        </Text>
      </View>
    );
  }

  return <DebugContent />;
}

function DebugContent() {
  const answers = useOnboardingStore((state) => state.answers);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Debug Store</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Journey</Text>
        <Text style={styles.value}>{answers.journey ?? 'Não respondido'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Goal</Text>
        <Text style={styles.value}>{answers.goal ?? 'Não respondido'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Study Time</Text>
        <Text style={styles.value}>
          {answers.studyTime ?? 'Não respondido'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  blocked: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  blockedText: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  label: {
    color: colors.text.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    color: colors.text.primary,
    fontSize: 16,
  },
});
