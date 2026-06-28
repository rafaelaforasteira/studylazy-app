import {
  getStableQuestionId,
  isOfficialVerifiedQuestion,
  type Question,
} from './questionTypes';

/**
 * Motor Inteligente de Seleção e Antirrepetição.
 *
 * Regras de pontuação centralizadas. Valores maiores => maior prioridade.
 * Mantidos aqui, em um único lugar, para serem testáveis e documentados.
 */
export const SELECTION_WEIGHTS = {
  /** Questão nunca respondida: prioridade muito alta. */
  unseen: 1000,
  /** Último resultado foi incorreto: prioridade alta. */
  incorrectLast: 600,
  /** Possui qualquer erro no histórico: reforço adicional. */
  hasIncorrectHistory: 250,
  /** Pertence a um tópico com baixo desempenho: prioridade intermediária. */
  lowTopicPerformance: 300,
  /** Bônus por dia desde a última vez que apareceu. */
  agePerDay: 8,
  /** Teto do bônus de tempo sem aparecer. */
  ageMax: 200,
  /** Penalidade por estar na janela de questões recentes. */
  recentPenalty: 800,
  /** Penalidade adicional por ter sido respondida corretamente há pouco. */
  recentlyCorrectPenalty: 400,
} as const;

/** Abaixo deste acerto médio, o tópico é considerado de baixo desempenho. */
export const LOW_TOPIC_ACCURACY_THRESHOLD = 0.6;

/** Participação máxima de um único tópico na sessão (quando há alternativas). */
export const MAX_TOPIC_SHARE = 0.4;

/** Janela considerada "recente" para antirrepetição entre sessões. */
export const RECENT_WINDOW = 30;

export type QuestionPerformanceLike = {
  stableQuestionId?: string;
  attempts?: number;
  correctAttempts?: number;
  incorrectAttempts?: number;
  lastAnsweredAt?: string | null;
  lastResult?: 'correct' | 'incorrect' | null;
};

export type SmartSelectionParams = {
  questions: Question[];
  requestedCount: number;
  subject?: string;
  topic?: string;
  performanceByQuestion?: Record<string, QuestionPerformanceLike>;
  recentQuestionIds?: string[];
  /** Timestamp (ms) usado para cálculos de tempo; injetável para testes. */
  now?: number;
  /** Função de aleatoriedade injetável para reprodutibilidade. */
  random?: () => number;
  shuffleSeed?: number;
};

export type SmartSelectionDiagnostics = {
  eligibleCount: number;
  selectedCount: number;
  unseenCount: number;
  incorrectCount: number;
  recentCountAvoided: number;
  repeatedIds: string[];
};

export type SmartSelectionResult = {
  questions: Question[];
  diagnostics: SmartSelectionDiagnostics;
};

type ScoredQuestion = {
  question: Question;
  stableId: string;
  topic: string;
  score: number;
  isUnseen: boolean;
  hasIncorrect: boolean;
  tieBreak: number;
};

