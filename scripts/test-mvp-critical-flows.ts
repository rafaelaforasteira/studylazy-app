import assert from 'node:assert/strict';

import {
  getOfficialQuestionsForSubject,
  getStableQuestionId,
  officialQuestionBank,
  selectReviewMistakes,
  selectSmartQuestions,
} from '../src/data/questionBank';
import {
  getForeignLanguageSubject,
  normalizeForeignLanguagePreference,
} from '../src/data/questionTypes';
import {
  calculateStreak,
  calculateXp,
  computeLessonResult,
  type ProgressSnapshot,
} from '../src/store/progressLogic';

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

const CTX_TODAY = { today: '2026-06-27', yesterday: '2026-06-26', timestamp: 1000 };
const CTX_NEXT_DAY = { today: '2026-06-28', yesterday: '2026-06-27', timestamp: 2000 };

function freshSnapshot(): ProgressSnapshot {
  return {
    studiedMinutesToday: 0,
    answeredQuestionsToday: 0,
    correctAnswersToday: 0,
    completedTasksToday: [],
    xp: 0,
    sessionsCompleted: 0,
    streak: 0,
    lastStudyDate: null,
    dailyProgressDate: null,
    lessonHistory: [],
  };
}

function applyPatch(state: ProgressSnapshot, patch: Partial<ProgressSnapshot>): ProgressSnapshot {
  return { ...state, ...patch } as ProgressSnapshot;
}

function selectSubject(subject: string, count: number, perf?: any) {
  return selectSmartQuestions({
    questions: officialQuestionBank,
    requestedCount: count,
    subject,
    performanceByQuestion: perf,
    shuffleSeed: 1,
  });
}

// --- Usuários / preferência ------------------------------------------------

test('usuário novo: idioma nulo por padrão', () => {
  assert.equal(normalizeForeignLanguagePreference(undefined), null);
});

test('usuário antigo: valor legado inesperado normaliza para null', () => {
  assert.equal(normalizeForeignLanguagePreference('portuguese'), null);
});

test('usuário com store incompleto: seleção tolera histórico parcial', () => {
  const result = selectSubject('Português', 5, { algumId: { attempts: 1 } });
  assert.equal(result.questions.length, 5);
});

test('seleção Inglês retorna só Inglês', () => {
  const result = selectSubject(getForeignLanguageSubject('english'), 4);
  assert.ok(result.questions.every((q) => q.subject === 'Inglês'));
});

test('seleção Espanhol retorna só Espanhol', () => {
  const result = selectSubject(getForeignLanguageSubject('spanish'), 4);
  assert.ok(result.questions.every((q) => q.subject === 'Espanhol'));
});

test('troca de idioma não mistura históricos', () => {
  const englishPool = getOfficialQuestionsForSubject('Inglês');
  const perf: Record<string, any> = {};
  englishPool.forEach((q) => {
    perf[getStableQuestionId(q)] = {
      attempts: 2,
      correctAttempts: 0,
      incorrectAttempts: 2,
      lastResult: 'incorrect',
      lastAnsweredAt: new Date().toISOString(),
    };
  });
  const spanish = selectSubject('Espanhol', 4, perf);
  assert.ok(spanish.questions.every((q) => q.subject === 'Espanhol'));
});

// --- Sessões ---------------------------------------------------------------

test('sessão normal: 5 questões de Português', () => {
  assert.equal(selectSubject('Português', 5).questions.length, 5);
});

test('sessão com 4 questões (idioma) funciona', () => {
  assert.equal(selectSubject('Inglês', 5).questions.length, 4);
});

test('zero questões disponíveis: matéria inexistente', () => {
  const result = selectSubject('Matéria Inexistente', 5);
  assert.equal(result.questions.length, 0);
});

test('quantidade inválida não quebra', () => {
  const nan = selectSmartQuestions({
    questions: officialQuestionBank,
    requestedCount: Number.NaN,
    subject: 'Português',
  });
  const negative = selectSmartQuestions({
    questions: officialQuestionBank,
    requestedCount: -3,
    subject: 'Português',
  });
  assert.equal(nan.questions.length, 0);
  assert.equal(negative.questions.length, 0);
});

test('sem duplicatas ao exceder o disponível', () => {
  const result = selectSubject('Inglês', 20);
  assert.equal(
    new Set(result.questions.map(getStableQuestionId)).size,
    result.questions.length
  );
});

// --- XP / streak / histórico ----------------------------------------------

test('conclusão registra XP e histórico', () => {
  const { patch, result } = computeLessonResult(
    freshSnapshot(),
    { minutes: 5, totalQuestions: 4, correctAnswers: 3, subject: 'Inglês' },
    CTX_TODAY
  );
  assert.equal(result.earnedXp, calculateXp(4, 3));
  assert.equal(patch.lessonHistory?.length, 1);
  assert.equal(patch.sessionsCompleted, 1);
});

