import assert from 'node:assert/strict';

import {
  getOfficialQuestionsForSubject,
  getStableQuestionId,
  officialQuestionBank,
} from '../src/data/questionBank';
import {
  selectSmartQuestions,
  type QuestionPerformanceLike,
} from '../src/data/questionSelection';
import {
  getForeignLanguageLabel,
  getForeignLanguageSubject,
  isForeignLanguageSubject,
  normalizeForeignLanguagePreference,
  type ForeignLanguagePreference,
} from '../src/data/questionTypes';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed += 1;
    console.log(`OK   ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}`);
    console.error(`     ${(error as Error).message}`);
  }
}

const NOW = Date.UTC(2026, 5, 27);

/**
 * Reducer puro que reproduz a lógica do store de preferência, permitindo
 * testar salvar/trocar sem depender do AsyncStorage nativo.
 */
type PreferenceState = { foreignLanguage: ForeignLanguagePreference | null };

function setForeignLanguage(
  state: PreferenceState,
  value: unknown
): PreferenceState {
  return { foreignLanguage: normalizeForeignLanguagePreference(value) };
}

function selectLanguage(
  preference: ForeignLanguagePreference,
  requestedCount: number,
  performanceByQuestion?: Record<string, QuestionPerformanceLike>
) {
  return selectSmartQuestions({
    questions: officialQuestionBank,
    requestedCount,
    subject: getForeignLanguageSubject(preference),
    performanceByQuestion,
    shuffleSeed: 1,
    now: NOW,
  });
}

test('salvar Inglês', () => {
  const state = setForeignLanguage({ foreignLanguage: null }, 'english');
  assert.equal(state.foreignLanguage, 'english');
});

test('salvar Espanhol', () => {
  const state = setForeignLanguage({ foreignLanguage: null }, 'spanish');
  assert.equal(state.foreignLanguage, 'spanish');
});

test('trocar Inglês para Espanhol', () => {
  let state = setForeignLanguage({ foreignLanguage: null }, 'english');
  state = setForeignLanguage(state, 'spanish');
  assert.equal(state.foreignLanguage, 'spanish');
});

test('trocar Espanhol para Inglês', () => {
  let state = setForeignLanguage({ foreignLanguage: null }, 'spanish');
  state = setForeignLanguage(state, 'english');
  assert.equal(state.foreignLanguage, 'english');
});

test('preferência nula é o padrão e normaliza', () => {
  assert.equal(normalizeForeignLanguagePreference(null), null);
  assert.equal(normalizeForeignLanguagePreference(undefined), null);
});

test('migração de dados antigos não quebra', () => {
  // Valores legados inesperados viram null; válidos são preservados.
  assert.equal(normalizeForeignLanguagePreference('pt'), null);
  assert.equal(normalizeForeignLanguagePreference(123), null);
  assert.equal(normalizeForeignLanguagePreference('english'), 'english');
  assert.equal(normalizeForeignLanguagePreference('spanish'), 'spanish');
});

test('persistência: round-trip JSON preserva preferência', () => {
  const persisted = JSON.stringify({ foreignLanguage: 'spanish' });
  const parsed = JSON.parse(persisted) as PreferenceState;
  assert.equal(
    normalizeForeignLanguagePreference(parsed.foreignLanguage),
    'spanish'
  );
});

test('rótulo e matéria mapeiam corretamente', () => {
  assert.equal(getForeignLanguageSubject('english'), 'Inglês');
  assert.equal(getForeignLanguageSubject('spanish'), 'Espanhol');
  assert.equal(getForeignLanguageLabel('english'), 'Inglês');
  assert.equal(isForeignLanguageSubject('Inglês'), true);
  assert.equal(isForeignLanguageSubject('Espanhol'), true);
  assert.equal(isForeignLanguageSubject('Português'), false);
});

test('seleção somente em Inglês', () => {
  const result = selectLanguage('english', 4);
  assert.ok(result.questions.length > 0);
  assert.ok(result.questions.every((q) => q.subject === 'Inglês'));
});

test('seleção somente em Espanhol', () => {
  const result = selectLanguage('spanish', 4);
  assert.ok(result.questions.length > 0);
  assert.ok(result.questions.every((q) => q.subject === 'Espanhol'));
});

test('pedido acima da quantidade disponível retorna o real', () => {
  const english = selectLanguage('english', 5);
  const spanish = selectLanguage('spanish', 5);
  assert.equal(english.questions.length, 4);
  assert.equal(spanish.questions.length, 4);
});

test('ausência de duplicatas ao pedir mais que o disponível', () => {
  const english = selectLanguage('english', 10);
  assert.equal(
    new Set(english.questions.map(getStableQuestionId)).size,
    english.questions.length
  );
  assert.equal(english.diagnostics.repeatedIds.length, 0);
});

test('histórico separado: Inglês não afeta Espanhol', () => {
  const englishPool = getOfficialQuestionsForSubject('Inglês');
  const performance: Record<string, QuestionPerformanceLike> = {};
  englishPool.forEach((q) => {
    performance[getStableQuestionId(q)] = {
      stableQuestionId: getStableQuestionId(q),
      attempts: 3,
      correctAttempts: 0,
      incorrectAttempts: 3,
      lastAnsweredAt: new Date(NOW).toISOString(),
      lastResult: 'incorrect',
    };
  });

  const withHistory = selectLanguage('spanish', 4, performance);
  const baseline = selectLanguage('spanish', 4);

  assert.equal(
    withHistory.questions.map(getStableQuestionId).sort().join(','),
    baseline.questions.map(getStableQuestionId).sort().join(',')
  );
  assert.ok(withHistory.questions.every((q) => q.subject === 'Espanhol'));
});

test('Português não inclui idioma estrangeiro', () => {
  const portuguese = selectSmartQuestions({
    questions: officialQuestionBank,
    requestedCount: 15,
    subject: 'Português',
    shuffleSeed: 1,
    now: NOW,
  });
  assert.ok(
    portuguese.questions.every(
      (q) =>
        q.subject === 'Português' &&
        q.languageTrack !== 'english' &&
        q.languageTrack !== 'spanish'
    )
  );
});

console.log('');
if (failed > 0) {
  console.error(`Testes: ${passed} passaram, ${failed} falharam.`);
  process.exit(1);
}
console.log(`Testes: ${passed} passaram, 0 falharam.`);
