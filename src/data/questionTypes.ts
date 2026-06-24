export type QuestionOriginType = 'official_exam' | 'demo';

export type QuestionContentFormat = 'prose' | 'verse';

export type Question = {
  id: number | string;
  /** Fallback statement; prefer `prompt` for official questions. */
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  externalId?: string;
  source?: string;
  year?: number;
  area?: string;
  topic?: string;
  subject?: string;
  originType: QuestionOriginType;
  verified: boolean;
  supportTitle?: string;
  supportText?: string;
  sourceCitation?: string;
  prompt?: string;
  contentFormat?: QuestionContentFormat;
  requiresImage?: boolean;
};

export function getQuestionKey(question: Question) {
  return String(question.externalId ?? question.id);
}

export function isOfficialVerifiedQuestion(question: Question) {
  return (
    question.originType === 'official_exam' &&
    question.verified === true &&
    Boolean(question.externalId) &&
    Boolean(question.source) &&
    typeof question.year === 'number'
  );
}

export function getQuestionPrompt(question: Question) {
  return question.prompt?.trim() || question.question.trim();
}