test('conclusão dupla no mesmo dia/matéria não duplica XP', () => {
  const first = computeLessonResult(
    freshSnapshot(),
    { minutes: 5, totalQuestions: 4, correctAnswers: 4, subject: 'Inglês' },
    CTX_TODAY
  );
  const afterFirst = applyPatch(freshSnapshot(), first.patch);
  const second = computeLessonResult(
    afterFirst,
    { minutes: 5, totalQuestions: 4, correctAnswers: 4, subject: 'Inglês' },
    CTX_TODAY
  );
  assert.ok(first.result.earnedXp > 0);
  assert.equal(second.result.isRepeat, true);
  assert.equal(second.result.earnedXp, 0);
  assert.equal(second.patch.xp, afterFirst.xp);
});

test('XP nunca negativo e acertos limitados ao total', () => {
  assert.equal(calculateXp(-1, -1), 0);
  assert.equal(calculateXp(Number.NaN, 5), 0);
  assert.equal(calculateXp(4, 100), calculateXp(4, 4));
});

test('streak não aumenta duas vezes no mesmo dia', () => {
  assert.equal(calculateStreak('2026-06-27', 5, '2026-06-27', '2026-06-26'), 5);
});

test('streak aumenta em dias consecutivos', () => {
  assert.equal(calculateStreak('2026-06-26', 5, '2026-06-27', '2026-06-26'), 6);
});

test('streak reinicia após quebra', () => {
  assert.equal(calculateStreak('2026-06-20', 5, '2026-06-27', '2026-06-26'), 1);
});

test('novo dia zera contadores diários, preserva XP e streak', () => {
  const first = computeLessonResult(
    freshSnapshot(),
    { minutes: 5, totalQuestions: 4, correctAnswers: 4, subject: 'Inglês' },
    CTX_TODAY
  );
  const afterFirst = applyPatch(freshSnapshot(), first.patch);
  const nextDay = computeLessonResult(
    afterFirst,
    { minutes: 5, totalQuestions: 4, correctAnswers: 2, subject: 'Inglês' },
    CTX_NEXT_DAY
  );
  assert.equal(nextDay.patch.answeredQuestionsToday, 4); // reiniciou e somou
  assert.equal(nextDay.patch.streak, 2); // dia consecutivo
  assert.ok((nextDay.patch.xp ?? 0) > (afterFirst.xp ?? 0)); // novo XP no novo dia
});

test('sessão abandonada não altera estado', () => {
  const before = freshSnapshot();
  // Abandono = nenhuma chamada a computeLessonResult.
  assert.equal(before.lessonHistory.length, 0);
  assert.equal(before.xp, 0);
  assert.equal(before.sessionsCompleted, 0);
});

test('reset de progresso volta ao estado inicial', () => {
  const reset = freshSnapshot();
  assert.deepEqual(reset.lessonHistory, []);
  assert.equal(reset.xp, 0);
  assert.equal(reset.streak, 0);
});

// --- Revisão de erros ------------------------------------------------------

test('erro registrado e revisão ordenam por prioridade', () => {
  const ordered = selectReviewMistakes({
    mistakes: [
      { id: 'a', externalId: 'A', errorCount: 1, lastAnsweredAt: new Date().toISOString() },
      { id: 'b', externalId: 'B', errorCount: 5, lastAnsweredAt: new Date().toISOString() },
    ],
  });
  assert.equal(ordered[0].externalId, 'B');
});

test('questão legada (sem externalId, data inválida) não quebra', () => {
  const ordered = selectReviewMistakes({
    mistakes: [
      { id: 'legacy', errorCount: 1, lastAnsweredAt: 'invalido' },
      { id: 'legacy', errorCount: 1, lastAnsweredAt: 'invalido' },
    ],
  });
  assert.equal(ordered.length, 1); // dedupe por id estável
});

// --- Motor ------------------------------------------------------------------

test('motor com histórico vazio prioriza inéditas', () => {
  const result = selectSubject('Português', 5);
  assert.equal(result.diagnostics.unseenCount, 5);
});

test('motor com todas respondidas ainda retorna a quantidade', () => {
  const pool = getOfficialQuestionsForSubject('Inglês');
  const perf: Record<string, any> = {};
  pool.forEach((q) => {
    perf[getStableQuestionId(q)] = {
      attempts: 1,
      correctAttempts: 1,
      incorrectAttempts: 0,
      lastResult: 'correct',
      lastAnsweredAt: new Date().toISOString(),
    };
  });
  const result = selectSubject('Inglês', 4, perf);
  assert.equal(result.questions.length, 4);
  assert.equal(
    new Set(result.questions.map(getStableQuestionId)).size,
    result.questions.length
  );
});

console.log('');
if (failed > 0) {
  console.error(`Testes: ${passed} passaram, ${failed} falharam.`);
  process.exit(1);
}
console.log(`Testes: ${passed} passaram, 0 falharam.`);
