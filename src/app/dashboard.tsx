import { ScrollView, StyleSheet } from 'react-native';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import DailyGoalCard from '../components/dashboard/DailyGoalCard';
import NextStudyCard from '../components/dashboard/NextStudyCard';
import StatsCard from '../components/dashboard/StatsCard';

import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';

export default function DashboardScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <DashboardHeader name="Estudante" streak={3} />

      <DailyGoalCard studiedMinutes={12} targetMinutes={20} />

      <NextStudyCard subject="Português" duration={15} type="Teoria" />

      <StatsCard streak={3} xp={120} sessions={18} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.screenTop,
    paddingBottom: spacing.screenBottom,
  },
});