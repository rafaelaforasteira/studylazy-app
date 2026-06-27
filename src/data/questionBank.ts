import { allEnem2024Questions } from './enem2024Questions';
import {
  selectSmartQuestions,
  type QuestionPerformanceLike,
  type SmartSelectionDiagnostics,
} from './questionSelection';
import { enem2023Day1TextQuestions } from './questions/enem/2023/day1';
import { enem2023Day2TextQuestions } from './questions/enem/2023/day2';
import {
  isOfficialVerifiedQuestion,
  type Question,
} from './questionTypes';

export type { Question } from './questionTypes';
export { allEnem2024Questions } from './enem2024Questions';
export {
  enem2023Day1StagingQuestions,
  enem2023Day1TextQuestions,
  enem2023Day1VerifiedQuestions,
} from './questions/enem/2023/day1';
export {
  enem2023Day2AnnulledRegistry,
  enem2023Day2StagingQuestions,
  enem2023Day2TextQuestions,
  enem2023Day2VerifiedQuestions,
} from './questions/enem/2023/day2';
export {
  composeOfficialLessonQuestions,
  selectSmartQuestions,
  selectReviewMistakes,
  shuffleQuestions,
  SELECTION_WEIGHTS,
} from './questionSelection';
export {
  getQuestionKey,
  getQuestionPrompt,
  getStableQuestionId,
  isOfficialVerifiedQuestion,
} from './questionTypes';

type GetQuestionsForLessonParams = {
  subject: string;
  amount: number;
  /** @deprecated use recentQuestionIds */
  seenQuestionIds?: string[];
  shuffleSeed?: number;
  topic?: string;
  performanceByQuestion?: Record<string, QuestionPerformanceLike>;
  recentQuestionIds?: string[];
  random?: () => number;
  now?: number;
};

const allOfficialSourceQuestions: Question[] = [
  ...allEnem2024Questions,
  ...enem2023Day1TextQuestions,
  ...enem2023Day2TextQuestions,
];

export const officialQuestionBank: Question[] =
  allOfficialSourceQuestions.filter(isOfficialVerifiedQuestion);

export function getOfficialQuestionsForSubject(subject: string) {
  return officialQuestionBank.filter(
    (question) => question.subject === subject
  );
}

export function hasOfficialQuestionsForSubject(subject: string) {
  return getOfficialQuestionsForSubject(subject).length > 0;
}

export function getAllQuestions() {
  return [...officialQuestionBank];
}

export function findQuestionByExternalId(externalId: string) {
  return officialQuestionBank.find(
    (question) =>
      question.externalId === externalId ||
      String(question.id) === externalId
  );
}

export function findQuestionByStatement(statement: string) {
  return officialQuestionBank.find(
    (question) =>
      question.question === statement ||
      question.prompt === statement
  );
}

export function findQuestionReference({
  externalId,
  statement,
}: {
  externalId?: string;
  statement: string;
}) {
  if (externalId) {
    return (
      findQuestionByExternalId(externalId) ??
      findQuestionByStatement(statement)
    );
  }

  return findQuestionByStatement(statement);
}

export function getQuestionBankStats() {
  const officialBySubject = {
    'Português': getOfficialQuestionsForSubject('Português').length,
    'Ciências Humanas': getOfficialQuestionsForSubject('Ciências Humanas')
      .length,
    'Ciências da Natureza': getOfficialQuestionsForSubject(
      'Ciências da Natureza'
    ).length,
    Inglês: getOfficialQuestionsForSubject('Inglês').length,
    Espanhol: getOfficialQuestionsForSubject('Espanhol').length,
    Matemática: getOfficialQuestionsForSubject('Matemática').length,
    Redação: getOfficialQuestionsForSubject('Redação').length,
  };

  const enem2024Count = officialQuestionBank.filter(
    (question) => question.year === 2024
  ).length;
  const enem2023Count = officialQuestionBank.filter(
    (question) => question.year === 2023
  ).length;
  const enem2023Day1Count = officialQuestionBank.filter(
    (question) => question.year === 2023 && question.examDay === 1
  ).length;
  const enem2023Day2Count = officialQuestionBank.filter(
    (question) => question.year === 2023 && question.examDay === 2
  ).length;

  return {
    totalOfficialQuestions: officialQuestionBank.length,
    totalEnem2024: enem2024Count,
    totalEnem2023: enem2023Count,
    totalEnem2023Day1: enem2023Day1Count,
    totalEnem2023Day2: enem2023Day2Count,
    totalDemoInProduction: 0,
    officialBySubject,
    officialExternalIds: officialQuestionBank.map((question) =>
      String(question.externalId ?? question.id)
    ),
  };
}