function mulberry32(seed: number) {
  let value = seed;

  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createRandom(random?: () => number, shuffleSeed?: number) {
  if (random) {
    return random;
  }

  if (shuffleSeed !== undefined) {
    return mulberry32(shuffleSeed);
  }

  return Math.random;
}

export function shuffleQuestions<T>(
  items: T[],
  random: () => number = Math.random
) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

/**
 * Filtra somente questões oficiais, verificadas, pontuáveis e sem mídia,
 * removendo duplicatas por identificador estável. Respeita matéria e tópico.
 */
function buildEligiblePool(params: {
  questions: Question[];
  subject?: string;
  topic?: string;
}) {
  const { questions, subject, topic } = params;
  const seen = new Set<string>();
  const pool: Question[] = [];

  questions.forEach((question) => {
    if (!isOfficialVerifiedQuestion(question)) {
      return;
    }

    if (subject && question.subject !== subject) {
      return;
    }

    if (topic && question.topic !== topic) {
      return;
    }

    const stableId = getStableQuestionId(question);

    // Ignora IDs vazios/inválidos e duplicatas por identificador estável.
    if (!stableId || stableId.trim().length === 0) {
      return;
    }

    if (seen.has(stableId)) {
      return;
    }

    seen.add(stableId);
    pool.push(question);
  });

  return pool;
}

function computeTopicAccuracy(
  pool: Question[],
  performanceByQuestion: Record<string, QuestionPerformanceLike>
) {
  const aggregate = new Map<
    string,
    { attempts: number; correct: number }
  >();

  pool.forEach((question) => {
    const stableId = getStableQuestionId(question);
    const perf = performanceByQuestion[stableId];

    if (!perf || !perf.attempts) {
      return;
    }

    const topic = question.topic ?? '—';
    const current = aggregate.get(topic) ?? { attempts: 0, correct: 0 };

    current.attempts += perf.attempts ?? 0;
    current.correct += perf.correctAttempts ?? 0;
    aggregate.set(topic, current);
  });

  const accuracyByTopic = new Map<string, number>();
  aggregate.forEach((value, topic) => {
    if (value.attempts > 0) {
      accuracyByTopic.set(topic, value.correct / value.attempts);
    }
  });

  return accuracyByTopic;
}

function scoreQuestion(params: {
  question: Question;
  performance?: QuestionPerformanceLike;
  recentIndex: number;
  lowTopicPerformance: boolean;
  now: number;
  random: () => number;
}): ScoredQuestion {
  const { question, performance, recentIndex, lowTopicPerformance, now, random } =
    params;

  const stableId = getStableQuestionId(question);
  const topic = question.topic ?? '—';

  const attempts = performance?.attempts ?? 0;
  const isUnseen = !performance || attempts === 0;
  const hasIncorrect = (performance?.incorrectAttempts ?? 0) > 0;

  let score = 0;

  if (isUnseen) {
    score += SELECTION_WEIGHTS.unseen;
  } else {
    if (performance?.lastResult === 'incorrect') {
      score += SELECTION_WEIGHTS.incorrectLast;
    }

    if (hasIncorrect) {
      score += SELECTION_WEIGHTS.hasIncorrectHistory;
    }

    if (performance?.lastAnsweredAt) {
      const lastMs = Date.parse(performance.lastAnsweredAt);
      if (!Number.isNaN(lastMs)) {
        const days = Math.max(0, (now - lastMs) / 86_400_000);
        score += Math.min(days * SELECTION_WEIGHTS.agePerDay, SELECTION_WEIGHTS.ageMax);
      }
    }

    if (performance?.lastResult === 'correct') {
      score -= SELECTION_WEIGHTS.recentlyCorrectPenalty;
    }
  }

  if (lowTopicPerformance) {
    score += SELECTION_WEIGHTS.lowTopicPerformance;
  }

  if (recentIndex >= 0) {
    const recencyStrength = (RECENT_WINDOW - recentIndex) / RECENT_WINDOW;
    score -= SELECTION_WEIGHTS.recentPenalty * Math.max(recencyStrength, 0);
  }

  return {
    question,
    stableId,
    topic,
    score,
    isUnseen,
    hasIncorrect,
    tieBreak: random(),
  };
}

/**
 * Seleciona questões aplicando antirrepetição, priorização e equilíbrio por
 * tópico. Função pura: não toca em stores nem em efeitos colaterais.
 */
export function selectSmartQuestions(
  params: SmartSelectionParams
): SmartSelectionResult {
  const {
    questions,
    requestedCount,
    subject,
    topic,
    performanceByQuestion = {},
    recentQuestionIds = [],
    now = Date.now(),
    random: providedRandom,
    shuffleSeed,
  } = params;

  const random = createRandom(providedRandom, shuffleSeed);

  // Proteções de entrada: quantidade não numérica/negativa, histórico ausente
  // ou malformado, IDs recentes inválidos. Nada disso deve quebrar a seleção.
  const safeCount = Number.isFinite(requestedCount)
    ? Math.max(0, Math.floor(requestedCount))
    : 0;

  const safePerformance =
    performanceByQuestion && typeof performanceByQuestion === 'object'
      ? performanceByQuestion
      : {};

  const safeRecent = Array.isArray(recentQuestionIds)
    ? recentQuestionIds.filter(
        (id): id is string => typeof id === 'string' && id.length > 0
      )
    : [];

  const safeQuestions = Array.isArray(questions) ? questions : [];

  const pool = buildEligiblePool({ questions: safeQuestions, subject, topic });

  const emptyDiagnostics: SmartSelectionDiagnostics = {
    eligibleCount: pool.length,
    selectedCount: 0,
    unseenCount: 0,
    incorrectCount: 0,
    recentCountAvoided: 0,
    repeatedIds: [],
  };

  if (safeCount === 0 || pool.length === 0) {
    return { questions: [], diagnostics: emptyDiagnostics };
  }

  const recentIndexById = new Map<string, number>();
  safeRecent.forEach((id, index) => {
    if (!recentIndexById.has(id)) {
      recentIndexById.set(id, index);
    }
  });

  const lowTopicAccuracy = computeTopicAccuracy(pool, safePerformance);

  const scored = pool.map((question) => {
    const stableId = getStableQuestionId(question);
    const questionTopic = question.topic ?? '—';
    const accuracy = lowTopicAccuracy.get(questionTopic);

    return scoreQuestion({
      question,
      performance: safePerformance[stableId],
      recentIndex: recentIndexById.get(stableId) ?? -1,
      lowTopicPerformance:
        accuracy !== undefined && accuracy < LOW_TOPIC_ACCURACY_THRESHOLD,
      now,
      random,
    });
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.tieBreak - b.tieBreak;
  });

  const targetCount = Math.min(safeCount, scored.length);
  const selected = applyTopicBalance(scored, targetCount);

  const selectedIds = selected.map((item) => item.stableId);
  const selectedIdSet = new Set(selectedIds);

  const repeatedIds: string[] = [];
  const seenIds = new Set<string>();
  selectedIds.forEach((id) => {
    if (seenIds.has(id)) {
      repeatedIds.push(id);
    }
    seenIds.add(id);
  });

  const recentCountAvoided = pool.reduce((count, question) => {
    const stableId = getStableQuestionId(question);
    if (recentIndexById.has(stableId) && !selectedIdSet.has(stableId)) {
      return count + 1;
    }
    return count;
  }, 0);

  const diagnostics: SmartSelectionDiagnostics = {
    eligibleCount: pool.length,
    selectedCount: selected.length,
    unseenCount: selected.filter((item) => item.isUnseen).length,
    incorrectCount: selected.filter((item) => item.hasIncorrect).length,
    recentCountAvoided,
    repeatedIds,
  };

  return {
    questions: selected.map((item) => ({ ...item.question })),
    diagnostics,
  };
}

/**
 * Distribui a seleção entre tópicos evitando concentração excessiva.
 *
 * O equilíbrio NUNCA reduz a prioridade: a base é sempre o top-N por
 * pontuação (que já respeita inéditas > erros > tópico fraco > antiguidade).
 * A diversificação só troca questões de MESMA pontuação (mesmo nível de
 * prioridade), garantindo que erros e inéditas jamais sejam descartados em
 * favor de questões de menor prioridade. Em sessões pequenas ou bancos
 * homogêneos, simplesmente respeita a ordem por pontuação.
 */
function applyTopicBalance(scored: ScoredQuestion[], targetCount: number) {
  if (targetCount <= 0) {
    return [];
  }

  // Base respeitando integralmente a prioridade.
  const selected = scored.slice(0, targetCount);

  const distinctTopics = new Set(scored.map((item) => item.topic));
  if (distinctTopics.size <= 1 || selected.length < targetCount) {
    return selected;
  }

  const perTopicCap = Math.max(1, Math.ceil(targetCount * MAX_TOPIC_SHARE));
  const rest = scored.slice(targetCount);

  const topicCounts = new Map<string, number>();
  selected.forEach((item) => {
    topicCounts.set(item.topic, (topicCounts.get(item.topic) ?? 0) + 1);
  });

  let changed = true;
  while (changed) {
    changed = false;

    // Procura, do fim para o início (menor prioridade dentro da base), uma
    // questão de um tópico acima do limite.
    for (let i = selected.length - 1; i >= 0; i -= 1) {
      const candidateOut = selected[i];
      if ((topicCounts.get(candidateOut.topic) ?? 0) <= perTopicCap) {
        continue;
      }

      // Substituto precisa ter a MESMA pontuação (mesma prioridade) e vir de
      // um tópico que ainda não estourou o limite.
      const replacementIndex = rest.findIndex(
        (candidate) =>
          candidate.score === candidateOut.score &&
          (topicCounts.get(candidate.topic) ?? 0) < perTopicCap
      );

      if (replacementIndex === -1) {
        continue;
      }

      const replacement = rest[replacementIndex];
      selected[i] = replacement;
      rest.splice(replacementIndex, 1);
      rest.push(candidateOut);

      topicCounts.set(
        candidateOut.topic,
        (topicCounts.get(candidateOut.topic) ?? 1) - 1
      );
      topicCounts.set(
        replacement.topic,
        (topicCounts.get(replacement.topic) ?? 0) + 1
      );

      changed = true;
      break;
    }
  }

  selected.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.tieBreak - b.tieBreak;
  });

  return selected;
}

