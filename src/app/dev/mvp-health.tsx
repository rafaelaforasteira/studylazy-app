import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { ROUTES } from '../../constants/routes';

import {
  getQuestionBankStats,
  getStableQuestionId,
  officialQuestionBank,
} from '../../data/questionBank';
import { selectSmartQuestions } from '../../data/questionSelection';
import { getForeignLanguageSubject } from '../../data/questionTypes';

import { useMistakeStore } from '../../store/mistakeStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useProfileStore } from '../../store/profileStore';
import { useQuestionReportStore } from '../../store/questionReportStore';
import { useStudyProgressStore } from '../../store/studyProgressStore';

type CheckResult = { label: string; ok: boolean; detail?: string };

const PERSISTED_STORES = [
  { name: 'onboarding', store: useOnboardingStore },
  { name: 'profile', store: useProfileStore },
  { name: 'progress', store: useStudyProgressStore },
  { name: 'mistakes', store: useMistakeStore },
  { name: 'reports', store: useQuestionReportStore },
] as const;

export default function MvpHealthScreen() {
  if (!__DEV__) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>
          Tela disponível apenas em desenvolvimento.
        </Text>
      </View>
    );
  }

  return <MvpHealthContent />;
}

function runSelectionChecks(): CheckResult[] {
  const stats = getQuestionBankStats();
  const results: CheckResult[] = [];

  results.push({
    label: '149 questões oficiais',
    ok: stats.totalOfficialQuestions === 149,
    detail: String(stats.totalOfficialQuestions),
  });
  results.push({
    label: 'Zero demos em produção',
    ok: stats.totalDemoInProduction === 0,
  });
  results.push({
    label: 'Q177 anulada fora do banco',
    ok: !officialQuestionBank.some(
      (q) => q.externalId === 'ENEM-2023-D2-C5-Q177'
    ),
  });
  results.push({
    label: 'Inglês = 4',
    ok: stats.officialBySubject.Inglês === 4,
  });
  results.push({
    label: 'Espanhol = 4',
    ok: stats.officialBySubject.Espanhol === 4,
  });

  (['english', 'spanish'] as const).forEach((pref) => {
    const subject = getForeignLanguageSubject(pref);
    const { questions } = selectSmartQuestions({
      questions: officialQuestionBank,
      requestedCount: 5,
      subject,
      shuffleSeed: 1,
    });
    const unique = new Set(questions.map(getStableQuestionId)).size;
    results.push({
      label: `Sessão ${subject}: 4 reais, sem duplicar`,
      ok: questions.length === 4 && unique === 4,
      detail: `${questions.length} questões`,
    });
    results.push({
      label: `Sessão ${subject}: só ${subject}`,
      ok: questions.every((q) => q.subject === subject),
    });
  });

  const portuguese = selectSmartQuestions({
    questions: officialQuestionBank,
    requestedCount: 5,
    subject: 'Português',
    shuffleSeed: 1,
  });
  results.push({
    label: 'Português sem idiomas estrangeiros',
    ok: portuguese.questions.every(
      (q) => q.languageTrack !== 'english' && q.languageTrack !== 'spanish'
    ),
  });

  // Entradas inválidas não quebram o motor.
  const invalid = selectSmartQuestions({
    questions: officialQuestionBank,
    requestedCount: Number.NaN,
    subject: 'Português',
  });
  results.push({
    label: 'Quantidade inválida tratada com segurança',
    ok: invalid.questions.length === 0,
  });

  return results;
}

