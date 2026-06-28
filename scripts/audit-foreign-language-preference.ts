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
  getForeignLanguageSubject,
  isOfficialVerifiedQuestion,
  normalizeForeignLanguagePreference,
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

const NOW = Date.UTC(2026, 5, 27);

function selectForSubject(
  subject: string,
  requestedCount: number,
  performanceByQuestion?: Record<string, QuestionPerformanceLike>
) {
  return selectSmartQuestions({
    questions: officialQuestionBank,
    requestedCount,
    subject,
    performanceByQuestion,
    shuffleSeed: 1,
    now: NOW,
  });
}

console.log('=== Auditoria da Escolha de Língua Estrangeira ===\n');

// 1. Banco continua com 149 questões oficiais.
const stats = getQuestionBankStats();
check('1. Banco com 149 questões oficiais', stats.totalOfficialQuestions === 149);

const englishPool = getOfficialQuestionsForSubject('Inglês');
const spanishPool = getOfficialQuestionsForSubject('Espanhol');
const portuguesePool = getOfficialQuestionsForSubject('Português');

// 2. Inglês possui 4 questões textuais pontuáveis.
check('2. Inglês com 4 questões pontuáveis', englishPool.length === 4);

// 3. Espanhol possui 4 questões textuais pontuáveis.
check('3. Espanhol com 4 questões pontuáveis', spanishPool.length === 4);

// 4. Português não contém Inglês.
check(
  '4. Português não contém Inglês',
  !portuguesePool.some((q) => q.languageTrack === 'english')
);

// 5. Português não contém Espanhol.
check(
  '5. Português não contém Espanhol',
  !portuguesePool.some((q) => q.languageTrack === 'spanish')
);

// 6. Sessão de Inglês contém somente Inglês.
const englishSession = selectForSubject('Inglês', 4);
check(
  '6. Sessão de Inglês só tem Inglês',
  englishSession.questions.length === 4 &&
    englishSession.questions.every((q) => q.subject === 'Inglês')
);

// 7. Sessão de Espanhol contém somente Espanhol.
const spanishSession = selectForSubject('Espanhol', 4);
check(
  '7. Sessão de Espanhol só tem Espanhol',
  spanishSession.questions.length === 4 &&
    spanishSession.questions.every((q) => q.subject === 'Espanhol')
);

// 8. Pedido de 5 retorna 4 sem duplicação.
const englishFive = selectForSubject('Inglês', 5);
const spanishFive = selectForSubject('Espanhol', 5);
check(
  '8. Pedido de 5 retorna 4 sem duplicar',
  englishFive.questions.length === 4 &&
    spanishFive.questions.length === 4 &&
    new Set(englishFive.questions.map(getStableQuestionId)).size === 4 &&
    new Set(spanishFive.questions.map(getStableQuestionId)).size === 4 &&
    englishFive.diagnostics.repeatedIds.length === 0 &&
    spanishFive.diagnostics.repeatedIds.length === 0
);

// 9. Nenhuma demo.
check(
  '9. Nenhuma demo nas sessões de idioma',
  [...englishSession.questions, ...spanishSession.questions].every(
    (q) => q.originType === 'official_exam'
  )
);

// 10. Nenhuma anulada.
check(
  '10. Nenhuma anulada nas sessões de idioma',
  [...englishSession.questions, ...spanishSession.questions].every(
    (q) =>
      (q.officialStatus ?? 'valid') === 'valid' &&
      (q.eligibleForScoredSessions ?? true) === true
  )
);

// 11. Q177 fora.
check(
  '11. Q177 fora do banco pontuado',
  !officialQuestionBank.some((q) => q.externalId === 'ENEM-2023-D2-C5-Q177')
);

// 12. Preferência null não quebra (não seleciona idioma automaticamente).
const nullPreference = normalizeForeignLanguagePreference(null);
check('12. Preferência null normaliza para null', nullPreference === null);

// 13. Dados legados não quebram (valores inesperados viram null).
check(
  '13. Dados legados normalizam com segurança',
  normalizeForeignLanguagePreference(undefined) === null &&
    normalizeForeignLanguagePreference('portuguese') === null &&
    normalizeForeignLanguagePreference('english') === 'english' &&
    normalizeForeignLanguagePreference('spanish') === 'spanish'
);

// 14. Troca de idioma preserva histórico (IDs estáveis isolam por idioma).
const englishPerformance: Record<string, QuestionPerformanceLike> = {};
englishPool.forEach((q) => {
  englishPerformance[getStableQuestionId(q)] = {
    stableQuestionId: getStableQuestionId(q),
    attempts: 1,
    correctAttempts: 0,
    incorrectAttempts: 1,
    lastAnsweredAt: new Date(NOW).toISOString(),
    lastResult: 'incorrect',
  };
});
// Histórico de Inglês não deve influenciar a seleção de Espanhol.
const spanishWithEnglishHistory = selectForSubject('Espanhol', 4, englishPerformance);
const spanishBaseline = selectForSubject('Espanhol', 4);
check(
  '14. Histórico de Inglês não afeta Espanhol',
  spanishWithEnglishHistory.questions.map(getStableQuestionId).sort().join(',') ===
    spanishBaseline.questions.map(getStableQuestionId).sort().join(',') &&
    spanishWithEnglishHistory.questions.every((q) => q.subject === 'Espanhol')
);

// 15. Motor inteligente continua ativo (diagnósticos presentes, inéditas contadas).
check(
  '15. Motor inteligente ativo (diagnósticos)',
  typeof englishSession.diagnostics.eligibleCount === 'number' &&
    englishSession.diagnostics.selectedCount === 4 &&
    englishSession.diagnostics.unseenCount === 4
);

// 16. As 149 questões permanecem intactas.
const beforeSnapshot = officialQuestionBank.map((q) =>
  JSON.stringify({
    id: getStableQuestionId(q),
    subject: q.subject,
    prompt: q.prompt ?? q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
  })
);
selectSmartQuestions({
  questions: officialQuestionBank,
  requestedCount: 50,
  shuffleSeed: 3,
  now: NOW,
});
const afterSnapshot = officialQuestionBank.map((q) =>
  JSON.stringify({
    id: getStableQuestionId(q),
    subject: q.subject,
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

// Verificação extra: o mapeamento de preferência → matéria.
check(
  'Extra. Mapeamento preferência → matéria',
  getForeignLanguageSubject('english') === 'Inglês' &&
    getForeignLanguageSubject('spanish') === 'Espanhol'
);

console.log('');
if (failures > 0) {
  console.error(`Auditoria falhou: ${failures} verificação(ões).`);
  process.exit(1);
}

console.log('Auditoria de língua estrangeira concluída com sucesso.');
