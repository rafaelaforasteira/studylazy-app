export type QuestionOriginType = 'official_exam' | 'demo';

export type QuestionContentFormat = 'prose' | 'verse';

export type QuestionLanguageTrack = 'english' | 'spanish' | null;

/**
 * Preferência de língua estrangeira do usuário.
 *
 * Aceita `null` para usuários que ainda não escolheram (inclusive antigos),
 * de modo que nunca selecionamos um idioma silenciosamente por eles.
 */
export type ForeignLanguagePreference = 'english' | 'spanish';

/** Matérias oficiais que representam línguas estrangeiras. */
export const FOREIGN_LANGUAGE_SUBJECTS = ['Inglês', 'Espanhol'] as const;

const FOREIGN_LANGUAGE_SUBJECT_BY_PREFERENCE: Record<
  ForeignLanguagePreference,
  (typeof FOREIGN_LANGUAGE_SUBJECTS)[number]
> = {
  english: 'Inglês',
  spanish: 'Espanhol',
};

/** Converte a preferência no nome de matéria usado pelo banco oficial. */
export function getForeignLanguageSubject(
  preference: ForeignLanguagePreference
) {
  return FOREIGN_LANGUAGE_SUBJECT_BY_PREFERENCE[preference];
}

/** Rótulo legível (igual ao nome de matéria) para a preferência. */
export function getForeignLanguageLabel(
  preference: ForeignLanguagePreference
) {
  return FOREIGN_LANGUAGE_SUBJECT_BY_PREFERENCE[preference];
}

/** Indica se uma matéria é de língua estrangeira (Inglês ou Espanhol). */
export function isForeignLanguageSubject(subject?: string) {
  return (
    subject === 'Inglês' ||
    subject === 'Espanhol'
  );
}

/**
 * Normaliza valores persistidos/legados para uma preferência válida ou `null`.
 * Garante migração segura: qualquer valor inesperado vira `null`.
 */
export function normalizeForeignLanguagePreference(
  value: unknown
): ForeignLanguagePreference | null {
  if (value === 'english' || value === 'spanish') {
    return value;
  }

  return null;
}

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
