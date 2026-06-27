import {
  getOfficialQuestionsForSubject,
  getQuestionBankStats,
  getStableQuestionId,
  officialQuestionBank,
} from '../src/data/questionBank';
import {
  selectSmartQuestions,
  type QuestionPerformanceLike,
} from '../src/data/questionSelection';
import {
  isOfficialVerifiedQuestion,
  type Question,
} from '../src/data/questionTypes';

let failures = 0;

function check(label: string, condition: boolean) {
  if (condition) {
    console.log(`OK   ${label}`);
  } else {
    console.error(`FALHA ${label}`);
    failures += 1;
  }
}

const NOW = Date.UTC(2026, 5, 25);
const DAY = 86_400_000;

function uniqueIds(questions: Question[]) {
  return new Set(questions.map(getStableQuestionId));
}

function buildAllCorrect(pool: Question[]): Record<string, QuestionPerformanceLike> {
  const map: Record<string, QuestionPerformanceLike> = {};
  pool.forEach((question, index) => {
    const id = getStableQuestionId(question);
    map[id] = {
      stableQuestionId: id,
      attempts: 1,
      correctAttempts: 1,
      incorrectAttempts: 0,
      lastAnsweredAt: new Date(NOW - (index + 1) * DAY).toISOString(),
      lastResult: 'correct',
    };
  });
  return map;
}

console.log('=== Auditoria do Motor de Seleção Inteligente ===\n');

// 1. Banco continua com 149 questões oficiais.
const stats = getQuestionBankStats();
check('1. Banco com 149 questões oficiais', stats.totalOfficialQuestions === 149);

// 2. Nenhuma demo em produção.
check(
  '2. Nenhuma demo em produção',
  officialQuestionBank.every((q) => q.originType === 'official_exam')
);

// 3. Nenhuma anulada em sessões.
check(
  '3. Nenhuma anulada/inelegível no banco pontuado',
  officialQuestionBank.every(
    (q) =>
      (q.officialStatus ?? 'valid') === 'valid' &&
      (q.eligibleForScoredSessions ?? true) === true
  )
);

// 4. Q177 fora das sessões.
check(
  '4. Q177 ausente do banco pontuado',
  !officialQuestionBank.some((q) => q.externalId === 'ENEM-2023-D2-C5-Q177')
);

// 5. Zero repetição dentro da sessão.
const mathPool = getOfficialQuestionsForSubject('Matemática');
let repetitionOk = true;
for (let seed = 1; seed <= 25; seed += 1) {
  const { questions } = selectSmartQuestions({
    questions: mathPool,
    requestedCount: 10,
    subject: 'Matemática',
    shuffleSeed: seed,
    now: NOW,
  });
  if (uniqueIds(questions).size !== questions.length) {
    repetitionOk = false;
    break;
  }
}
check('5. Zero repetição dentro da sessão', repetitionOk);

// 6. Quantidade solicitada respeitada quando há disponibilidade.
const requested5 = selectSmartQuestions({
  questions: mathPool,
  requestedCount: 5,
  subject: 'Matemática',
  shuffleSeed: 1,
  now: NOW,
});
check('6. Quantidade solicitada respeitada', requested5.questions.length === 5);

// 7. Quantidade real retornada quando o banco é menor.
const requestedHuge = selectSmartQuestions({
  questions: mathPool,
  requestedCount: 9999,
  subject: 'Matemática',
  shuffleSeed: 1,
  now: NOW,
});
check(
  '7. Quantidade real quando o banco é menor',
  requestedHuge.questions.length === mathPool.length
);

// 8. Questões nunca respondidas priorizadas.
const naturePool = getOfficialQuestionsForSubject('Ciências da Natureza');
const halfSeen = buildAllCorrect(naturePool.slice(0, Math.floor(naturePool.length / 2)));
const unseenFirst = selectSmartQuestions({
  questions: naturePool,
  requestedCount: 5,
  subject: 'Ciências da Natureza',
  performanceByQuestion: halfSeen,
  shuffleSeed: 3,
  now: NOW,
});
check(
  '8. Inéditas priorizadas',
  unseenFirst.diagnostics.unseenCount === unseenFirst.questions.length
);

// 9. Recentes evitadas quando existem alternativas.
const recentIds = naturePool.slice(0, 5).map(getStableQuestionId);
const recentPerformance = buildAllCorrect(naturePool.slice(0, 5));
const avoidRecent = selectSmartQuestions({
  questions: naturePool,
  requestedCount: 5,
  subject: 'Ciências da Natureza',
  performanceByQuestion: recentPerformance,
  recentQuestionIds: recentIds,
  shuffleSeed: 7,
  now: NOW,
});
const selectedRecent = avoidRecent.questions.filter((q) =>
  recentIds.includes(getStableQuestionId(q))
);
check(
  '9. Recentes evitadas quando há alternativas',
  selectedRecent.length === 0 && avoidRecent.diagnostics.recentCountAvoided > 0
);

