import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type AppCardProps = {
  children: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
};

export default function AppCard({ children, title, action }: AppCardProps) {
  return (
    <View style={styles.card}>
      {(title || action) && (
        <View style={styles.header}>
          {title ? <Text style={styles.title}>{title}</Text> : <View />}

          {action}
        </View>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card.background,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  title: {
    color: colors.text.primary,
    ...typography.body,
    fontWeight: '700',
  },
});
