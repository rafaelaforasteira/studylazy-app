import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type ProfileStatCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export default function ProfileStatCard({
  label,
  value,
  helper,
}: ProfileStatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.sm,
  },

  label: {
    color: colors.text.secondary,
    ...typography.label,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },

  value: {
    color: colors.text.primary,
    ...typography.stat,
  },

  helper: {
    color: colors.text.muted,
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
});