export function getLessonSelection({
  subject,
  amount,
  seenQuestionIds,
  shuffleSeed,
  topic,
  performanceByQuestion,
  recentQuestionIds,
  random,
  now,
}: GetQuestionsForLessonParams): {
  questions: Question[];
  diagnostics: SmartSelectionDiagnostics;
} {
  const eligibleQuestions = getOfficialQuestionsForSubject(subject);

  return selectSmartQuestions({
    questions: eligibleQuestions,
    requestedCount: amount,
    topic,
    performanceByQuestion,
    recentQuestionIds: recentQuestionIds ?? seenQuestionIds,
    shuffleSeed,
    random,
    now,
  });
}

export function getQuestionsForLesson(params: GetQuestionsForLessonParams) {
  return getLessonSelection(params).questions;
}

function assertOfficialQuestionBankIntegration() {
  const stats = getQuestionBankStats();

  if (stats.totalOfficialQuestions !== 149) {
    throw new Error(
      `Banco oficial inválido: esperado 149, encontrado ${stats.totalOfficialQuestions}`
    );
  }

  if (stats.totalEnem2024 !== 10) {
    throw new Error('ENEM 2024 oficial inválido');
  }

  if (stats.totalEnem2023 !== 139) {
    throw new Error('ENEM 2023 textual oficial inválido');
  }

  if (stats.officialBySubject['Português'] !== 38) {
    throw new Error('Português oficial inválido');
  }

  if (stats.officialBySubject['Ciências Humanas'] !== 48) {
    throw new Error('Ciências Humanas oficial inválido');
  }

  if (stats.officialBySubject['Ciências da Natureza'] !== 32) {
    throw new Error('Ciências da Natureza oficial inválido');
  }

  if (stats.officialBySubject['Matemática'] !== 23) {
    throw new Error('Matemática oficial inválido');
  }

  if (stats.officialBySubject['Inglês'] !== 4) {
    throw new Error('Inglês oficial inválido');
  }

  if (stats.officialBySubject['Espanhol'] !== 4) {
    throw new Error('Espanhol oficial inválido');
  }

  const portugueseSession = getQuestionsForLesson({
    subject: 'Português',
    amount: 5,
  });

  if (portugueseSession.length !== 5) {
    throw new Error(
      `Português amount=5 deve retornar 5 oficiais, retornou ${portugueseSession.length}`
    );
  }

  if (
    portugueseSession.some(
      (question) =>
        question.languageTrack === 'english' ||
        question.languageTrack === 'spanish'
    )
  ) {
    throw new Error('Sessão de Português contém língua estrangeira');
  }

  if (portugueseSession.some((question) => question.originType === 'demo')) {
    throw new Error('Sessão de Português contém questão demo');
  }

  const mathSession = getQuestionsForLesson({
    subject: 'Matemática',
    amount: 5,
  });

  if (mathSession.length !== 5) {
    throw new Error('Matemática deve retornar 5 oficiais');
  }

  if (mathSession.some((question) => question.examDay !== 2)) {
    throw new Error('Sessão de Matemática deve usar ENEM 2023 D2');
  }

  const natureSession = getQuestionsForLesson({
    subject: 'Ciências da Natureza',
    amount: 5,
  });

  if (natureSession.length !== 5) {
    throw new Error('Ciências da Natureza deve retornar 5 oficiais');
  }

  if (
    officialQuestionBank.some(
      (question) => question.externalId === 'ENEM-2023-D2-C5-Q177'
    )
  ) {
    throw new Error('Q177 anulada não pode estar no banco pontuado');
  }
}

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  assertOfficialQuestionBankIntegration();
}
