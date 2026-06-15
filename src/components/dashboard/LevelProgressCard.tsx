import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

import { getLevelInfo } from '../../utils/gamification';

type LevelProgressCardProps = {
  xp: number;
};

export default function LevelProgressCard({ xp }: LevelProgressCardProps) {
  const levelInfo = getLevelInfo(xp);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Seu nível</Text>

          <Text style={styles.level}>Nível {levelInfo.level}</Text>
        </View>

        <View style={styles.xpBadge}>
          <Text style={styles.xpBadgeText}>{xp} XP</Text>
        </View>
      </View>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${levelInfo.progress}%`,
            },
          ]}
        />
      </View>

      <Text style={styles.description}>
        Faltam {levelInfo.remainingXp} XP para o próximo nível
      </Text>
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  label: {
    color: colors.text.secondary,
    ...typography.body,
    marginBottom: 4,
  },

  level: {
    color: colors.text.primary,
    fontSize: 26,
    fontWeight: 'bold',
  },

  xpBadge: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
  },

  xpBadgeText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: 'bold',
  },

  progressBackground: {
    height: 10,
    backgroundColor: '#334155',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },

  description: {
    color: colors.text.secondary,
    ...typography.body,
  },
});