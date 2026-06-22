import { StyleSheet, Text, View } from 'react-native';

import PrimaryButton from '../ui/PrimaryButton';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
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
        {duration} minutos • {type}
      </Text>

      <PrimaryButton label="Começar" onPress={onPress} />
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
    borderColor: colors.primary,
  },

  label: {
    color: colors.text.secondary,
    ...typography.label,
    textTransform: 'uppercase',
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
});
