import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

import type { StudyTask } from '../../utils/studyPlanGenerator';

type TodayPlanCardProps = {
  tasks: StudyTask[];
};

export default function TodayPlanCard({ tasks }: TodayPlanCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Plano de hoje</Text>

      {tasks.map((task, index) => (
        <View key={`${task.subject}-${index}`} style={styles.taskItem}>
          <View style={styles.taskNumber}>
            <Text style={styles.taskNumberText}>{index + 1}</Text>
          </View>

          <View style={styles.taskContent}>
            <Text style={styles.taskSubject}>{task.subject}</Text>

            <Text style={styles.taskDescription}>
              {task.duration} questões • {task.type}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card.background,
    padding: spacing.lg,
    borderRadius: 20,
    marginBottom: spacing.lg,
  },

  title: {
    color: colors.text.primary,
    ...typography.body,
    fontWeight: '700',
    marginBottom: spacing.md,
  },

  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  taskNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  taskNumberText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: 'bold',
  },

  taskContent: {
    flex: 1,
  },

  taskSubject: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },

  taskDescription: {
    color: colors.text.secondary,
    fontSize: 14,
  },
});