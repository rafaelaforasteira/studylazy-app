import { allEnem2024Questions } from './enem2024Questions';
import { composeOfficialLessonQuestions } from './questionSelection';
import {
  isOfficialVerifiedQuestion,
  type Question,
} from './questionTypes';

export type { Question } from './questionTypes';
export { allEnem2024Questions } from './enem2024Questions';
export {
  composeOfficialLessonQuestions,
  shuffleQuestions,
} from './questionSelection';
export {
  getQuestionKey,
  getQuestionPrompt,
  isOfficialVerifiedQuestion,
} from './questionTypes';

type GetQuestionsForLessonParams = {
  subject: string;
  amount: number;
  seenQuestionIds?: string[];
  shuffleSeed?: number;
};

export const officialQuestionBank: Question[] = allEnem2024Questions.filter(
  isOfficialVerifiedQuestion
);

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
    Matemática: getOfficialQuestionsForSubject('Matemática').length,
    Redação: getOfficialQuestionsForSubject('Redação').length,
  };

  return {
    totalOfficialQuestions: officialQuestionBank.length,
    totalDemoInProduction: 0,
    officialBySubject,
    officialExternalIds: officialQuestionBank.map((question) =>
      String(question.externalId ?? question.id)
    ),
  };
}

export function getQuestionsForLesson({
  subject,
  amount,
  seenQuestionIds,
  shuffleSeed,
}: GetQuestionsForLessonParams) {
  const eligibleQuestions = getOfficialQuestionsForSubject(subject);

  return composeOfficialLessonQuestions(eligibleQuestions, {
    amount,
    seenQuestionIds,
    shuffleSeed,
  });
}

function assertOfficialQuestionBankIntegration() {
  const stats = getQuestionBankStats();

  if (stats.totalOfficialQuestions !== 10) {
    throw new Error(
      `Banco oficial inválido: esperado 10, encontrado ${stats.totalOfficialQuestions}`
    );
  }

  if (stats.officialBySubject['Português'] !== 2) {
    throw new Error('Português oficial inválido');
  }

  if (stats.officialBySubject['Ciências Humanas'] !== 8) {
    throw new Error('Ciências Humanas oficial inválido');
  }

  const portugueseSession = getQuestionsForLesson({
    subject: 'Português',
    amount: 5,
  });

  if (portugueseSession.length !== 2) {
    throw new Error(
      `Português amount=5 deve retornar 2 oficiais, retornou ${portugueseSession.length}`
    );
  }

  if (portugueseSession.some((question) => question.originType === 'demo')) {
    throw new Error('Sessão de Português contém questão demo');
  }

  const mathSession = getQuestionsForLesson({
    subject: 'Matemática',
    amount: 5,
  });

  if (mathSession.length !== 0) {
    throw new Error('Matemática sem banco oficial deve retornar vazio');
  }
}

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  assertOfficialQuestionBankIntegration();
}