// 10. Erros priorizados depois das inéditas.
const errorTargets = naturePool.slice(0, 4).map(getStableQuestionId);
const correctTargets = naturePool.slice(4, naturePool.length);
const mixedPerformance: Record<string, QuestionPerformanceLike> = {};
errorTargets.forEach((id, index) => {
  mixedPerformance[id] = {
    stableQuestionId: id,
    attempts: 1,
    correctAttempts: 0,
    incorrectAttempts: 1,
    lastAnsweredAt: new Date(NOW - (index + 1) * DAY).toISOString(),
    lastResult: 'incorrect',
  };
});
correctTargets.forEach((question, index) => {
  const id = getStableQuestionId(question);
  mixedPerformance[id] = {
    stableQuestionId: id,
    attempts: 1,
    correctAttempts: 1,
    incorrectAttempts: 0,
    lastAnsweredAt: new Date(NOW - (index + 1) * DAY).toISOString(),
    lastResult: 'correct',
  };
});
// Todas respondidas: erros devem vir antes das corretas.
const errorsBeforeCorrect = selectSmartQuestions({
  questions: naturePool,
  requestedCount: 4,
  subject: 'Ciências da Natureza',
  performanceByQuestion: mixedPerformance,
  shuffleSeed: 11,
  now: NOW,
});
check(
  '10. Erros priorizados depois das inéditas',
  errorsBeforeCorrect.questions.every((q) =>
    errorTargets.includes(getStableQuestionId(q))
  )
);

// 11. Filtro de matéria respeitado.
const mathOnly = selectSmartQuestions({
  questions: officialQuestionBank,
  requestedCount: 10,
  subject: 'Matemática',
  shuffleSeed: 1,
  now: NOW,
});
check(
  '11. Filtro de matéria respeitado',
  mathOnly.questions.every((q) => q.subject === 'Matemática')
);

// 12. Filtro de tópico respeitado.
const someTopic = mathPool.find((q) => q.topic)?.topic;
const topicFiltered = selectSmartQuestions({
  questions: mathPool,
  requestedCount: 10,
  subject: 'Matemática',
  topic: someTopic,
  shuffleSeed: 1,
  now: NOW,
});
check(
  '12. Filtro de tópico respeitado',
  Boolean(someTopic) &&
    topicFiltered.questions.every((q) => q.topic === someTopic)
);

// 13. Inglês e Espanhol não misturados com Português.
const portuguese = selectSmartQuestions({
  questions: officialQuestionBank,
  requestedCount: 15,
  subject: 'Português',
  shuffleSeed: 1,
  now: NOW,
});
check(
  '13. Inglês/Espanhol fora de Português',
  portuguese.questions.every(
    (q) =>
      q.subject === 'Português' &&
      q.languageTrack !== 'english' &&
      q.languageTrack !== 'spanish'
  )
);

// 14. Mesma seed gera resultado reproduzível.
const seedA = selectSmartQuestions({
  questions: mathPool,
  requestedCount: 8,
  subject: 'Matemática',
  shuffleSeed: 42,
  now: NOW,
});
const seedB = selectSmartQuestions({
  questions: mathPool,
  requestedCount: 8,
  subject: 'Matemática',
  shuffleSeed: 42,
  now: NOW,
});
check(
  '14. Mesma seed é reproduzível',
  seedA.questions.map(getStableQuestionId).join(',') ===
    seedB.questions.map(getStableQuestionId).join(',')
);

// 15. Histórico legado sem novos campos não quebra.
let legacyOk = true;
try {
  const legacyPerformance: Record<string, QuestionPerformanceLike> = {
    [getStableQuestionId(mathPool[0])]: {
      // Sem attempts/correctAttempts/lastResult (formato legado incompleto).
      stableQuestionId: getStableQuestionId(mathPool[0]),
    },
  };
  const legacy = selectSmartQuestions({
    questions: mathPool,
    requestedCount: 5,
    subject: 'Matemática',
    performanceByQuestion: legacyPerformance,
    recentQuestionIds: undefined,
    shuffleSeed: 1,
    now: NOW,
  });
  legacyOk = legacy.questions.length === 5;
} catch {
  legacyOk = false;
}
check('15. Histórico legado incompleto não quebra', legacyOk);

// 16. As 149 questões originais não foram alteradas pela seleção.
const beforeSnapshot = officialQuestionBank.map((q) =>
  JSON.stringify({
    id: getStableQuestionId(q),
    prompt: q.prompt ?? q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
  })
);
selectSmartQuestions({
  questions: officialQuestionBank,
  requestedCount: 50,
  shuffleSeed: 5,
  now: NOW,
});
const afterSnapshot = officialQuestionBank.map((q) =>
  JSON.stringify({
    id: getStableQuestionId(q),
    prompt: q.prompt ?? q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
  })
);
check(
  '16. 149 questões originais intactas',
  beforeSnapshot.length === 149 &&
    beforeSnapshot.join('|') === afterSnapshot.join('|') &&
    officialQuestionBank.every(isOfficialVerifiedQuestion)
);

console.log('');
if (failures > 0) {
  console.error(`Auditoria falhou: ${failures} verificação(ões).`);
  process.exit(1);
}

console.log('Auditoria do motor de seleção concluída com sucesso.');
