import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import AppCard from '../../components/ui/AppCard';
import AppScreen from '../../components/ui/AppScreen';
import PrimaryButton from '../../components/ui/PrimaryButton';
import LivesIndicator from '../../components/lives/LivesIndicator';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { ROUTES } from '../../constants/routes';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

import { useDashboardData } from '../../hooks/use-dashboard-data';
import { useStartStudy } from '../../hooks/use-start-study';
import { useProfileStore } from '../../store/profileStore';
import {
  getForeignLanguageLabel,
  getForeignLanguageSubject,
  type ForeignLanguagePreference,
} from '../../data/questionTypes';

const QUICK_DURATIONS = [5, 10, 15] as const;

const QUICK_SUBJECTS = [
  { subject: 'Português', type: 'Teoria' },
  { subject: 'Matemática', type: 'Exercícios' },
  { subject: 'Redação', type: 'Revisão' },
] as const;

const FOREIGN_LANGUAGE_OPTIONS: {
  value: ForeignLanguagePreference;
  label: string;
}[] = [
  { value: 'english', label: 'Inglês' },
  { value: 'spanish', label: 'Espanhol' },
];

export default function EstudarScreen() {
  const router = useRouter();
  const { startStudy, startNextTask } = useStartStudy();
  const data = useDashboardData();

  const foreignLanguage = useProfileStore((state) => state.foreignLanguage);
  const setForeignLanguage = useProfileStore(
    (state) => state.setForeignLanguage
  );

  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  function startForeignLanguageSession(language: ForeignLanguagePreference) {
    startStudy({
      subject: getForeignLanguageSubject(language),
      duration: 5,
      type: 'Leitura',
    });
  }

  function handleForeignLanguagePress() {
    if (!foreignLanguage) {
      setShowLanguagePicker(true);
      return;
    }

    startForeignLanguageSession(foreignLanguage);
  }

  function handleSelectLanguage(language: ForeignLanguagePreference) {
    setForeignLanguage(language);
    setShowLanguagePicker(false);
    startForeignLanguageSession(language);
  }

  const foreignLanguageLabel = foreignLanguage
    ? getForeignLanguageLabel(foreignLanguage)
    : null;

  const hasPlan = data.todayPlan.length > 0;

  return (
    <AppScreen hasTabBar contentStyle={styles.content}>
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Hub de estudos</Text>
          <Text style={styles.subtitle}>
            Escolha como continuar sua jornada de aprendizado.
          </Text>
        </View>
        <LivesIndicator compact />
      </View>

      {hasPlan ? (
        <AppCard title="Próxima atividade recomendada">
          <Text style={styles.taskTitle}>{data.nextTask.subject}</Text>
          <Text style={styles.cardText}>
            {data.nextTask.duration} min • {data.nextTask.type}
          </Text>
          <PrimaryButton
            label="Continuar meu plano"
            onPress={() => startNextTask(data.nextTask)}
            style={styles.button}
          />
        </AppCard>
      ) : (
        <AppCard title="Plano indisponível">
          <Text style={styles.cardText}>
            Não foi possível gerar um plano agora. Use uma sessão rápida
            abaixo para começar.
          </Text>
        </AppCard>
      )}

      <AppCard title="Matérias disponíveis">
        {QUICK_SUBJECTS.map((item) => (
          <View key={item.subject} style={styles.row}>
            <View>
              <Text style={styles.taskTitle}>{item.subject}</Text>
              <Text style={styles.cardText}>{item.type}</Text>
            </View>
            <PrimaryButton
              label="Estudar"
              variant="secondary"
              onPress={() =>
                startStudy({
                  subject: item.subject,
                  duration: 5,
                  type: item.type,
                })
              }
              style={styles.inlineButton}
            />
          </View>
        ))}
      </AppCard>

      <AppCard title="Língua estrangeira">
        <View style={styles.row}>
          <View style={styles.languageInfo}>
            <Text style={styles.taskTitle}>
              {foreignLanguageLabel ?? 'Escolher idioma'}
            </Text>
            <Text style={styles.cardText}>
              {foreignLanguageLabel
                ? 'Toque para estudar no idioma escolhido'
                : 'Selecione entre Inglês e Espanhol'}
            </Text>
          </View>
          <PrimaryButton
            label={foreignLanguageLabel ? 'Estudar' : 'Escolher'}
            variant="secondary"
            onPress={handleForeignLanguagePress}
            style={styles.inlineButton}
          />
        </View>
      </AppCard>

      <AppCard title="Sessões rápidas">
        {QUICK_DURATIONS.map((duration) => (
          <PrimaryButton
            key={duration}
            label={`${duration} minutos com ${data.nextTask.subject}`}
            variant="secondary"
            onPress={() =>
              startStudy({
                subject: data.nextTask.subject,
                duration,
                type: data.nextTask.type,
              })
            }
            style={styles.button}
          />
        ))}
      </AppCard>

      {data.mistakeCount > 0 ? (
        <AppCard title="Revisão disponível">
          <Text style={styles.cardText}>
            Você tem {data.mistakeCount} questões para reforçar.
          </Text>
          <PrimaryButton
            label="Ir para revisão"
            variant="secondary"
            onPress={() => router.push(ROUTES.reviewMistakes)}
          />
        </AppCard>
      ) : null}

      <Modal
        visible={showLanguagePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Qual língua estrangeira você quer estudar?
            </Text>
            <Text style={styles.modalMessage}>
              Sua escolha fica salva e pode ser alterada depois nas
              configurações.
            </Text>

            {FOREIGN_LANGUAGE_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityLabel={`Escolher ${option.label}`}
                onPress={() => handleSelectLanguage(option.value)}
                style={({ pressed }) => [
                  styles.languageOption,
                  pressed && styles.languageOptionPressed,
                ]}
              >
                <Text style={styles.languageOptionText}>{option.label}</Text>
              </Pressable>
            ))}

            <PrimaryButton
              label="Cancelar"
              variant="secondary"
              onPress={() => setShowLanguagePicker(false)}
              style={styles.modalCancel}
            />
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  titleBlock: {
    flex: 1,
    gap: spacing.xs,
  },

  title: {
    color: colors.text.primary,
    ...typography.title,
  },

  subtitle: {
    color: colors.text.secondary,
    ...typography.body,
  },

  taskTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  cardText: {
    color: colors.text.secondary,
    ...typography.body,
    marginBottom: spacing.sm,
  },

  button: {
    marginBottom: spacing.sm,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  inlineButton: {
    minHeight: 40,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  languageInfo: {
    flex: 1,
    paddingRight: spacing.sm,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },

  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
  },

  modalTitle: {
    color: colors.text.primary,
    ...typography.title,
    marginBottom: spacing.sm,
  },

  modalMessage: {
    color: colors.text.secondary,
    ...typography.body,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },

  languageOption: {
    backgroundColor: colors.card.elevated,
    borderWidth: 2,
    borderColor: colors.border.default,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },

  languageOptionPressed: {
    borderColor: colors.primary,
    backgroundColor: colors.card.selected,
  },

  languageOptionText: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '700',
  },

  modalCancel: {
    marginTop: spacing.sm,
  },
});
