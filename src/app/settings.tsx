import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';

import AppScreen from '../components/ui/AppScreen';
import PrimaryButton from '../components/ui/PrimaryButton';

import { colors } from '../constants/colors';
import { ROUTES } from '../constants/routes';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

import { useOnboardingStore } from '../store/onboardingStore';
import { useStudyProgressStore } from '../store/studyProgressStore';
import { useProfileStore } from '../store/profileStore';
import { useMistakeStore } from '../store/mistakeStore';
import {
  getForeignLanguageLabel,
  type ForeignLanguagePreference,
} from '../data/questionTypes';

const FOREIGN_LANGUAGE_OPTIONS: {
  value: ForeignLanguagePreference;
  label: string;
}[] = [
  { value: 'english', label: 'Inglês' },
  { value: 'spanish', label: 'Espanhol' },
];

export default function SettingsScreen() {
  const router = useRouter();

  const resetAnswers = useOnboardingStore(
    (state) => state.resetAnswers
  );
  const resetProgress = useStudyProgressStore(
    (state) => state.resetProgress
  );
  const resetProfile = useProfileStore(
    (state) => state.resetProfile
  );
  const clearMistakes = useMistakeStore(
    (state) => state.clearMistakes
  );

  const foreignLanguage = useProfileStore(
    (state) => state.foreignLanguage
  );
  const setForeignLanguage = useProfileStore(
    (state) => state.setForeignLanguage
  );

  function handleOpenProfile() {
    router.push(ROUTES.profile);
  }

  function handleSelectLanguage(language: ForeignLanguagePreference) {
    if (language === foreignLanguage) {
      return;
    }

    setForeignLanguage(language);

    Alert.alert(
      'Idioma atualizado',
      `Suas próximas sessões de língua estrangeira usarão ${getForeignLanguageLabel(
        language
      )}. Seu histórico, XP e sequência foram mantidos.`
    );
  }

  function confirmResetProgress() {
    Alert.alert(
      'Resetar progresso?',
      'Isso apaga XP, sequência, histórico, tarefas concluídas e erros salvos. Suas respostas do onboarding serão mantidas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar reset',
          style: 'destructive',
          onPress: () => {
            resetProgress();
            clearMistakes();
            router.replace(ROUTES.tabsVoce);
          },
        },
      ]
    );
  }

  function confirmResetOnboarding() {
    Alert.alert(
      'Refazer onboarding?',
      'Isso apaga perfil, progresso, histórico, erros e todas as respostas do onboarding.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar reset',
          style: 'destructive',
          onPress: () => {
            resetProgress();
            resetProfile();
            resetAnswers();
            clearMistakes();
            router.replace(ROUTES.onboardingStart);
          },
        },
      ]
    );
  }

  return (
    <AppScreen>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
        <Text style={styles.subtitle}>
          Personalize sua experiência ou reinicie os dados do
          aplicativo.
        </Text>
      </View>

      <View style={styles.card}>
        <SymbolView
          name={{ ios: 'person.fill', android: 'person', web: 'person' }}
          tintColor={colors.primary}
          size={28}
        />

        <Text style={styles.cardTitle}>Meu perfil</Text>
        <Text style={styles.cardDescription}>
          Altere seu nome e acompanhe suas principais
          estatísticas.
        </Text>

        <PrimaryButton
          label="Abrir perfil"
          onPress={handleOpenProfile}
        />
      </View>

      <View style={styles.card}>
        <SymbolView
          name={{ ios: 'globe', android: 'language', web: 'language' }}
          tintColor={colors.primary}
          size={28}
        />

        <Text style={styles.cardTitle}>Língua estrangeira</Text>
        <Text style={styles.cardDescription}>
          {foreignLanguage
            ? `Atual: ${getForeignLanguageLabel(foreignLanguage)}. Trocar não apaga histórico, erros, XP ou sequência.`
            : 'Escolha entre Inglês e Espanhol para as sessões de língua estrangeira.'}
        </Text>

        <View style={styles.languageRow}>
          {FOREIGN_LANGUAGE_OPTIONS.map((option) => {
            const isActive = option.value === foreignLanguage;

            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityLabel={`Escolher ${option.label}`}
                onPress={() => handleSelectLanguage(option.value)}
                style={[
                  styles.languageChip,
                  isActive && styles.languageChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.languageChipText,
                    isActive && styles.languageChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <SymbolView
          name={{ ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' }}
          tintColor={colors.primary}
          size={28}
        />

        <Text style={styles.cardTitle}>Progresso</Text>
        <Text style={styles.cardDescription}>
          Apaga XP, sequência, sessões, histórico, tarefas
          concluídas e erros salvos.
        </Text>

        <PrimaryButton
          label="Resetar progresso"
          variant="secondary"
          onPress={confirmResetProgress}
        />
      </View>

      <View style={styles.card}>
        <SymbolView
          name={{ ios: 'arrow.counterclockwise', android: 'refresh', web: 'refresh' }}
          tintColor={colors.danger}
          size={28}
        />

        <Text style={styles.cardTitle}>
          Recomeçar o aplicativo
        </Text>
        <Text style={styles.cardDescription}>
          Apaga o perfil, o progresso, os erros e todas as
          respostas do onboarding.
        </Text>

        <PrimaryButton
          label="Refazer onboarding"
          variant="danger"
          onPress={confirmResetOnboarding}
        />
      </View>

      <PrimaryButton
        label="Voltar ao dashboard"
        variant="secondary"
        onPress={() => router.back()}
        style={styles.backButton}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },

  title: {
    color: colors.text.primary,
    ...typography.title,
    marginBottom: spacing.sm,
  },

  subtitle: {
    color: colors.text.secondary,
    ...typography.body,
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

  cardTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },

  cardDescription: {
    color: colors.text.secondary,
    ...typography.body,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },

  backButton: {
    marginTop: spacing.sm,
  },

  languageRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  languageChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border.default,
    backgroundColor: colors.card.elevated,
  },

  languageChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.card.selected,
  },

  languageChipText: {
    color: colors.text.primary,
    ...typography.body,
    fontWeight: '700',
  },

  languageChipTextActive: {
    color: colors.primary,
  },
});
