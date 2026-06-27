export type QuestionOriginType = 'official_exam' | 'demo';

export type QuestionContentFormat = 'prose' | 'verse';

export type QuestionLanguageTrack = 'english' | 'spanish' | null;

export type ExplanationOrigin = 'editorial' | 'official';

export type OfficialStatus = 'valid' | 'annulled';

export type QuestionContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'formula'; latex: string; fallbackText: string }
  | {
      type: 'table';
      columns: string[];
      rows: string[][];
      caption?: string;
    }
  | { type: 'list'; items: string[] }
  | { type: 'citation'; text: string };

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
  examDay?: number;
  booklet?: string;
  questionNumber?: number;
  languageTrack?: QuestionLanguageTrack;
  area?: string;
  topic?: string;
  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  originType: QuestionOriginType;
  sourceVerified?: boolean;
  officialStatus?: OfficialStatus;
  eligibleForScoredSessions?: boolean;
  verified: boolean;
  supportTitle?: string;
  supportText?: string;
  sourceCitation?: string;
  prompt?: string;
  contentBlocks?: QuestionContentBlock[];
  contentFormat?: QuestionContentFormat;
  requiresImage?: boolean;
  requiresMedia?: boolean;
  explanationOrigin?: ExplanationOrigin;
  explanationVerified?: boolean;
};

/**
 * Identificador estável e único de uma questão.
 *
 * Prioriza `externalId` (estável entre builds) e usa o `id` interno apenas
 * como fallback legado. Nunca depende do texto do enunciado.
 */
export function getStableQuestionId(question: Pick<Question, 'externalId' | 'id'>) {
  const externalId = question.externalId;

  if (typeof externalId === 'string' && externalId.trim().length > 0) {
    return externalId;
  }

  return String(question.id);
}

export function getQuestionKey(question: Question) {
  return getStableQuestionId(question);
}

export function isOfficialVerifiedQuestion(question: Question) {
  return (
    question.originType === 'official_exam' &&
    (question.sourceVerified ?? true) === true &&
    (question.officialStatus ?? 'valid') === 'valid' &&
    (question.eligibleForScoredSessions ?? true) === true &&
    question.verified === true &&
    Boolean(question.externalId) &&
    Boolean(question.source) &&
    typeof question.year === 'number' &&
    question.requiresImage !== true &&
    question.requiresMedia !== true
  );
}

export function getQuestionPrompt(question: Question) {
  return question.prompt?.trim() || question.question.trim();
}
