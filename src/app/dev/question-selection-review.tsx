import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import {
  getOfficialQuestionsForSubject,
  getStableQuestionId,
} from '../../data/questionBank';
import {
  selectSmartQuestions,
  type QuestionPerformanceLike,
} from '../../data/questionSelection';
import { isOfficialVerifiedQuestion } from '../../data/questionTypes';

const SUBJECTS = [
  'Português',
  'Ciências Humanas',
  'Ciências da Natureza',
  'Matemática',
  'Inglês',
  'Espanhol',
] as const;

const COUNTS = [3, 5, 10, 15] as const;

type Scenario =
  | 'empty'
  | 'allAnswered'
  | 'withErrors'
  | 'recent';

const SCENARIOS: [Scenario, string][] = [
  ['empty', 'Histórico vazio'],
  ['allAnswered', 'Todas respondidas'],
  ['withErrors', 'Com erros'],
  ['recent', 'Histórico recente'],
];

const DAY_MS = 86_400_000;

function buildScenarioState(
  scenario: Scenario,
  subject: string,
  now: number
) {
  const pool = getOfficialQuestionsForSubject(subject);
  const performanceByQuestion: Record<string, QuestionPerformanceLike> = {};
  const recentQuestionIds: string[] = [];

  if (scenario === 'empty') {
    return { performanceByQuestion, recentQuestionIds };
  }

  pool.forEach((question, index) => {
    const stableId = getStableQuestionId(question);

    if (scenario === 'allAnswered') {
      performanceByQuestion[stableId] = {
        stableQuestionId: stableId,
        attempts: 1,
        correctAttempts: 1,
        incorrectAttempts: 0,
        lastAnsweredAt: new Date(now - (index + 1) * DAY_MS).toISOString(),
        lastResult: 'correct',
      };
    }

    if (scenario === 'withErrors') {
      const isError = index % 3 === 0;
      performanceByQuestion[stableId] = {
        stableQuestionId: stableId,
        attempts: 1,
        correctAttempts: isError ? 0 : 1,
        incorrectAttempts: isError ? 1 : 0,
        lastAnsweredAt: new Date(now - (index + 1) * DAY_MS).toISOString(),
        lastResult: isError ? 'incorrect' : 'correct',
      };
    }

    if (scenario === 'recent' && index < 10) {
      recentQuestionIds.push(stableId);
      performanceByQuestion[stableId] = {
        stableQuestionId: stableId,
        attempts: 1,
        correctAttempts: 1,
        incorrectAttempts: 0,
        lastAnsweredAt: new Date(now - index * 3_600_000).toISOString(),
        lastResult: 'correct',
      };
    }
  });

  return { performanceByQuestion, recentQuestionIds };
}

export default function QuestionSelectionReviewScreen() {
  if (!__DEV__) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>
          Tela disponível apenas em desenvolvimento.
        </Text>
      </View>
    );
  }

  return <QuestionSelectionReviewContent />;
}

