import assert from 'node:assert/strict';

import {
  selectSmartQuestions,
  selectReviewMistakes,
  type QuestionPerformanceLike,
} from '../src/data/questionSelection';
import {
  getStableQuestionId,
  type Question,
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

const NOW = Date.UTC(2026, 5, 25);
const DAY = 86_400_000;

function makeQuestion(overrides: Partial<Question> & { externalId: string }): Question {
  return {
    id: overrides.externalId,
    externalId: overrides.externalId,
    originType: 'official_exam',
    sourceVerified: true,
    officialStatus: 'valid',
    eligibleForScoredSessions: true,
    verified: true,
    source: 'TEST',
    year: 2023,
    subject: 'Matemática',
    topic: 'Aritmética',
    question: `Enunciado ${overrides.externalId}`,
    prompt: `Enunciado ${overrides.externalId}`,
    options: ['A) 1', 'B) 2', 'C) 3', 'D) 4', 'E) 5'],
    correctAnswer: 'A) 1',
    requiresImage: false,
    requiresMedia: false,
    ...overrides,
  };
}

function makePool(count: number, topic = 'Aritmética') {
  return Array.from({ length: count }, (_, index) =>
    makeQuestion({ externalId: `Q${topic}-${index + 1}`, topic })
  );
}

const seededRandom = () => 0.5;

test('zero questões retorna lista vazia', () => {
  const result = selectSmartQuestions({
    questions: [],
    requestedCount: 5,
    now: NOW,
    random: seededRandom,
  });
  assert.equal(result.questions.length, 0);
  assert.equal(result.diagnostics.eligibleCount, 0);
});

test('uma questão retorna uma', () => {
  const result = selectSmartQuestions({
    questions: makePool(1),
    requestedCount: 5,
    now: NOW,
    shuffleSeed: 1,
  });
  assert.equal(result.questions.length, 1);
});

test('pedido maior que o banco retorna o disponível', () => {
  const result = selectSmartQuestions({
    questions: makePool(4),
    requestedCount: 10,
    now: NOW,
    shuffleSeed: 1,
  });
  assert.equal(result.questions.length, 4);
});

test('IDs duplicados na entrada são deduplicados', () => {
  const pool = makePool(3);
  const withDuplicates = [...pool, ...pool];
  const result = selectSmartQuestions({
    questions: withDuplicates,
    requestedCount: 10,
    now: NOW,
    shuffleSeed: 1,
  });
  assert.equal(result.questions.length, 3);
  assert.equal(
    new Set(result.questions.map(getStableQuestionId)).size,
    result.questions.length
  );
  assert.equal(result.diagnostics.repeatedIds.length, 0);
});

test('todas inéditas: diagnóstico de inéditas igual ao total', () => {
  const result = selectSmartQuestions({
    questions: makePool(10),
    requestedCount: 5,
    now: NOW,
    shuffleSeed: 1,
  });
  assert.equal(result.diagnostics.unseenCount, 5);
});

test('todas respondidas corretamente ainda preenche a sessão', () => {
  const pool = makePool(10);
  const performanceByQuestion: Record<string, QuestionPerformanceLike> = {};
  pool.forEach((q, i) => {
    performanceByQuestion[getStableQuestionId(q)] = {
      stableQuestionId: getStableQuestionId(q),
      attempts: 1,
      correctAttempts: 1,
      incorrectAttempts: 0,
      lastAnsweredAt: new Date(NOW - (i + 1) * DAY).toISOString(),
      lastResult: 'correct',
    };
  });
  const result = selectSmartQuestions({
    questions: pool,
    requestedCount: 5,
    performanceByQuestion,
    now: NOW,
    shuffleSeed: 1,
  });
  assert.equal(result.questions.length, 5);
});

test('todas recentes ainda preenchem quando não há alternativa', () => {
  const pool = makePool(5);
  const recentQuestionIds = pool.map(getStableQuestionId);
  const result = selectSmartQuestions({
    questions: pool,
    requestedCount: 5,
    recentQuestionIds,
    now: NOW,
    shuffleSeed: 1,
  });
  assert.equal(result.questions.length, 5);
});

test('inéditas priorizadas sobre respondidas', () => {
  const pool = makePool(10);
  const performanceByQuestion: Record<string, QuestionPerformanceLike> = {};
  pool.slice(0, 5).forEach((q, i) => {
    performanceByQuestion[getStableQuestionId(q)] = {
      stableQuestionId: getStableQuestionId(q),
      attempts: 1,
      correctAttempts: 1,
      incorrectAttempts: 0,
      lastAnsweredAt: new Date(NOW - (i + 1) * DAY).toISOString(),
      lastResult: 'correct',
    };
  });
  const result = selectSmartQuestions({
    questions: pool,
    requestedCount: 5,
    performanceByQuestion,
    now: NOW,
    shuffleSeed: 2,
  });
  assert.equal(result.diagnostics.unseenCount, 5);
});

test('recentes evitadas quando há alternativas', () => {
  const pool = makePool(10);
  const recentQuestionIds = pool.slice(0, 5).map(getStableQuestionId);
  const performanceByQuestion: Record<string, QuestionPerformanceLike> = {};
  pool.slice(0, 5).forEach((q, i) => {
    performanceByQuestion[getStableQuestionId(q)] = {
      stableQuestionId: getStableQuestionId(q),
      attempts: 1,
      correctAttempts: 1,
      incorrectAttempts: 0,
      lastAnsweredAt: new Date(NOW - (i + 1) * DAY).toISOString(),
      lastResult: 'correct',
    };
  });
  const result = selectSmartQuestions({
    questions: pool,
    requestedCount: 5,
    performanceByQuestion,
    recentQuestionIds,
    now: NOW,
    shuffleSeed: 3,
  });
  const selectedRecent = result.questions.filter((q) =>
    recentQuestionIds.includes(getStableQuestionId(q))
  );
  assert.equal(selectedRecent.length, 0);
  assert.ok(result.diagnostics.recentCountAvoided > 0);
});

test('mistura de acertos e erros prioriza erros entre as respondidas', () => {
  const pool = makePool(10);
  const performanceByQuestion: Record<string, QuestionPerformanceLike> = {};
  pool.forEach((q, i) => {
    const isError = i < 3;
    performanceByQuestion[getStableQuestionId(q)] = {
      stableQuestionId: getStableQuestionId(q),
      attempts: 1,
      correctAttempts: isError ? 0 : 1,
      incorrectAttempts: isError ? 1 : 0,
      lastAnsweredAt: new Date(NOW - (i + 1) * DAY).toISOString(),
      lastResult: isError ? 'incorrect' : 'correct',
    };
  });
  const result = selectSmartQuestions({
    questions: pool,
    requestedCount: 3,
    performanceByQuestion,
    now: NOW,
    shuffleSeed: 4,
  });
  assert.equal(result.diagnostics.incorrectCount, 3);
});

test('tópico específico respeitado', () => {
  const pool = [...makePool(5, 'Aritmética'), ...makePool(5, 'Geometria')];
  const result = selectSmartQuestions({
    questions: pool,
    requestedCount: 10,
    topic: 'Geometria',
    now: NOW,
    shuffleSeed: 1,
  });
  assert.ok(result.questions.length > 0);
  assert.ok(result.questions.every((q) => q.topic === 'Geometria'));
});

test('múltiplos tópicos: equilíbrio evita concentração total', () => {
  const pool = [
    ...makePool(20, 'Aritmética'),
    ...makePool(20, 'Geometria'),
    ...makePool(20, 'Funções'),
  ];
  const result = selectSmartQuestions({
    questions: pool,
    requestedCount: 10,
    now: NOW,
    shuffleSeed: 1,
  });
  const counts = new Map<string, number>();
  result.questions.forEach((q) => {
    const key = q.topic ?? '—';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  const maxShare = Math.max(...counts.values()) / result.questions.length;
  assert.ok(maxShare <= 0.4 + 1e-9, `share ${maxShare} excedeu 40%`);
});

test('seed determinística reproduz a seleção', () => {
  const pool = makePool(20);
  const a = selectSmartQuestions({
    questions: pool,
    requestedCount: 8,
    now: NOW,
    shuffleSeed: 99,
  });
  const b = selectSmartQuestions({
    questions: pool,
    requestedCount: 8,
    now: NOW,
    shuffleSeed: 99,
  });
  assert.equal(
    a.questions.map(getStableQuestionId).join(','),
    b.questions.map(getStableQuestionId).join(',')
  );
});

test('ausência de histórico funciona', () => {
  const result = selectSmartQuestions({
    questions: makePool(10),
    requestedCount: 5,
    now: NOW,
    shuffleSeed: 1,
  });
  assert.equal(result.questions.length, 5);
});

test('histórico legado incompleto não quebra', () => {
  const pool = makePool(10);
  const performanceByQuestion: Record<string, QuestionPerformanceLike> = {
    [getStableQuestionId(pool[0])]: {
      stableQuestionId: getStableQuestionId(pool[0]),
    },
  };
  const result = selectSmartQuestions({
    questions: pool,
    requestedCount: 5,
    performanceByQuestion,
    now: NOW,
    shuffleSeed: 1,
  });
  assert.equal(result.questions.length, 5);
});

test('não inclui questões não oficiais', () => {
  const pool = [
    ...makePool(3),
    makeQuestion({ externalId: 'DEMO-1', originType: 'demo' }),
    makeQuestion({ externalId: 'UNVERIFIED-1', verified: false }),
    makeQuestion({ externalId: 'ANNULLED-1', officialStatus: 'annulled' }),
    makeQuestion({ externalId: 'MEDIA-1', requiresMedia: true }),
  ];
  const result = selectSmartQuestions({
    questions: pool,
    requestedCount: 10,
    now: NOW,
    shuffleSeed: 1,
  });
  assert.equal(result.questions.length, 3);
  assert.ok(
    result.questions.every((q) => q.externalId?.startsWith('QAritmética'))
  );
});

test('revisão prioriza maior errorCount e deduplica', () => {
  const ordered = selectReviewMistakes({
    mistakes: [
      { id: 'm1', externalId: 'A', errorCount: 1, lastAnsweredAt: '2026-01-01T00:00:00.000Z' },
      { id: 'm2', externalId: 'B', errorCount: 5, lastAnsweredAt: '2026-01-02T00:00:00.000Z' },
      { id: 'm3', externalId: 'A', errorCount: 9, lastAnsweredAt: '2026-01-03T00:00:00.000Z' },
    ],
    shuffleSeed: 1,
  });
  assert.equal(ordered.length, 2);
  assert.equal(ordered[0].externalId, 'B');
});

console.log('');
if (failed > 0) {
  console.error(`Testes: ${passed} passaram, ${failed} falharam.`);
  process.exit(1);
}
console.log(`Testes: ${passed} passaram, 0 falharam.`);
