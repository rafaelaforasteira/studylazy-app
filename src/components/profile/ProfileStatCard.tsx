import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type ProfileStatCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon?: string;
};

export default function ProfileStatCard({
  label,
  value,
  helper,
  icon,
}: ProfileStatCardProps) {
  return (
    <View style={styles.card}>
      {icon ? (
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
      ) : null}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    minHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(139, 92, 246, 0.11)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  iconText: {
    color: colors.primarySoft,
    fontSize: 16,
    fontWeight: '700',
  },

  label: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },

  value: {
    color: colors.text.primary,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  helper: {
    color: colors.text.muted,
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
});
