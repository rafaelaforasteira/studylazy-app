import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

import type { StudyTask } from '../../utils/studyPlanGenerator';

type TodayPlanCardProps = {
  tasks: StudyTask[];
  completedTasks: string[];
};

export default function TodayPlanCard({
  tasks,
  completedTasks,
}: TodayPlanCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Plano de hoje</Text>

      {tasks.map((task, index) => {
        const isCompleted = completedTasks.includes(task.subject);

        return (
          <View key={`${task.subject}-${index}`} style={styles.taskItem}>
            <View
              style={[
                styles.taskNumber,
                isCompleted && styles.taskNumberCompleted,
              ]}
            >
              <Text style={styles.taskNumberText}>
                {isCompleted ? '✓' : index + 1}
              </Text>
            </View>

            <View style={styles.taskContent}>
              <Text
                style={[
                  styles.taskSubject,
                  isCompleted && styles.taskSubjectCompleted,
                ]}
              >
                {task.subject}
              </Text>

              <Text style={styles.taskDescription}>
                {task.duration} minutos • {task.type}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card.background,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
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
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  taskNumberCompleted: {
    backgroundColor: colors.success.main,
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

  taskSubjectCompleted: {
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },

  taskDescription: {
    color: colors.text.secondary,
    fontSize: 14,
  },
});
