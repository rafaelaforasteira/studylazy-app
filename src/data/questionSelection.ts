import type { Question } from './questionTypes';

export type LessonSelectionOptions = {
  amount: number;
  seenQuestionIds?: string[];
  shuffleSeed?: number;
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

function createRandom(shuffleSeed?: number) {
  if (shuffleSeed !== undefined) {
    return mulberry32(shuffleSeed);
  }

  return Math.random;
}

export function getQuestionKey(question: Question) {
  return String(question.externalId ?? question.id);
}

export function isEnemSourceQuestion(question: Question) {
  return Boolean(question.source?.startsWith('ENEM'));
}

export function shuffleQuestions(
  questions: Question[],
  random: () => number = Math.random
) {
  const copy = [...questions];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function pickFromPool(
  pool: Question[],
  count: number,
  usedKeys: Set<string>,
  seenIds: Set<string>,
  random: () => number
) {
  if (count <= 0 || pool.length === 0) {
    return [] as Question[];
  }

  const available = pool.filter(
    (question) => !usedKeys.has(getQuestionKey(question))
  );
  const unseen = available.filter(
    (question) => !seenIds.has(getQuestionKey(question))
  );
  const seen = available.filter((question) =>
    seenIds.has(getQuestionKey(question))
  );

  const ordered = [
    ...shuffleQuestions(unseen, random),
    ...shuffleQuestions(seen, random),
  ];

  return ordered.slice(0, count);
}

function pickWithRepeatFallback(
  pool: Question[],
  count: number,
  random: () => number
) {
  if (count <= 0 || pool.length === 0) {
    return [] as Question[];
  }

  const uniquePicked = shuffleQuestions(pool, random).slice(
    0,
    Math.min(count, pool.length)
  );

  if (uniquePicked.length >= count) {
    return uniquePicked;
  }

  const result = [...uniquePicked];
  const shuffledPool = shuffleQuestions(pool, random);

  while (result.length < count) {
    result.push(shuffledPool[result.length % shuffledPool.length]);
  }

  return result;
}

export function calculateEnemCount(
  amount: number,
  enemPoolSize: number,
  regularPoolSize: number,
  random: () => number = Math.random
) {
  if (enemPoolSize === 0 || amount === 0) {
    return 0;
  }

  if (regularPoolSize === 0) {
    return Math.min(amount, enemPoolSize);
  }

  const maxEnem = Math.min(enemPoolSize, Math.floor(amount * 0.4));
  let minEnem = 0;

  if (amount >= 3 && amount <= 5) {
    minEnem = 1;
  } else if (amount >= 6 && amount <= 10) {
    minEnem = 2;
  } else if (amount > 10) {
    minEnem = Math.ceil(amount * 0.2);
  }

  minEnem = Math.min(minEnem, maxEnem, amount, enemPoolSize);

  if (minEnem === 0) {
    return 0;
  }

  const spread = Math.max(0, maxEnem - minEnem);
  const extra = spread > 0 ? Math.floor(random() * (spread + 1)) : 0;

  return Math.min(enemPoolSize, amount, minEnem + extra);
}

export function composeLessonQuestions(
  eligibleQuestions: Question[],
  { amount, seenQuestionIds = [], shuffleSeed }: LessonSelectionOptions
) {
  const safeAmount = Math.max(amount, 0);
  const random = createRandom(shuffleSeed);

  if (safeAmount === 0 || eligibleQuestions.length === 0) {
    return [];
  }

  const seenIds = new Set(seenQuestionIds);
  const usedKeys = new Set<string>();

  const enemPool = eligibleQuestions.filter(isEnemSourceQuestion);
  const regularPool = eligibleQuestions.filter(
    (question) => !isEnemSourceQuestion(question)
  );

  const targetAmount = safeAmount;
  let enemCount = calculateEnemCount(
    targetAmount,
    enemPool.length,
    regularPool.length,
    random
  );

  let regularCount = targetAmount - enemCount;

  if (regularCount > regularPool.length) {
    regularCount = regularPool.length;
    enemCount = Math.min(enemPool.length, targetAmount - regularCount);
  }

  if (enemCount > enemPool.length) {
    enemCount = enemPool.length;
    regularCount = Math.min(regularPool.length, targetAmount - enemCount);
  }

  const enemPicked = pickFromPool(
    enemPool,
    enemCount,
    usedKeys,
    seenIds,
    random
  );
  enemPicked.forEach((question) => usedKeys.add(getQuestionKey(question)));

  const regularPicked = pickFromPool(
    regularPool,
    regularCount,
    usedKeys,
    seenIds,
    random
  );
  regularPicked.forEach((question) => usedKeys.add(getQuestionKey(question)));

  let session = [...enemPicked, ...regularPicked];

  if (session.length < targetAmount) {
    const remainingPool = eligibleQuestions.filter(
      (question) => !usedKeys.has(getQuestionKey(question))
    );
    const filler = pickFromPool(
      remainingPool,
      targetAmount - session.length,
      usedKeys,
      seenIds,
      random
    );
    filler.forEach((question) => usedKeys.add(getQuestionKey(question)));
    session = [...session, ...filler];
  }

  if (session.length < targetAmount) {
    const fallbackPool =
      eligibleQuestions.length > 0 ? eligibleQuestions : session;
    const repeated = pickWithRepeatFallback(
      fallbackPool,
      targetAmount - session.length,
      random
    );
    session = [...session, ...repeated];
  }

  return shuffleQuestions(session, random).map((question) => ({ ...question }));
}
