import type { LessonMistakeInput, MistakeItem } from '../store/mistakeStore';
import type { Question } from '../data/questionTypes';
import { getQuestionPrompt } from '../data/questionTypes';

export function questionToLessonMistake(
  question: Question,
  selectedAnswer: string
): LessonMistakeInput {
  return {
    question: getQuestionPrompt(question),
    options: [...question.options],
    selectedAnswer,
    correctAnswer: question.correctAnswer,
    externalId: question.externalId
      ? String(question.externalId)
      : String(question.id),
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

export function mistakeToQuestion(mistake: MistakeItem): Question {
  return {
    id: mistake.externalId ?? mistake.id,
    externalId: mistake.externalId,
    originType: mistake.originType ?? 'demo',
    verified: mistake.verified ?? false,
    question: mistake.prompt ?? mistake.question,
    prompt: mistake.prompt ?? mistake.question,
    options: [...mistake.options],
    correctAnswer: mistake.correctAnswer,
    source: mistake.source,
    year: mistake.year,
    area: mistake.area,
    topic: mistake.topic,
    supportTitle: mistake.supportTitle,
    supportText: mistake.supportText,
    sourceCitation: mistake.sourceCitation,
    contentFormat: mistake.contentFormat,
    subject: mistake.subject,
  };
}