function QuestionSelectionReviewContent() {
  const [subject, setSubject] = useState<string>('Matemática');
  const [count, setCount] = useState<number>(5);
  const [topic, setTopic] = useState<string>('all');
  const [scenario, setScenario] = useState<Scenario>('empty');
  const [seed, setSeed] = useState<string>('1');

  const now = useMemo(() => Date.UTC(2026, 5, 25), []);

  const topicOptions = useMemo(() => {
    const topics = new Set(
      getOfficialQuestionsForSubject(subject)
        .map((question) => question.topic)
        .filter((value): value is string => Boolean(value))
    );
    return ['all', ...Array.from(topics).sort()];
  }, [subject]);

  const result = useMemo(() => {
    const { performanceByQuestion, recentQuestionIds } = buildScenarioState(
      scenario,
      subject,
      now
    );

    return selectSmartQuestions({
      questions: getOfficialQuestionsForSubject(subject),
      requestedCount: count,
      subject,
      topic: topic === 'all' ? undefined : topic,
      performanceByQuestion,
      recentQuestionIds,
      now,
      shuffleSeed: Number(seed) || 1,
    });
  }, [subject, count, topic, scenario, seed, now]);

  const selectedTopics = useMemo(() => {
    const counts = new Map<string, number>();
    result.questions.forEach((question) => {
      const key = question.topic ?? '—';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [result]);

  const allOfficial = result.questions.every(isOfficialVerifiedQuestion);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Revisão — Motor de Seleção</Text>
      <Text style={styles.subtitle}>
        Somente questões oficiais, verificadas e pontuáveis são selecionadas.
      </Text>

      <FilterRow
        label="Matéria"
        options={SUBJECTS.map((value) => [value, value])}
        value={subject}
        onChange={(value) => {
          setSubject(value);
          setTopic('all');
        }}
      />

      <FilterRow
        label="Quantidade"
        options={COUNTS.map((value) => [String(value), String(value)])}
        value={String(count)}
        onChange={(value) => setCount(Number(value))}
      />

      <FilterRow
        label="Tópico"
        options={topicOptions.map((value) => [
          value,
          value === 'all' ? 'Todos' : value,
        ])}
        value={topic}
        onChange={setTopic}
      />

      <FilterRow
        label="Cenário"
        options={SCENARIOS}
        value={scenario}
        onChange={(value) => setScenario(value as Scenario)}
      />

      <View style={styles.seedRow}>
        <Text style={styles.filterLabel}>Seed</Text>
        <TextInput
          style={styles.input}
          value={seed}
          onChangeText={setSeed}
          keyboardType="number-pad"
          placeholder="seed"
          placeholderTextColor={colors.text.muted}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Diagnóstico</Text>
        <Text style={styles.diagnostic}>
          {`elegíveis=${result.diagnostics.eligibleCount}\nselecionadas=${result.diagnostics.selectedCount}\ninéditas=${result.diagnostics.unseenCount}\ncom erro=${result.diagnostics.incorrectCount}\nrecentes evitadas=${result.diagnostics.recentCountAvoided}\nduplicatas=${result.diagnostics.repeatedIds.length}`}
        </Text>

        <Text
          style={[
            styles.badge,
            allOfficial ? styles.badgeOk : styles.badgeError,
          ]}
        >
          {allOfficial
            ? 'Somente oficiais: OK'
            : 'FALHA: questão não oficial selecionada'}
        </Text>

        <Text
          style={[
            styles.badge,
            result.diagnostics.repeatedIds.length === 0
              ? styles.badgeOk
              : styles.badgeError,
          ]}
        >
          {result.diagnostics.repeatedIds.length === 0
            ? 'Zero repetição na sessão: OK'
            : `Repetidas: ${result.diagnostics.repeatedIds.join(', ')}`}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tópicos selecionados</Text>
        {selectedTopics.map(([topicName, topicCount]) => (
          <Text key={topicName} style={styles.body}>
            {topicName}: {topicCount}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          IDs selecionados ({result.questions.length})
        </Text>
        {result.questions.map((question, index) => (
          <Text key={getStableQuestionId(question)} style={styles.body}>
            {index + 1}. {getStableQuestionId(question)} | {question.topic} |{' '}
            {question.subject}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: [string, string][];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.filterBlock}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map(([optionValue, optionLabel]) => (
          <Pressable
            key={optionValue}
            style={[
              styles.chip,
              value === optionValue ? styles.chipActive : null,
            ]}
            onPress={() => onChange(optionValue)}
          >
            <Text
              style={[
                styles.chipText,
                value === optionValue ? styles.chipTextActive : null,
              ]}
            >
              {optionLabel}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  blocked: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  blockedText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  title: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  filterBlock: {
    gap: spacing.xs,
  },
  filterLabel: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text.secondary,
    fontSize: 13,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  seedRow: {
    gap: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    backgroundColor: colors.surface,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  diagnostic: {
    color: colors.text.primary,
    fontSize: 14,
    lineHeight: 20,
  },
  body: {
    color: colors.text.primary,
    fontSize: 13,
    lineHeight: 19,
  },
  badge: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  badgeOk: {
    color: '#15803D',
  },
  badgeError: {
    color: '#B45309',
  },
});
