import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import PrimaryButton from '../ui/PrimaryButton';
import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { useFeedbackStore } from '../../store/feedbackStore';
import { useAuthStore } from '../../store/authStore';
import { useSyncStore } from '../../store/syncStore';

type NpsPromptProps = {
  screen?: string;
  /** Se true, marca como exibido ao montar (triggers automáticos). */
  trackShownOnMount?: boolean;
  onSubmitted?: () => void;
  onDismissed?: () => void;
  compact?: boolean;
};

const SCORES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export default function NpsPrompt({
  screen = 'voce',
  trackShownOnMount = false,
  onSubmitted,
  onDismissed,
  compact = false,
}: NpsPromptProps) {
  const submitNps = useFeedbackStore((state) => state.submitNps);
  const markNpsShown = useFeedbackStore((state) => state.markNpsShown);
  const dismissNpsTemporarily = useFeedbackStore(
    (state) => state.dismissNpsTemporarily
  );
  const userId = useAuthStore((state) => state.session?.user?.id ?? null);
  const guestId = useSyncStore((state) => state.deviceId);

  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [improvement, setImprovement] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  useEffect(() => {
    if (trackShownOnMount) {
      markNpsShown();
    }
  }, [trackShownOnMount, markNpsShown]);

  function handleDismiss() {
    dismissNpsTemporarily();
    onDismissed?.();
  }

  function handleSubmit() {
    if (submitting || submitLockRef.current) {
      return;
    }
    if (score === null) {
      setError('Escolha uma nota de 0 a 10.');
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    setError(null);

    const entry = submitNps({
      score,
      comment,
      improvement,
      screen,
      userId,
      guestId: userId ? null : guestId,
    });

    setSubmitting(false);
    submitLockRef.current = false;

    if (!entry) {
      setError('Não foi possível salvar sua avaliação. Tente de novo.');
      return;
    }

    setDone(true);
    onSubmitted?.();
  }

  if (done) {
    return (
      <View style={[styles.card, compact && styles.cardCompact]}>
        <Text style={styles.title}>Obrigado pelo feedback!</Text>
        <Text style={styles.subtitle}>
          Sua opinião ajuda a melhorar o StudyLazy no beta.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.card, compact && styles.cardCompact]}
      accessibilityRole="summary"
    >
      <Text style={styles.eyebrow}>Beta · NPS</Text>
      <Text style={styles.title}>
        De 0 a 10, o quanto você recomendaria o StudyLazy para outro estudante?
      </Text>

      <View style={styles.scoreRow}>
        {SCORES.map((value) => {
          const selected = score === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={`Nota ${value}`}
              accessibilityState={{ selected }}
              onPress={() => {
                setScore(value);
                setError(null);
              }}
              style={[styles.scoreChip, selected && styles.scoreChipSelected]}
            >
              <Text
                style={[
                  styles.scoreChipText,
                  selected && styles.scoreChipTextSelected,
                ]}
              >
                {value}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.scaleHints}>
        <Text style={styles.hint}>0 · pouco</Text>
        <Text style={styles.hint}>10 · muito</Text>
      </View>

      {score !== null ? (
        <>
          <Text style={styles.fieldLabel}>O que fez você dar essa nota?</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Opcional"
            placeholderTextColor={colors.text.muted}
            multiline
            style={styles.input}
            accessibilityLabel="Comentário sobre a nota"
          />

          <Text style={styles.fieldLabel}>
            O que você mais gostaria que melhorasse no app?
          </Text>
          <TextInput
            value={improvement}
            onChangeText={setImprovement}
            placeholder="Opcional"
            placeholderTextColor={colors.text.muted}
            multiline
            style={styles.input}
            accessibilityLabel="Sugestão de melhoria"
          />
        </>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        label="Enviar avaliação"
        loading={submitting}
        disabled={submitting || score === null}
        onPress={handleSubmit}
      />
      <PrimaryButton
        label="Agora não"
        variant="secondary"
        disabled={submitting}
        onPress={handleDismiss}
        style={styles.secondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardCompact: {
    padding: spacing.md,
  },
  eyebrow: {
    color: colors.primarySoft,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text.primary,
    ...typography.body,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.text.secondary,
    ...typography.bodySmall,
  },
  scoreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  scoreChip: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  scoreChipSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderColor: colors.primary,
  },
  scoreChipText: {
    color: colors.text.secondary,
    fontWeight: '800',
    fontSize: 13,
  },
  scoreChipTextSelected: {
    color: colors.primarySoft,
  },
  scaleHints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hint: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  fieldLabel: {
    color: colors.text.secondary,
    ...typography.bodySmall,
    fontWeight: '700',
  },
  input: {
    minHeight: 72,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surfaceSecondary,
    color: colors.text.primary,
    padding: spacing.md,
    textAlignVertical: 'top',
    ...typography.bodySmall,
  },
  error: {
    color: colors.danger,
    ...typography.bodySmall,
  },
  secondary: {
    marginTop: spacing.xs,
  },
});
