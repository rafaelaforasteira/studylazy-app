import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import QuestionContent from '../../components/questions/QuestionContent';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import {
  auditQuestionDuplicates,
  buildQuestionFingerprint,
} from '../../data/questionFingerprint';
import { officialQuestionBank } from '../../data/questionBank';
import {
  enem2023Day1StagingQuestions,
  enem2023Day1TextQuestions,
} from '../../data/questions/enem/2023/day1';
import {
  enem2023Day2StagingQuestions,
  enem2023Day2TextQuestions,
} from '../../data/questions/enem/2023/day2';
import type { Question } from '../../data/questionTypes';

const allIngestionQuestions = [
  ...enem2023Day1TextQuestions,
  ...enem2023Day2TextQuestions,
];

type ExamDayFilter = 'all' | '1' | '2';
type AreaFilter =
  | 'all'
  | 'Linguagens'
  | 'Ciências Humanas'
  | 'Ciências da Natureza'
  | 'Matemática';
type LanguageFilter = 'all' | 'english' | 'spanish' | 'common';
type StatusFilter = 'all' | 'verified' | 'staging';

function questionHasFormula(question: Question) {
  return question.contentBlocks?.some((block) => block.type === 'formula');
}

function questionHasTable(question: Question) {
  return question.contentBlocks?.some((block) => block.type === 'table');
}

function getTrackLabel(question: Question) {
  if (question.languageTrack === 'english') return 'english';
  if (question.languageTrack === 'spanish') return 'spanish';
  return 'common';
}

function getQuestionIssues(question: Question) {
  const issues: string[] = [];

  if (!question.verified) {
    issues.push('verified=false');
  }

  if (question.options.length !== 5) {
    issues.push('alternativas inválidas');
  }

  if (!question.prompt?.trim()) {
    issues.push('prompt vazio');
  }

  if (question.requiresImage || question.requiresMedia) {
    issues.push('depende de mídia');
  }

  return issues;
}

export default function QuestionIngestionReviewScreen() {
  if (!__DEV__) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>
          Tela disponível apenas em desenvolvimento.
        </Text>
      </View>
    );
  }

  return <QuestionIngestionReviewContent />;
}

