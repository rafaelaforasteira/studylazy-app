import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

import { useProfileStore } from '../store/profileStore';
import { useStudyProgressStore } from '../store/studyProgressStore';

export default function ProfileScreen() {
  const router = useRouter();

  const savedName = useProfileStore((state) => state.name);
  const setName = useProfileStore((state) => state.setName);

  const xp = useStudyProgressStore((state) => state.xp);
  const streak = useStudyProgressStore((state) => state.streak);
  const sessionsCompleted = useStudyProgressStore(
    (state) => state.sessionsCompleted
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
              placeholderTextColor={colors.text.secondary}
              maxLength={30}
              returnKeyType="done"
            />

            {saved && (
              <Text style={styles.successText}>
                Nome salvo com sucesso ✅
              </Text>
            )}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                Salvar nome
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Seu progresso</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{xp}</Text>
                <Text style={styles.statLabel}>XP</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{streak}</Text>
                <Text style={styles.statLabel}>dias</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {sessionsCompleted}
                </Text>

                <Text style={styles.statLabel}>lições</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.screenTop,
    paddingBottom: spacing.screenBottom,
    justifyContent: 'space-between',
  },

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
    borderRadius: 20,
    marginBottom: spacing.lg,
  },

  label: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },

  input: {
    backgroundColor: colors.background,
    color: colors.text.primary,
    borderWidth: 2,
    borderColor: colors.border.default,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
  },

  successText: {
    color: '#22c55e',
    fontSize: 14,
    marginBottom: spacing.md,
  },

  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },

  saveButtonText: {
    color: colors.background,
    ...typography.button,
  },

  statsCard: {
    backgroundColor: colors.card.background,
    padding: spacing.lg,
    borderRadius: 20,
    marginBottom: spacing.lg,
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
  },

  statValue: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },

  statLabel: {
    color: colors.text.secondary,
    fontSize: 13,
    marginTop: 4,
  },

  backButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.lg,
  },

  backButtonText: {
    color: colors.text.secondary,
    ...typography.body,
  },
});