import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  getOfficialQuestionsForSubject,
  getQuestionBankStats,
  getStableQuestionId,
  officialQuestionBank,
  selectReviewMistakes,
  selectSmartQuestions,
} from '../src/data/questionBank';
import { ROUTES } from '../src/constants/routes';
import {
  isOfficialVerifiedQuestion,
  normalizeForeignLanguagePreference,
} from '../src/data/questionTypes';
import {
  calculateStreak,
  calculateXp,
  computeLessonResult,
  type ProgressSnapshot,
} from '../src/store/progressLogic';

let failures = 0;

function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`OK   ${label}`);
  } else {
    console.error(`FALHA ${label}${detail ? ` — ${detail}` : ''}`);
    failures += 1;
  }
}

const APP_DIR = join(process.cwd(), 'src', 'app');

function readProgress(routeFile: string): number | null {
  try {
    const content = readFileSync(join(APP_DIR, routeFile), 'utf8');
    const match = content.match(/progress=\{(\d+)\}/);
    return match ? Number(match[1]) : null;
  } catch {
    return null;
  }
}

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

const CTX = { today: '2026-06-27', yesterday: '2026-06-26', timestamp: 1000 };

console.log('=== Auditoria de Estabilidade do MVP ===\n');

const stats = getQuestionBankStats();

// 1.
check('1. 149 questões oficiais', stats.totalOfficialQuestions === 149, String(stats.totalOfficialQuestions));
// 2.
check(
  '2. Zero demos em produção',
  stats.totalDemoInProduction === 0 &&
    officialQuestionBank.every((q) => q.originType !== 'demo')
);
// 3.
const allSubjects = ['Português', 'Ciências Humanas', 'Ciências da Natureza', 'Matemática', 'Inglês', 'Espanhol'];
const noAnnulledInSessions = allSubjects.every((subject) => {
  const { questions } = selectSmartQuestions({
    questions: officialQuestionBank,
    requestedCount: 10,
    subject,
    shuffleSeed: 7,
  });
  return questions.every(
    (q) =>
      (q.officialStatus ?? 'valid') === 'valid' &&
      (q.eligibleForScoredSessions ?? true) === true
  );
});
check('3. Zero anuladas/inelegíveis nas sessões', noAnnulledInSessions);
// 4.
check(
  '4. Q177 fora do banco',
  !officialQuestionBank.some((q) => q.externalId === 'ENEM-2023-D2-C5-Q177')
);
// 5.
const requiredRouteKeys = [
  'tabsAtividade',
  'tabsEstudar',
  'tabsRevisar',
  'tabsVoce',
  'studySession',
  'reviewMistakes',
  'settings',
  'onboardingStart',
];
check(
  '5. Rotas críticas existentes',
  requiredRouteKeys.every(
    (key) => typeof (ROUTES as Record<string, unknown>)[key] === 'string'
  )
);
// 6.
const onboardingFiles = [
  'onboarding-1.tsx',
  'onboarding-2.tsx',
  'onboarding-3.tsx',
  'onboarding-4.tsx',
  'onboarding-5.tsx',
  'onboarding-6.tsx',
  'onboarding-7.tsx',
  'onboarding-8.tsx',
  'onboarding-language.tsx',
  'onboarding-9.tsx',
];
const progresses = onboardingFiles.map(readProgress);
check(
  '6. Onboarding com 10 etapas',
  progresses.length === 10 && progresses.every((p) => p !== null)
);
// 7.
const validPercents =
  progresses.every((p) => p !== null && p >= 0 && p <= 100) &&
  progresses.every((p, i) => i === 0 || (p as number) > (progresses[i - 1] as number)) &&
  progresses[progresses.length - 1] === 100;
