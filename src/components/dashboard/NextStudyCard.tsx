import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type NextStudyCardProps = {
  subject?: string;
  duration?: number;
  type?: string;
  onPress?: () => void;
};

export default function NextStudyCard({
  subject = 'Português',
  duration = 5,
  type = 'Teoria',
  onPress,
}: NextStudyCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Próxima lição</Text>

      <Text style={styles.subject}>{subject}</Text>

      <Text style={styles.description}>
        {duration} questões • {type}
      </Text>

      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>Começar</Text>
      </TouchableOpacity>
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

  label: {
    color: colors.text.secondary,
    ...typography.body,
    marginBottom: spacing.sm,
  },

  subject: {
    color: colors.text.primary,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },

  description: {
    color: colors.text.secondary,
    ...typography.body,
    marginBottom: spacing.lg,
  },

  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  buttonText: {
    color: colors.background,
    ...typography.button,
  },
});