import type {
  QuestionReport,
  QuestionReportCategory,
  QuestionReportContext,
} from '../store/questionReportStore';
import type { Question } from '../data/questionTypes';

export type ReportableQuestion = {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: string;
  source?: string;
  year?: number;
  area?: string;
  topic?: string;
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
    question: question.question,
    options: [...question.options],
    correctAnswer: question.correctAnswer,
    source: question.source,
    year: question.year,
    area: question.area,
    topic: question.topic,
  };
}

export function toReportableFromMistake(
  mistake: {
    subject: string;
    question: string;
    options: string[];
    correctAnswer: string;
  },
  matchedQuestion?: Question | null
): ReportableQuestion {
  if (matchedQuestion) {
    return toReportableQuestion(matchedQuestion, mistake.subject);
  }

  return {
    id: mistake.question.slice(0, 48),
    subject: mistake.subject,
    question: mistake.question,
    options: [...mistake.options],
    correctAnswer: mistake.correctAnswer,
  };
}
