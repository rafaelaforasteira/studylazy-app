import type { Question } from './questionTypes';

export function validateEnemQuestionBank(questions: Question[]) {
  const ids = new Set<string>();

  questions.forEach((question) => {
    const idKey = String(question.externalId ?? question.id);

    if (ids.has(idKey)) {
      throw new Error(`ID duplicado no banco ENEM: ${idKey}`);
    }

    ids.add(idKey);

    if (!question.question.trim()) {
      throw new Error(`Enunciado vazio: ${idKey}`);
    }

    if (question.options.length !== 5) {
      throw new Error(
        `Questão ${idKey} deve ter 5 alternativas (tem ${question.options.length})`
      );
    }

    if (!question.correctAnswer.trim()) {
      throw new Error(`Gabarito vazio: ${idKey}`);
    }

    if (!question.options.includes(question.correctAnswer)) {
      throw new Error(`Gabarito inválido para ${idKey}`);
    }

    if (!question.explanation?.trim()) {
      throw new Error(`Explicação vazia: ${idKey}`);
    }

    if (question.requiresImage) {
      throw new Error(`Questão ${idKey} não pode exigir imagem`);
    }
  });
}