// --- Compatibilidade retroativa -------------------------------------------

export type LessonSelectionOptions = {
  amount: number;
  seenQuestionIds?: string[];
  shuffleSeed?: number;
  performanceByQuestion?: Record<string, QuestionPerformanceLike>;
  recentQuestionIds?: string[];
  subject?: string;
  topic?: string;
  random?: () => number;
  now?: number;
};

/**
 * Mantida para compatibilidade. Delega ao motor inteligente para não duplicar
 * regras de elegibilidade ou antirrepetição.
 */
export function composeOfficialLessonQuestions(
  eligibleQuestions: Question[],
  {
    amount,
    seenQuestionIds = [],
    shuffleSeed,
    performanceByQuestion,
    recentQuestionIds,
    subject,
    topic,
    random,
    now,
  }: LessonSelectionOptions
) {
  const { questions } = selectSmartQuestions({
    questions: eligibleQuestions,
    requestedCount: amount,
    subject,
    topic,
    performanceByQuestion,
    recentQuestionIds: recentQuestionIds ?? seenQuestionIds,
    shuffleSeed,
    random,
    now,
  });

  return questions;
}

// --- Revisão de erros -------------------------------------------------------

export type ReviewMistakeLike = {
  id: string;
  externalId?: string;
  errorCount: number;
  lastAnsweredAt: string;
  corrected?: boolean;
};

