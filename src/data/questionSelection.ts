import {
  getQuestionKey,
  isOfficialVerifiedQuestion,
  type Question,
} from './questionTypes';

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

function dedupeOfficialQuestions(questions: Question[]) {
  const seen = new Set<string>();
  const unique: Question[] = [];

  questions.forEach((question) => {
    if (!isOfficialVerifiedQuestion(question)) {
      return;
    }

    const key = getQuestionKey(question);

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    unique.push(question);
  });

  return unique;
}

function pickOfficialQuestions(
  pool: Question[],
  count: number,
  seenIds: Set<string>,
  random: () => number
) {
  if (count <= 0 || pool.length === 0) {
    return [] as Question[];
  }

  const unseen = pool.filter(
    (question) => !seenIds.has(getQuestionKey(question))
  );
  const seen = pool.filter((question) =>
    seenIds.has(getQuestionKey(question))
  );

  const ordered = [
    ...shuffleQuestions(unseen, random),
    ...shuffleQuestions(seen, random),
  ];

  return ordered.slice(0, Math.min(count, pool.length));
}

export function composeOfficialLessonQuestions(
  eligibleQuestions: Question[],
  { amount, seenQuestionIds = [], shuffleSeed }: LessonSelectionOptions
) {
  const safeAmount = Math.max(amount, 0);
  const random = createRandom(shuffleSeed);

  const officialPool = dedupeOfficialQuestions(eligibleQuestions);

  if (safeAmount === 0 || officialPool.length === 0) {
    return [];
  }

  const seenIds = new Set(seenQuestionIds);
  const targetCount = Math.min(safeAmount, officialPool.length);
  const picked = pickOfficialQuestions(
    officialPool,
    targetCount,
    seenIds,
    random
  );

  return shuffleQuestions(picked, random).map((question) => ({ ...question }));
}
