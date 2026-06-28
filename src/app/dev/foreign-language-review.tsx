import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import {
  getOfficialQuestionsForSubject,
  getStableQuestionId,
  officialQuestionBank,
} from '../../data/questionBank';
import { selectSmartQuestions } from '../../data/questionSelection';
import {
  getForeignLanguageSubject,
  type ForeignLanguagePreference,
} from '../../data/questionTypes';
import { useProfileStore } from '../../store/profileStore';

type ScenarioPreference = ForeignLanguagePreference | 'null' | 'legacy';

const REQUESTED = 5;

export default function ForeignLanguageReviewScreen() {
  if (!__DEV__) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>
          Tela disponível apenas em desenvolvimento.
        </Text>
      </View>
    );
  }

  return <ForeignLanguageReviewContent />;
}

function ForeignLanguageReviewContent() {
  const storedPreference = useProfileStore((state) => state.foreignLanguage);
  const setForeignLanguage = useProfileStore(
    (state) => state.setForeignLanguage
  );

  // Cenário de teste local (não altera o store, exceto nos botões de persistência).
  const [scenario, setScenario] = useState<ScenarioPreference>(
    storedPreference ?? 'null'
  );

  const englishPool = getOfficialQuestionsForSubject('Inglês');
  const spanishPool = getOfficialQuestionsForSubject('Espanhol');
  const portuguesePool = getOfficialQuestionsForSubject('Português');

  const effectivePreference: ForeignLanguagePreference | null =
    scenario === 'english' || scenario === 'spanish' ? scenario : null;

  const session = useMemo(() => {
    if (!effectivePreference) {
      return null;
    }

    return selectSmartQuestions({
      questions: officialQuestionBank,
      requestedCount: REQUESTED,
      subject: getForeignLanguageSubject(effectivePreference),
      shuffleSeed: 1,
    });
  }, [effectivePreference]);

  const selectedSubjects = session
    ? Array.from(new Set(session.questions.map((q) => q.subject ?? '—')))
    : [];

  const hasNoMix = session
    ? selectedSubjects.length === 1 &&
      selectedSubjects[0] ===
        getForeignLanguageSubject(effectivePreference as ForeignLanguagePreference)
    : true;

  const portugueseHasForeign = portuguesePool.some(
    (q) => q.languageTrack === 'english' || q.languageTrack === 'spanish'
  );

  const noDuplicates = session
    ? new Set(session.questions.map(getStableQuestionId)).size ===
      session.questions.length
    : true;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Revisão — Língua Estrangeira</Text>
      <Text style={styles.subtitle}>
        Preferência persistida: {storedPreference ?? 'null (sem escolha)'}
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Persistência (store real)</Text>
        <View style={styles.chipRow}>
          <Pressable
            style={styles.chip}
            onPress={() => setForeignLanguage('english')}
          >
            <Text style={styles.chipText}>Salvar Inglês</Text>
          </Pressable>
          <Pressable
            style={styles.chip}
            onPress={() => setForeignLanguage('spanish')}
          >
            <Text style={styles.chipText}>Salvar Espanhol</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Cenário de seleção</Text>
        <View style={styles.chipRow}>
          {(['english', 'spanish', 'null', 'legacy'] as ScenarioPreference[]).map(
            (value) => (
              <Pressable
                key={value}
                style={[
                  styles.chip,
                  scenario === value ? styles.chipActive : null,
                ]}
                onPress={() => setScenario(value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    scenario === value ? styles.chipTextActive : null,
                  ]}
                >
                  {value}
                </Text>
              </Pressable>
            )
          )}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Quantidade disponível</Text>
        <Text style={styles.body}>Inglês: {englishPool.length}</Text>
        <Text style={styles.body}>Espanhol: {spanishPool.length}</Text>
        <Text style={styles.body}>
          Pedido de {REQUESTED} →{' '}
          {session ? session.questions.length : '—'} reais (sem duplicar)
        </Text>
      </View>

      {!effectivePreference ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {scenario === 'legacy'
              ? 'Usuário legado (preferência null)'
              : 'Preferência null'}
          </Text>
          <Text style={styles.body}>
            Nenhuma sessão de idioma é criada automaticamente. O app pede a
            escolha apenas ao iniciar uma sessão de língua estrangeira.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Diagnóstico do motor</Text>
            <Text style={styles.body}>
              {`elegíveis=${session?.diagnostics.eligibleCount}\nselecionadas=${session?.diagnostics.selectedCount}\ninéditas=${session?.diagnostics.unseenCount}\nduplicatas=${session?.diagnostics.repeatedIds.length}`}
            </Text>
            <Text
              style={[
                styles.badge,
                hasNoMix ? styles.badgeOk : styles.badgeError,
              ]}
            >
              {hasNoMix
                ? 'Sem mistura de idiomas: OK'
                : 'FALHA: mistura detectada'}
            </Text>
            <Text
              style={[
                styles.badge,
                noDuplicates ? styles.badgeOk : styles.badgeError,
              ]}
            >
              {noDuplicates ? 'Sem duplicatas: OK' : 'FALHA: duplicatas'}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Questões selecionadas ({session?.questions.length})
            </Text>
            {session?.questions.map((question, index) => (
              <Text key={getStableQuestionId(question)} style={styles.body}>
                {index + 1}. {getStableQuestionId(question)} | {question.subject}{' '}
                | {question.languageTrack}
              </Text>
            ))}
          </View>
        </>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Português isolado</Text>
        <Text
          style={[
            styles.badge,
            portugueseHasForeign ? styles.badgeError : styles.badgeOk,
          ]}
        >
          {portugueseHasForeign
            ? 'FALHA: Português contém idioma estrangeiro'
            : 'Português não inclui Inglês/Espanhol: OK'}
        </Text>
      </View>
    </ScrollView>
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
  body: {
    color: colors.text.primary,
    fontSize: 13,
    lineHeight: 19,
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
