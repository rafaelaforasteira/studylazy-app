import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import AppScreen from '../components/ui/AppScreen';
import PrimaryButton from '../components/ui/PrimaryButton';
import NpsPrompt from '../components/feedback/NpsPrompt';
import { colors } from '../constants/colors';
import { ROUTES } from '../constants/routes';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { safeGoBack } from '../lib/navigationHelpers';
import { useAuthStore } from '../store/authStore';
import { useFeedbackStore } from '../store/feedbackStore';
import { useSyncStore } from '../store/syncStore';
import type { FeedbackCategory, FeedbackKind } from '../feedback/feedbackTypes';

type Mode = 'menu' | 'nps' | 'bug' | 'suggestion' | 'general';

const MODE_LABELS: Record<Exclude<Mode, 'menu' | 'nps'>, string> = {
  bug: 'Reportar bug',
  suggestion: 'Dar sugestão',
  general: 'Comentário geral',
};

export default function FeedbackScreen() {
  const router = useRouter();
  const userId = useAuthStore((state) => state.session?.user?.id ?? null);
  const guestId = useSyncStore((state) => state.deviceId);
  const submitGeneral = useFeedbackStore((state) => state.submitGeneral);

  const [mode, setMode] = useState<Mode>('menu');
  const [comment, setComment] = useState('');
  const [screenName, setScreenName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const lockRef = useRef(false);

  function handleBack() {
    if (mode !== 'menu' && !done) {
      setMode('menu');
      setError(null);
      return;
    }
    safeGoBack(router, ROUTES.tabsVoce);
  }

  function handleSubmitGeneral(kind: Exclude<FeedbackKind, 'nps'>) {
    if (submitting || lockRef.current) {
      return;
    }
    lockRef.current = true;
    setSubmitting(true);
    setError(null);

    const category: FeedbackCategory =
      kind === 'bug' ? 'bug' : kind === 'suggestion' ? 'suggestion' : 'other';

    const entry = submitGeneral({
      kind,
      category,
      comment,
      screen: screenName.trim() || 'feedback',
      userId,
      guestId: userId ? null : guestId,
    });

    setSubmitting(false);
    lockRef.current = false;

    if (!entry) {
      setError('Escreva um comentário para enviar.');
      return;
    }
    setDone(true);
  }

  return (
    <AppScreen keyboard contentStyle={styles.content}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={handleBack}
        hitSlop={8}
        style={styles.backButton}
      >
        <Text style={styles.backText}>‹ Voltar</Text>
      </Pressable>

      <Text style={styles.title}>Feedback do beta</Text>
      <Text style={styles.subtitle}>
        Sua opinião é anônima o suficiente para não expor e-mail. Comentários
        ajudam a priorizar o que melhorar — incluindo o sistema de vidas.
      </Text>

      {done ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Obrigado!</Text>
          <Text style={styles.cardText}>
            Feedback salvo neste aparelho. Se você estiver online, tentaremos
            enviar em segundo plano.
          </Text>
          <PrimaryButton
            label="Voltar"
            onPress={() => safeGoBack(router, ROUTES.tabsVoce)}
          />
        </View>
      ) : null}

      {!done && mode === 'menu' ? (
        <View style={styles.menu}>
          <PrimaryButton
            label="Avaliar experiência (NPS)"
            onPress={() => setMode('nps')}
          />
          <PrimaryButton
            label="Reportar bug"
            variant="secondary"
            onPress={() => setMode('bug')}
          />
          <PrimaryButton
            label="Dar sugestão"
            variant="secondary"
            onPress={() => setMode('suggestion')}
          />
          <PrimaryButton
            label="Comentário geral"
            variant="secondary"
            onPress={() => setMode('general')}
          />
        </View>
      ) : null}

      {!done && mode === 'nps' ? (
        <NpsPrompt
          screen="feedback"
          onSubmitted={() => setDone(true)}
          onDismissed={() => setMode('menu')}
        />
      ) : null}

      {!done && mode !== 'menu' && mode !== 'nps' ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{MODE_LABELS[mode]}</Text>
          <Text style={styles.fieldLabel}>Categoria</Text>
          <Text style={styles.cardText}>
            {mode === 'bug'
              ? 'Bug / problema'
              : mode === 'suggestion'
                ? 'Sugestão'
                : 'Geral'}
          </Text>

          <Text style={styles.fieldLabel}>Comentário</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Descreva o que aconteceu ou o que gostaria de ver"
            placeholderTextColor={colors.text.muted}
            multiline
            style={styles.input}
            accessibilityLabel="Comentário do feedback"
          />

          <Text style={styles.fieldLabel}>Tela onde aconteceu (opcional)</Text>
          <TextInput
            value={screenName}
            onChangeText={setScreenName}
            placeholder="Ex.: Estudar, sessão, vidas…"
            placeholderTextColor={colors.text.muted}
            style={styles.inputSingle}
            accessibilityLabel="Tela onde aconteceu"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            label="Enviar"
            loading={submitting}
            disabled={submitting}
            onPress={() => handleSubmitGeneral(mode)}
          />
        </View>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  backButton: { alignSelf: 'flex-start' },
  backText: {
    color: colors.text.secondary,
    ...typography.body,
    fontWeight: '600',
  },
  title: { color: colors.text.primary, ...typography.title },
  subtitle: { color: colors.text.secondary, ...typography.bodySmall },
  menu: { gap: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTitle: {
    color: colors.text.primary,
    ...typography.body,
    fontWeight: '800',
  },
  cardText: { color: colors.text.secondary, ...typography.bodySmall },
  fieldLabel: {
    color: colors.text.secondary,
    ...typography.bodySmall,
    fontWeight: '700',
  },
  input: {
    minHeight: 100,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surfaceSecondary,
    color: colors.text.primary,
    padding: spacing.md,
    textAlignVertical: 'top',
    ...typography.bodySmall,
  },
  inputSingle: {
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surfaceSecondary,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    ...typography.bodySmall,
  },
  error: { color: colors.danger, ...typography.bodySmall },
});
