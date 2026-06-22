import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type MistakeReviewCardProps = {
  mistakeCount: number;
  onPress?: () => void;
};

export default function MistakeReviewCard({
  mistakeCount,
  onPress,
}: MistakeReviewCardProps) {
  if (mistakeCount === 0) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.iconBadge}>
        <SymbolView
          name={{ ios: 'exclamationmark.circle.fill', android: 'warning', web: 'warning' }}
          tintColor={colors.warning.main}
          size={28}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Revisar erros</Text>

        <Text style={styles.description}>
          {mistakeCount}{' '}
          {mistakeCount === 1
            ? 'questão precisa de atenção'
            : 'questões precisam de atenção'}
        </Text>
      </View>

      <View style={styles.countBadge}>
        <Text style={styles.countText}>{mistakeCount}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card.background,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.warning.main,
    gap: spacing.md,
  },

  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.warning.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    flex: 1,
  },

  title: {
    color: colors.text.primary,
    ...typography.body,
    fontWeight: '700',
    marginBottom: 2,
  },

  description: {
    color: colors.text.secondary,
    ...typography.bodySmall,
  },

  countBadge: {
    minWidth: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.warning.main,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },

  countText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