function MvpHealthContent() {
  const onboarding = useOnboardingStore();
  const foreignLanguage = useProfileStore((state) => state.foreignLanguage);
  const xp = useStudyProgressStore((state) => state.xp);
  const streak = useStudyProgressStore((state) => state.streak);
  const sessionsCompleted = useStudyProgressStore(
    (state) => state.sessionsCompleted
  );
  const answeredQuestionsToday = useStudyProgressStore(
    (state) => state.answeredQuestionsToday
  );
  const lessonHistory = useStudyProgressStore((state) => state.lessonHistory);
  const questionPerformance = useStudyProgressStore(
    (state) => state.questionPerformance
  );
  const recentQuestionIds = useStudyProgressStore(
    (state) => state.recentQuestionIds
  );
  const mistakes = useMistakeStore((state) => state.mistakes);

  const [checks, setChecks] = useState<CheckResult[] | null>(null);

  const stats = useMemo(() => getQuestionBankStats(), []);

  const hydration = PERSISTED_STORES.map((entry) => ({
    name: entry.name,
    hydrated: entry.store.persist.hasHydrated(),
  }));

  const routeChecks = useMemo(
    () =>
      Object.entries(ROUTES).map(([key, value]) => ({
        label: key,
        ok: typeof value === 'string' && value.length > 0,
        detail: String(value),
      })),
    []
  );

  const answeredCount = Object.keys(questionPerformance ?? {}).length;

  function buildDiagnostic() {
    const lines: string[] = [];
    lines.push('StudyLazy MVP Health');
    lines.push('--- Hidratação ---');
    hydration.forEach((h) => lines.push(`${h.name}: ${h.hydrated ? 'ok' : 'pendente'}`));
    lines.push('--- Estado ---');
    lines.push(`onboardingConcluido: ${onboarding.hasCompletedOnboarding}`);
    lines.push(`idioma: ${foreignLanguage ?? 'null'}`);
    lines.push(`xp: ${xp}`);
    lines.push(`streak: ${streak}`);
    lines.push(`sessoes: ${sessionsCompleted}`);
    lines.push(`respondidasHoje: ${answeredQuestionsToday}`);
    lines.push(`historico: ${lessonHistory?.length ?? 0}`);
    lines.push(`questoesRespondidas: ${answeredCount}`);
    lines.push(`errosPendentes: ${mistakes.length}`);
    lines.push(`idsRecentes: ${recentQuestionIds?.length ?? 0}`);
    lines.push('--- Banco ---');
    lines.push(`oficiais: ${stats.totalOfficialQuestions}`);
    Object.entries(stats.officialBySubject).forEach(([subject, count]) =>
      lines.push(`${subject}: ${count}`)
    );
    const results = checks ?? runSelectionChecks();
    lines.push('--- Verificações ---');
    results.forEach((r) =>
      lines.push(`${r.ok ? 'OK' : 'FALHA'} ${r.label}${r.detail ? ` (${r.detail})` : ''}`)
    );
    return lines.join('\n');
  }

  async function handleCopy() {
    const text = buildDiagnostic();

    const clipboard = (globalThis as any)?.navigator?.clipboard;
    if (clipboard?.writeText) {
      try {
        await clipboard.writeText(text);
        Alert.alert('Diagnóstico copiado', 'Texto copiado para a área de transferência.');
        return;
      } catch {
        // cai no fallback
      }
    }

    Alert.alert(
      'Diagnóstico',
      'Copie manualmente o texto exibido abaixo na seção de diagnóstico.'
    );
  }

  const detectedProblems = useMemo(() => {
    const problems: string[] = [];
    if (stats.totalOfficialQuestions !== 149) {
      problems.push('Total de questões oficiais diferente de 149.');
    }
    if (stats.totalDemoInProduction !== 0) {
      problems.push('Há questões demo em produção.');
    }
    hydration
      .filter((h) => !h.hydrated)
      .forEach((h) => problems.push(`Store "${h.name}" não hidratado.`));
    (checks ?? [])
      .filter((c) => !c.ok)
      .forEach((c) => problems.push(`Verificação falhou: ${c.label}.`));
    return problems;
  }, [stats, hydration, checks]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Saúde do MVP</Text>

      <Section title="Hidratação dos stores">
        {hydration.map((h) => (
          <Row key={h.name} label={h.name} value={h.hydrated ? 'ok' : 'pendente'} ok={h.hydrated} />
        ))}
      </Section>

      <Section title="Estado do usuário">
        <Row label="Onboarding concluído" value={String(onboarding.hasCompletedOnboarding)} />
        <Row label="Idioma" value={foreignLanguage ?? 'null'} />
        <Row label="XP" value={String(xp)} />
        <Row label="Streak" value={String(streak)} />
        <Row label="Sessões" value={String(sessionsCompleted)} />
        <Row label="Histórico" value={String(lessonHistory?.length ?? 0)} />
        <Row label="Questões respondidas" value={String(answeredCount)} />
        <Row label="Erros pendentes" value={String(mistakes.length)} />
        <Row label="IDs recentes" value={String(recentQuestionIds?.length ?? 0)} />
      </Section>

      <Section title="Banco oficial">
        <Row label="Total oficial" value={String(stats.totalOfficialQuestions)} ok={stats.totalOfficialQuestions === 149} />
        <Row label="Demos" value={String(stats.totalDemoInProduction)} ok={stats.totalDemoInProduction === 0} />
        {Object.entries(stats.officialBySubject).map(([subject, count]) => (
          <Row key={subject} label={subject} value={String(count)} />
        ))}
      </Section>

      <Section title="Rotas críticas">
        {routeChecks.map((r) => (
          <Row key={r.label} label={r.label} value={r.detail} ok={r.ok} />
        ))}
      </Section>

      <Section title="Verificações de seleção">
        {checks ? (
          checks.map((c) => (
            <Row key={c.label} label={c.label} value={c.ok ? 'OK' : 'FALHA'} ok={c.ok} />
          ))
        ) : (
          <Text style={styles.muted}>Toque em “Executar verificações”.</Text>
        )}
      </Section>

      {detectedProblems.length > 0 ? (
        <Section title="Problemas detectados">
          {detectedProblems.map((p, index) => (
            <Text key={index} style={styles.problem}>
              • {p}
            </Text>
          ))}
        </Section>
      ) : (
        <Section title="Problemas detectados">
          <Text style={styles.ok}>Nenhum problema detectado.</Text>
        </Section>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Executar verificações locais"
        style={styles.button}
        onPress={() => setChecks(runSelectionChecks())}
      >
        <Text style={styles.buttonText}>Executar verificações</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Copiar diagnóstico"
        style={[styles.button, styles.buttonSecondary]}
        onPress={handleCopy}
      >
        <Text style={styles.buttonText}>Copiar diagnóstico</Text>
      </Pressable>

      <Section title="Diagnóstico (texto)">
        <Text selectable style={styles.diagnostic}>
          {buildDiagnostic()}
        </Text>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        style={[
          styles.rowValue,
          ok === true ? styles.valueOk : null,
          ok === false ? styles.valueError : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  blocked: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  blockedText: { color: colors.text.secondary, fontSize: 16 },
  title: { color: colors.text.primary, fontSize: 22, fontWeight: '700' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.xs,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: 2,
  },
  rowLabel: { color: colors.text.secondary, fontSize: 13, flexShrink: 1 },
  rowValue: { color: colors.text.primary, fontSize: 13, fontWeight: '600' },
  valueOk: { color: '#15803D' },
  valueError: { color: '#B45309' },
  muted: { color: colors.text.secondary, fontSize: 13 },
  ok: { color: '#15803D', fontSize: 13 },
  problem: { color: '#B45309', fontSize: 13, lineHeight: 19 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonSecondary: { backgroundColor: colors.surfaceSecondary },
  buttonText: { color: colors.text.primary, fontSize: 15, fontWeight: '700' },
  diagnostic: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
  },
});
