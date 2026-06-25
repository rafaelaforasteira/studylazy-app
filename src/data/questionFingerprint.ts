import type { Question } from './questionTypes';

/** Normalize text for duplicate fingerprint comparison. */
export function normalizeQuestionFingerprintText(text: string) {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

export function buildQuestionFingerprint(question: Question) {
  const blockText =
    question.contentBlocks
      ?.map((block) => {
        if (block.type === 'paragraph' || block.type === 'citation') {
          return block.text;
        }
        if (block.type === 'formula') {
          return block.fallbackText;
        }
        if (block.type === 'list') {
          return block.items.join(' ');
        }
        return [
          block.caption ?? '',
          ...block.columns,
          ...block.rows.flat(),
        ].join(' ');
      })
      .join('\n') ?? '';

  const parts = [
    question.supportTitle ?? '',
    question.supportText ?? '',
    blockText,
    question.sourceCitation ?? '',
    question.prompt ?? question.question,
    ...question.options,
  ];

  return normalizeQuestionFingerprintText(parts.join('\n'));
}

export type OfficialIdentity = {
  source: string;
  year: number;
  examDay: number;
  booklet: string;
  questionNumber: number;
  languageTrack: string | null;
};

export function getOfficialIdentity(question: Question): OfficialIdentity | null {
  if (
    !question.source ||
    typeof question.year !== 'number' ||
    typeof question.examDay !== 'number' ||
    !question.booklet ||
    typeof question.questionNumber !== 'number'
  ) {
    return null;
  }

  return {
    source: question.source,
    year: question.year,
    examDay: question.examDay,
    booklet: question.booklet,
    questionNumber: question.questionNumber,
    languageTrack: question.languageTrack ?? null,
  };
}

export function formatOfficialIdentityKey(identity: OfficialIdentity) {
  return [
    identity.source,
    identity.year,
    identity.examDay,
    identity.booklet,
    identity.questionNumber,
    identity.languageTrack ?? 'common',
  ].join('|');
}

function tokenize(text: string) {
  return normalizeQuestionFingerprintText(text)
    .split(/[^a-z0-9áàâãéêíóôõúç]+/i)
    .filter((token) => token.length > 2);
}

/** Jaccard similarity between two fingerprints (0–1). */
export function fingerprintSimilarity(a: string, b: string) {
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));

  if (tokensA.size === 0 && tokensB.size === 0) {
    return 1;
  }

  let intersection = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) {
      intersection += 1;
    }
  });

  const union = tokensA.size + tokensB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export type DuplicateReport = {
  externalIdDuplicates: string[][];
  identityDuplicates: string[][];
  fingerprintDuplicates: string[][];
  highSimilarity: {
    idA: string;
    idB: string;
    similarity: number;
    reason: string;
  }[];
};

export function auditQuestionDuplicates(questions: Question[]): DuplicateReport {
  const externalIdMap = new Map<string, string[]>();
  const identityMap = new Map<string, string[]>();
  const fingerprintMap = new Map<string, string[]>();

  questions.forEach((question) => {
    const id = String(question.externalId ?? question.id);
    const extIds = externalIdMap.get(id) ?? [];
    extIds.push(id);
    externalIdMap.set(id, extIds);

    const identity = getOfficialIdentity(question);
    if (identity) {
      const key = formatOfficialIdentityKey(identity);
      const ids = identityMap.get(key) ?? [];
      ids.push(id);
      identityMap.set(key, ids);
    }

    const fp = buildQuestionFingerprint(question);
    const fpIds = fingerprintMap.get(fp) ?? [];
    fpIds.push(id);
    fingerprintMap.set(fp, fpIds);
  });

  const externalIdDuplicates = [...externalIdMap.values()].filter(
    (group) => group.length > 1
  );
  const identityDuplicates = [...identityMap.values()].filter(
    (group) => group.length > 1
  );
  const fingerprintDuplicates = [...fingerprintMap.values()].filter(
    (group) => group.length > 1
  );

  const highSimilarity: DuplicateReport['highSimilarity'] = [];
  const fingerprints = questions.map((q) => ({
    id: String(q.externalId ?? q.id),
    fp: buildQuestionFingerprint(q),
    year: q.year,
  }));

  for (let i = 0; i < fingerprints.length; i += 1) {
    for (let j = i + 1; j < fingerprints.length; j += 1) {
      const a = fingerprints[i];
      const b = fingerprints[j];

      if (a.fp === b.fp) {
        continue;
      }

      const similarity = fingerprintSimilarity(a.fp, b.fp);
      if (similarity >= 0.85) {
        highSimilarity.push({
          idA: a.id,
          idB: b.id,
          similarity,
          reason:
            a.year !== b.year
              ? 'Alta similaridade textual entre anos diferentes (não é duplicata oficial)'
              : 'Alta similaridade textual — revisar manualmente',
        });
      }
    }
  }

  return {
    externalIdDuplicates,
    identityDuplicates,
    fingerprintDuplicates,
    highSimilarity,
  };
}
