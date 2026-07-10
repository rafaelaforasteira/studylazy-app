import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import PrimaryButton from '../ui/PrimaryButton';
import { colors } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { useEntitlements } from '../../hooks/use-entitlements';

type UpgradeCardProps = {
  /** Texto curto opcional abaixo do título. */
  description?: string;
  compact?: boolean;
};

export default function UpgradeCard({
  description,
  compact = false,
}: UpgradeCardProps) {
  const router = useRouter();
  const { isPro } = useEntitlements();

  if (isPro) {
    return null;
  }

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <Text style={styles.eyebrow}>StudyLazy Pro</Text>
      <Text style={styles.title}>
        {compact ? 'Estudo ilimitado e revisão completa' : 'Evolua com recursos avançados'}
      </Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : (
        <Text style={styles.description}>
          Estudo ilimitado, revisão completa de erros, estatísticas avançadas e
          muito mais — em breve.
        </Text>
      )}
      <PrimaryButton
        label="Conhecer o Pro"
        variant="secondary"
        onPress={() => router.push(ROUTES.pro)}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardCompact: {
    padding: spacing.md,
  },
  eyebrow: {
    color: colors.primarySoft,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.text.secondary,
    ...typography.bodySmall,
    marginBottom: spacing.md,
  },
  button: {
    alignSelf: 'flex-start',
  },
});
