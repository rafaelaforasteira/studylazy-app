import type { LessonMistakeInput, MistakeItem } from '../store/mistakeStore';
import type { Question } from '../data/questionTypes';
import { getQuestionPrompt } from '../data/questionTypes';
import { findQuestionByExternalId } from '../data/questionBank';
import { getMistakeStableSyncId } from '../sync/syncSerializer';
import type { SyncMistakeItem } from '../sync/syncTypes';

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

/**
 * Reconstrói `MistakeItem` completos a partir de itens de sincronização
 * MÍNIMOS, usando o banco oficial via `stableQuestionId`. Para itens não
 * oficiais (legados), reaproveita o conteúdo local já existente (tolerado)
 * sem reenviá-lo à nuvem. Quando não houver fonte, mantém o mínimo.
 */
export function reconstructMistakeItems(
  syncItems: SyncMistakeItem[],
  localMistakes: MistakeItem[]
): MistakeItem[] {
  const localByStableId = new Map<string, MistakeItem>();
  localMistakes.forEach((mistake) => {
    localByStableId.set(getMistakeStableSyncId(mistake), mistake);
  });

  return syncItems.map((item) => {
    const official = findQuestionByExternalId(item.stableQuestionId);
    if (official) {
      return {
        id: item.stableQuestionId,
        subject: item.subject || official.subject || '',
        question: official.question,
        options: [...official.options],
        selectedAnswer: item.selectedAnswer ?? '',
        correctAnswer: official.correctAnswer,
        externalId: official.externalId
          ? String(official.externalId)
          : String(official.id),
        originType: official.originType,
        verified: official.verified,
        source: official.source,
        year: official.year,
        area: official.area,
        topic: official.topic,
        supportTitle: official.supportTitle,
        supportText: official.supportText,
        sourceCitation: official.sourceCitation,
        prompt: official.prompt,
        contentFormat: official.contentFormat,
        errorCount: item.errorCount,
        lastAnsweredAt: item.lastAnsweredAt,
      };
    }

    const local = localByStableId.get(item.stableQuestionId);
    if (local) {
      // Conteúdo legado preservado localmente; só atualiza contadores/escolha.
      return {
        ...local,
        subject: item.subject || local.subject,
        selectedAnswer: item.selectedAnswer ?? local.selectedAnswer,
        correctAnswer: item.correctAnswer ?? local.correctAnswer,
        errorCount: item.errorCount,
        lastAnsweredAt: item.lastAnsweredAt || local.lastAnsweredAt,
      };
    }

    // Não reconstruível (legado de outro aparelho): mantém apenas o mínimo.
    return {
      id: item.stableQuestionId,
      subject: item.subject,
      question: '',
      options: [],
      selectedAnswer: item.selectedAnswer ?? '',
      correctAnswer: item.correctAnswer ?? '',
      externalId: item.externalId,
      originType: item.originType,
      source: item.source,
      year: item.year,
      area: item.area,
      topic: item.topic,
      errorCount: item.errorCount,
      lastAnsweredAt: item.lastAnsweredAt,
    };
  });
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
