import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';

import AppScreen from '../components/ui/AppScreen';
import PrimaryButton from '../components/ui/PrimaryButton';

import { colors } from '../constants/colors';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

import { useProfileStore } from '../store/profileStore';
import { useStudyProgressStore } from '../store/studyProgressStore';
import { getDisplayStreak } from '../utils/streak';

export default function ProfileScreen() {
  const router = useRouter();

  const savedName = useProfileStore((state) => state.name);
  const setName = useProfileStore((state) => state.setName);

  const xp = useStudyProgressStore((state) => state.xp);
  const storedStreak = useStudyProgressStore(
    (state) => state.streak
  );
  const lastStudyDate = useStudyProgressStore(
    (state) => state.lastStudyDate
  );
  const sessionsCompleted = useStudyProgressStore(
    (state) => state.sessionsCompleted
  );

  const displayStreak = getDisplayStreak(
    lastStudyDate,
    storedStreak
  );

  const [name, setLocalName] = useState(savedName);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setName(name);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  }

  return (
    <AppScreen keyboard>
      <View>
        <Text style={styles.title}>Meu perfil</Text>

        <Text style={styles.subtitle}>
          Personalize como seu nome aparece no StudyLazy.
        </Text>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(name.trim().charAt(0) || 'E').toUpperCase()}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Seu nome</Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setLocalName}
            placeholder="Digite seu nome"
            placeholderTextColor={colors.text.muted}
            maxLength={30}
            returnKeyType="done"
          />

          {saved && (
            <Text style={styles.successText}>
              Nome salvo com sucesso
            </Text>
          )}

          <PrimaryButton label="Salvar nome" onPress={handleSave} />
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Seu progresso</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <SymbolView
                name={{ ios: 'star.fill', android: 'star', web: 'star' }}
                tintColor={colors.xp}
                size={22}
              />
              <Text style={styles.statValue}>{xp}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>

            <View style={styles.statItem}>
              <SymbolView
                name={{ ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' }}
                tintColor={colors.warning}
                size={22}
              />
              <Text style={styles.statValue}>
                {displayStreak}
              </Text>
              <Text style={styles.statLabel}>dias</Text>
            </View>

            <View style={styles.statItem}>
              <SymbolView
                name={{ ios: 'book.fill', android: 'menu_book', web: 'menu_book' }}
                tintColor={colors.primary}
                size={22}
              />
              <Text style={styles.statValue}>
                {sessionsCompleted}
              </Text>
              <Text style={styles.statLabel}>lições</Text>
            </View>
          </View>
        </View>
      </View>

      <PrimaryButton
        label="Voltar"
        variant="secondary"
        onPress={() => router.back()}
        style={styles.backButton}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text.primary,
    ...typography.title,
    marginBottom: spacing.sm,
  },

  subtitle: {
    color: colors.text.secondary,
    ...typography.body,
    marginBottom: spacing.xl,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },

  avatarText: {
    color: colors.background,
    fontSize: 38,
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: colors.card.background,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.sm,
  },

  label: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },

  input: {
    backgroundColor: colors.backgroundElevated,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },

  successText: {
    color: colors.success,
    fontSize: 14,
  },

  statsCard: {
    backgroundColor: colors.card.background,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },

  statsTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },

  statsRow: {
    flexDirection: 'row',
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },

  statValue: {
    color: colors.text.primary,
    ...typography.stat,
  },

  statLabel: {
    color: colors.text.secondary,
    ...typography.bodySmall,
  },

  backButton: {
    marginTop: spacing.lg,
  },
});