function QuestionIngestionReviewContent() {
  const [examDayFilter, setExamDayFilter] = useState<ExamDayFilter>('all');
  const [areaFilter, setAreaFilter] = useState<AreaFilter>('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [languageFilter, setLanguageFilter] =
    useState<LanguageFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [errorOnly, setErrorOnly] = useState(false);
  const [duplicateOnly, setDuplicateOnly] = useState(false);
  const [formulaOnly, setFormulaOnly] = useState(false);
  const [tableOnly, setTableOnly] = useState(false);
  const [externalIdQuery, setExternalIdQuery] = useState('');
  const [textQuery, setTextQuery] = useState('');
  const [index, setIndex] = useState(0);

  const topicOptions = useMemo(() => {
    const topics = new Set(
      allIngestionQuestions.map((question) => question.topic).filter(Boolean)
    );
    return ['all', ...Array.from(topics).sort()];
  }, []);

  const duplicateReport = useMemo(
    () => auditQuestionDuplicates([...officialQuestionBank, ...allIngestionQuestions]),
    []
  );

  const duplicateIds = useMemo(() => {
    const ids = new Set<string>();
    duplicateReport.fingerprintDuplicates.forEach((group) => {
      group.forEach((id) => ids.add(id));
    });
    duplicateReport.highSimilarity.forEach((item) => {
      ids.add(item.idA);
      ids.add(item.idB);
    });
    return ids;
  }, [duplicateReport]);

  const filteredQuestions = useMemo(() => {
    const normalizedText = textQuery.trim().toLowerCase();
    const normalizedId = externalIdQuery.trim().toLowerCase();

    return allIngestionQuestions.filter((question) => {
      if (
        examDayFilter !== 'all' &&
        String(question.examDay) !== examDayFilter
      ) {
        return false;
      }

      if (areaFilter !== 'all' && question.area !== areaFilter) {
        return false;
      }

      if (topicFilter !== 'all' && question.topic !== topicFilter) {
        return false;
      }

      if (formulaOnly && !questionHasFormula(question)) {
        return false;
      }

      if (tableOnly && !questionHasTable(question)) {
        return false;
      }

      if (languageFilter !== 'all' && getTrackLabel(question) !== languageFilter) {
        return false;
      }

      if (statusFilter === 'verified' && !question.verified) {
        return false;
      }

      if (statusFilter === 'staging' && question.verified) {
        return false;
      }

      if (errorOnly && getQuestionIssues(question).length === 0) {
        return false;
      }

      if (duplicateOnly) {
        const id = String(question.externalId ?? question.id);
        if (!duplicateIds.has(id)) {
          return false;
        }
      }

      if (
        normalizedId &&
        !String(question.externalId ?? question.id)
          .toLowerCase()
          .includes(normalizedId)
      ) {
        return false;
      }

      if (normalizedText) {
        const blob = [
          question.prompt,
          question.supportTitle,
          question.supportText,
          question.sourceCitation,
          ...question.options,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!blob.includes(normalizedText)) {
          return false;
        }
      }

      return true;
    });
  }, [
    areaFilter,
    duplicateIds,
    duplicateOnly,
    errorOnly,
    examDayFilter,
    externalIdQuery,
    formulaOnly,
    languageFilter,
    statusFilter,
    tableOnly,
    textQuery,
    topicFilter,
  ]);

  const safeIndex = Math.min(
    index,
    Math.max(filteredQuestions.length - 1, 0)
  );
  const current = filteredQuestions[safeIndex];
  const issues = current ? getQuestionIssues(current) : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Revisão — ENEM 2023 texto integral</Text>
      <Text style={styles.subtitle}>
        {filteredQuestions.length} de {allIngestionQuestions.length} questões |
        D1 staging: {enem2023Day1StagingQuestions.length} | D2 staging:{' '}
        {enem2023Day2StagingQuestions.length}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar externalId"
        placeholderTextColor={colors.text.muted}
        value={externalIdQuery}
        onChangeText={(value) => {
          setExternalIdQuery(value);
          setIndex(0);
        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Buscar texto"
        placeholderTextColor={colors.text.muted}
        value={textQuery}
        onChangeText={(value) => {
          setTextQuery(value);
          setIndex(0);
        }}
      />

      <FilterRow
        label="Dia"
        options={[
          ['all', 'Todos'],
          ['1', '1º dia'],
          ['2', '2º dia'],
        ]}
        value={examDayFilter}
        onChange={(value) => {
          setExamDayFilter(value as ExamDayFilter);
          setIndex(0);
        }}
      />
      <FilterRow
        label="Área"
        options={[
          ['all', 'Todas'],
          ['Linguagens', 'Linguagens'],
          ['Ciências Humanas', 'Humanas'],
          ['Ciências da Natureza', 'Natureza'],
          ['Matemática', 'Matemática'],
        ]}
        value={areaFilter}
        onChange={(value) => {
          setAreaFilter(value as AreaFilter);
          setIndex(0);
        }}
      />
      <FilterRow
        label="Tópico"
        options={topicOptions.map((topic) => [
          topic,
          topic === 'all' ? 'Todos' : topic,
        ] as [string, string])}
        value={topicFilter}
        onChange={(value) => {
          setTopicFilter(value);
          setIndex(0);
        }}
      />
      <FilterRow
        label="Idioma"
        options={[
          ['all', 'Todos'],
          ['english', 'Inglês'],
          ['spanish', 'Espanhol'],
          ['common', 'Comum'],
        ]}
        value={languageFilter}
        onChange={(value) => {
          setLanguageFilter(value as LanguageFilter);
          setIndex(0);
        }}
      />
      <FilterRow
        label="Status"
        options={[
          ['all', 'Todos'],
          ['verified', 'Verificadas'],
          ['staging', 'Staging'],
        ]}
        value={statusFilter}
        onChange={(value) => {
          setStatusFilter(value as StatusFilter);
          setIndex(0);
        }}
      />

      <View style={styles.toggleRow}>
        <ToggleChip
          label="Somente erros"
          active={errorOnly}
          onPress={() => setErrorOnly((value) => !value)}
        />
        <ToggleChip
          label="Somente duplicidade"
          active={duplicateOnly}
          onPress={() => setDuplicateOnly((value) => !value)}
        />
        <ToggleChip
          label="Com fórmula"
          active={formulaOnly}
          onPress={() => setFormulaOnly((value) => !value)}
        />
        <ToggleChip
          label="Com tabela"
          active={tableOnly}
          onPress={() => setTableOnly((value) => !value)}
        />
      </View>

      <View style={styles.navRow}>
        <Pressable
          style={styles.navButton}
          onPress={() => setIndex((value) => Math.max(value - 1, 0))}
        >
          <Text style={styles.navButtonText}>Anterior</Text>
        </Pressable>
        <Text style={styles.navCounter}>
          {filteredQuestions.length === 0 ? 0 : safeIndex + 1}/
          {filteredQuestions.length}
        </Text>
        <Pressable
          style={styles.navButton}
          onPress={() =>
            setIndex((value) =>
              Math.min(value + 1, Math.max(filteredQuestions.length - 1, 0))
            )
          }
        >
          <Text style={styles.navButtonText}>Próxima</Text>
        </Pressable>
      </View>

      {!current ? (
        <Text style={styles.empty}>Nenhuma questão encontrada.</Text>
      ) : (
        <View style={styles.card}>
          <Text style={styles.meta}>
            {String(current.externalId ?? current.id)} | dia {current.examDay} |{' '}
            {current.area} | {current.subject} | {current.topic} |{' '}
            {current.verified ? 'verificada' : 'staging'}
          </Text>

          {issues.length > 0 ? (
            <Text style={styles.issues}>Problemas: {issues.join(', ')}</Text>
          ) : (
            <Text style={styles.ok}>Sem problemas detectados.</Text>
          )}

          <QuestionContent question={current} />

          <Text style={styles.sectionTitle}>Alternativas</Text>
          {current.options.map((option) => (
            <Text
              key={option}
              style={
                option === current.correctAnswer
                  ? styles.correctOption
                  : styles.option
              }
            >
              {option}
            </Text>
          ))}

          <Text style={styles.sectionTitle}>Explicação editorial</Text>
          <Text style={styles.body}>{current.explanation}</Text>

          <Text style={styles.sectionTitle}>Metadados</Text>
          <Text style={styles.body}>
            {`source=${current.source}\nyear=${current.year}\nexamDay=${current.examDay}\nbooklet=${current.booklet}\nquestionNumber=${current.questionNumber}\nofficialStatus=${current.officialStatus ?? 'valid'}\neligibleForScoredSessions=${String(current.eligibleForScoredSessions ?? true)}\nlanguageTrack=${current.languageTrack ?? 'null'}\ntopic=${current.topic}\ndifficulty=${current.difficulty}\nsourceVerified=${String(current.sourceVerified)}\nhasFormula=${String(questionHasFormula(current))}\nhasTable=${String(questionHasTable(current))}\nexplanationOrigin=${current.explanationOrigin}\nfingerprint=${buildQuestionFingerprint(current).slice(0, 120)}…`}
          </Text>
        </View>
      )}
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
          <ToggleChip
            key={optionValue}
            label={optionLabel}
            active={value === optionValue}
            onPress={() => onChange(optionValue)}
          />
        ))}
      </View>
    </View>
  );
}

function ToggleChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, active ? styles.chipActive : null]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>
        {label}
      </Text>
    </Pressable>
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
  input: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    backgroundColor: colors.surface,
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
  toggleRow: {
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
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  navButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  navButtonText: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  navCounter: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  meta: {
    color: colors.text.secondary,
    fontSize: 13,
  },
  issues: {
    color: '#B45309',
    fontSize: 13,
    fontWeight: '600',
  },
  ok: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    color: colors.text.primary,
    fontSize: 14,
    lineHeight: 20,
  },
  option: {
    color: colors.text.primary,
    fontSize: 14,
    lineHeight: 20,
  },
  correctOption: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  empty: {
    color: colors.text.secondary,
    fontSize: 15,
  },
});
