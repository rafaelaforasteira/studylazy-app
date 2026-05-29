import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useOnboardingStore } from '../store/onboardingStore';

import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';

export default function DebugScreen() {
  // Pegamos todas as respostas da store
  const answers = useOnboardingStore((state) => state.answers);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Debug Store 🚀</Text>

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
        <Text style={styles.value}>{answers.studyTime ?? 'Não respondido'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Preparation Level</Text>
        <Text style={styles.value}>
          {answers.preparationLevel ?? 'Não respondido'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Acquisition Channel</Text>
        <Text style={styles.value}>
          {answers.acquisitionChannel ?? 'Não respondido'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Daily Goal</Text>
        <Text style={styles.value}>
          {answers.dailyGoal ?? 'Não respondido'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Notifications</Text>
        <Text style={styles.value}>
          {answers.notifications ?? 'Não respondido'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Start Preference</Text>
        <Text style={styles.value}>
          {answers.startPreference ?? 'Não respondido'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
  },

  title: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },

  card: {
    backgroundColor: colors.card.background,
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.md,
  },

  label: {
    color: colors.text.secondary,
    fontSize: 14,
    marginBottom: 4,
  },

  value: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});