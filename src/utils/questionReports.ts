import type {
  QuestionReport,
  QuestionReportCategory,
  QuestionReportContext,
} from '../store/questionReportStore';
import type { Question } from '../data/questionTypes';
import { getQuestionPrompt } from '../data/questionTypes';
import type { LessonMistakeInput } from '../store/mistakeStore';

export type ReportableQuestion = {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: string;
  originType?: Question['originType'];
  verified?: boolean;
  source?: string;
  year?: number;
  area?: string;
  topic?: string;
  supportTitle?: string;
  supportText?: string;
  sourceCitation?: string;
  prompt?: string;
  contentFormat?: Question['contentFormat'];
};

export const REPORT_CATEGORIES: {
  key: QuestionReportCategory;
  label: string;
}[] = [
  {
    key: 'wrong_answer',
    label: 'Resposta correta parece errada',
  },
  {
    key: 'incomplete_statement',
    label: 'Enunciado incompleto ou confuso',
  },
  {
    key: 'alternative_error',
    label: 'Erro em uma alternativa',
  },
  {
    key: 'missing_content',
    label: 'Imagem ou parte do texto faltando',
  },
  {
    key: 'other',
    label: 'Outro',
  },
];

export function getCategoryLabel(category: QuestionReportCategory) {
  return (
    REPORT_CATEGORIES.find((item) => item.key === category)?.label ?? category
  );
}

export function getContextLabel(context: QuestionReportContext) {
  return context === 'study' ? 'Sessão' : 'Revisão';
}

export function getStatusLabel(status: QuestionReport['status']) {
  return status === 'synced' ? 'Sincronizado' : 'Pendente';
}

export function formatReportDate(isoDate: string) {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function truncateStatement(statement: string, maxLength = 96) {
  const trimmed = statement.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength).trim()}…`;
}

export function toReportableQuestion(
  question: Question,
  subject: string
): ReportableQuestion {
  return {
    id: String(question.externalId ?? question.id),
    subject,
    question: getQuestionPrompt(question),
    options: [...question.options],
    correctAnswer: question.correctAnswer,
    originType: question.originType,
    verified: question.verified,
    source: question.source,
    year: question.year,
    area: question.area,
    topic: question.topic,
    supportTitle: question.supportTitle,
    supportText: question.supportText,
    sourceCitation: question.sourceCitation,
    prompt: question.prompt,
    contentFormat: question.contentFormat,
  };
}

export function toReportableFromMistake(
  mistake: LessonMistakeInput & { subject: string },
  matchedQuestion?: Question | null
): ReportableQuestion {
  if (matchedQuestion) {
    return toReportableQuestion(matchedQuestion, mistake.subject);
  }

  return {
    id: mistake.externalId ?? mistake.question.slice(0, 48),
    subject: mistake.subject,
    question: mistake.prompt ?? mistake.question,
    options: [...mistake.options],
    correctAnswer: mistake.correctAnswer,
    originType: mistake.originType,
    verified: mistake.verified,
    source: mistake.source,
    year: mistake.year,
    area: mistake.area,
    topic: mistake.topic,
    supportTitle: mistake.supportTitle,
    supportText: mistake.supportText,
    sourceCitation: mistake.sourceCitation,
    prompt: mistake.prompt,
    contentFormat: mistake.contentFormat,
  };
}