export type ReviewSelectionParams<T extends ReviewMistakeLike> = {
  mistakes: T[];
  performanceByQuestion?: Record<string, QuestionPerformanceLike>;
  random?: () => number;
  shuffleSeed?: number;
};

function getMistakeStableId(mistake: ReviewMistakeLike) {
  if (
    typeof mistake.externalId === 'string' &&
    mistake.externalId.trim().length > 0
  ) {
    return mistake.externalId;
  }

  return mistake.id;
}

/**
 * Ordena erros para a revisão. Diferente da sessão normal:
 *  - prioriza erros ainda não corrigidos;
 *  - reforça erros mais frequentes;
 *  - evita repetição dentro da mesma revisão (dedupe por id estável).
 */
export function selectReviewMistakes<T extends ReviewMistakeLike>(
  params: ReviewSelectionParams<T>
): T[] {
  const { mistakes, random: providedRandom, shuffleSeed } = params;
  const random = createRandom(providedRandom, shuffleSeed);

  const seen = new Set<string>();
  const unique: T[] = [];

  mistakes.forEach((mistake) => {
    const stableId = getMistakeStableId(mistake);
    if (seen.has(stableId)) {
      return;
    }
    seen.add(stableId);
    unique.push(mistake);
  });

  const withTieBreak = unique.map((mistake) => ({
    mistake,
    tieBreak: random(),
  }));

  withTieBreak.sort((a, b) => {
    const aCorrected = a.mistake.corrected ? 1 : 0;
    const bCorrected = b.mistake.corrected ? 1 : 0;

    if (aCorrected !== bCorrected) {
      return aCorrected - bCorrected;
    }

    if (b.mistake.errorCount !== a.mistake.errorCount) {
      return b.mistake.errorCount - a.mistake.errorCount;
    }

    const aTime = Date.parse(a.mistake.lastAnsweredAt) || 0;
    const bTime = Date.parse(b.mistake.lastAnsweredAt) || 0;

    if (aTime !== bTime) {
      return aTime - bTime;
    }

    return a.tieBreak - b.tieBreak;
  });

  return withTieBreak.map((item) => item.mistake);
}