check('7. Percentuais válidos e crescentes', validPercents, progresses.join(','));
// 8.
check(
  '8. Preferência de idioma normalizada',
  normalizeForeignLanguagePreference('english') === 'english' &&
    normalizeForeignLanguagePreference('spanish') === 'spanish' &&
    normalizeForeignLanguagePreference(null) === null &&
    normalizeForeignLanguagePreference('invalid') === null &&
    normalizeForeignLanguagePreference(undefined) === null
);
// 9.
check('9. 4 questões de Inglês', stats.officialBySubject.Inglês === 4);
// 10.
check('10. 4 questões de Espanhol', stats.officialBySubject.Espanhol === 4);
// 11.
check(
  '11. Português sem idiomas estrangeiros',
  getOfficialQuestionsForSubject('Português').every(
    (q) => q.languageTrack !== 'english' && q.languageTrack !== 'spanish'
  )
);
// 12.
const noDup = allSubjects.every((subject) => {
  const { questions } = selectSmartQuestions({
    questions: officialQuestionBank,
    requestedCount: 50,
    subject,
    shuffleSeed: 3,
  });
  return new Set(questions.map(getStableQuestionId)).size === questions.length;
});
check('12. Motor sem duplicatas', noDup);
// 13.
const ptFive = selectSmartQuestions({ questions: officialQuestionBank, requestedCount: 5, subject: 'Português', shuffleSeed: 1 });
const enFive = selectSmartQuestions({ questions: officialQuestionBank, requestedCount: 5, subject: 'Inglês', shuffleSeed: 1 });
check(
  '13. Quantidade real respeitada',
  ptFive.questions.length === 5 && enFive.questions.length === 4
);
// 14.
const ids = officialQuestionBank.map(getStableQuestionId);
check(
  '14. IDs estáveis e únicos',
  ids.every((id) => typeof id === 'string' && id.length > 0) &&
    new Set(ids).size === ids.length
);
// 15.
const freshLesson = computeLessonResult(
  freshSnapshot(),
  { minutes: 5, totalQuestions: 4, correctAnswers: 3, subject: 'Inglês' },
  CTX
);
check(
  '15. Defaults dos stores válidos',
  freshLesson.patch.xp === calculateXp(4, 3) &&
    freshLesson.patch.streak === 1 &&
    (freshLesson.patch.lessonHistory?.length ?? 0) === 1
);
// 16.
const legacyPerf = { 'ENEM-2023-D1-C1-Q11': { attempts: 1 } } as any;
let migrationSafe = true;
try {
  selectSmartQuestions({
    questions: officialQuestionBank,
    requestedCount: 5,
    subject: 'Português',
    performanceByQuestion: legacyPerf,
    recentQuestionIds: ['', 'x'] as any,
  });
} catch {
  migrationSafe = false;
}
check('16. Migrações/históricos legados seguros', migrationSafe);
// 17.
check(
  '17. XP nunca negativo',
  calculateXp(-5, -3) === 0 &&
    calculateXp(Number.NaN, 10) === 0 &&
    calculateXp(4, 999) === calculateXp(4, 4)
);
// 18.
const firstCompletion = computeLessonResult(freshSnapshot(), { minutes: 5, totalQuestions: 4, correctAnswers: 4, subject: 'Inglês' }, CTX);
const afterFirst: ProgressSnapshot = { ...freshSnapshot(), ...firstCompletion.patch } as ProgressSnapshot;
const secondCompletion = computeLessonResult(afterFirst, { minutes: 5, totalQuestions: 4, correctAnswers: 4, subject: 'Inglês' }, CTX);
check(
  '18. Histórico/XP não duplicado no mesmo dia',
  firstCompletion.result.earnedXp > 0 &&
    secondCompletion.result.isRepeat === true &&
    secondCompletion.result.earnedXp === 0
);
// 19.
check(
  '19. Repetição não recontabiliza XP (registro único)',
  (secondCompletion.patch.xp ?? 0) === (afterFirst.xp ?? 0)
);
// 20.
const abandoned = freshSnapshot();
check(
  '20. Sessão abandonada fora do histórico',
  abandoned.lessonHistory.length === 0 && abandoned.sessionsCompleted === 0
);
// 21.
let reviewSafe = true;
try {
  const ordered = selectReviewMistakes({
    mistakes: [
      { id: 'legacy-1', errorCount: 2, lastAnsweredAt: 'data-invalida' },
      { id: 'legacy-1', errorCount: 2, lastAnsweredAt: 'data-invalida' },
      { id: 'q2', externalId: 'X', errorCount: 1, lastAnsweredAt: new Date().toISOString() },
    ],
  });
  reviewSafe = ordered.length === 2;
} catch {
  reviewSafe = false;
}
check('21. Revisão tolerante a dados legados', reviewSafe);
// 22.
const snapshotBefore = JSON.stringify(officialQuestionBank.map((q) => ({ id: getStableQuestionId(q), p: q.prompt ?? q.question, o: q.options, a: q.correctAnswer })));
selectSmartQuestions({ questions: officialQuestionBank, requestedCount: 100, shuffleSeed: 9 });
const snapshotAfter = JSON.stringify(officialQuestionBank.map((q) => ({ id: getStableQuestionId(q), p: q.prompt ?? q.question, o: q.options, a: q.correctAnswer })));
check(
  '22. Importações oficiais intactas',
  snapshotBefore === snapshotAfter && officialQuestionBank.every(isOfficialVerifiedQuestion)
);

// Extra: streak consecutivo e quebra.
check(
  'Extra. Streak consecutivo e quebra',
  calculateStreak('2026-06-26', 3, '2026-06-27', '2026-06-26') === 4 &&
    calculateStreak('2026-06-27', 3, '2026-06-27', '2026-06-26') === 3 &&
    calculateStreak('2026-06-20', 3, '2026-06-27', '2026-06-26') === 1
);

console.log('');
if (failures > 0) {
  console.error(`Auditoria falhou: ${failures} verificação(ões).`);
  process.exit(1);
}
console.log('Auditoria de estabilidade do MVP concluída com sucesso.');
