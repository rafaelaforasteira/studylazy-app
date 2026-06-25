import fs from 'node:fs';
import path from 'node:path';
import {
  enem2023Day1StagingQuestions,
  enem2023Day1TextQuestions,
  enem2023Day1VerifiedQuestions,
} from '../src/data/questions/enem/2023/day1';
import { officialQuestionBank } from '../src/data/questionBank';
import {
  auditQuestionDuplicates,
  buildQuestionFingerprint,
} from '../src/data/questionFingerprint';
import type { Question } from '../src/data/questionTypes';

const manifest = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'docs/imports/enem/2023/filter-manifest.json'),
    'utf8'
  )
) as {
  items: Array<{
    externalId: string;
    ingestionStatus: string;
    requiresMedia: boolean;
    answerKey: string;
  }>;
};

const BROKEN_PATTERNS = [
  '\uFFFD',
  'Ã§',
  'Ã£',
  'Ã©',
  'â€œ',
  'â€',
  'â€”',
  'undefined',
  'NaN',
];

const EXCLUDED_MEDIA_IDS = new Set([
  'ENEM-2023-D1-C1-ING-05',
  'ENEM-2023-D1-C1-ESP-01',
  'ENEM-2023-D1-C1-Q24',
  'ENEM-2023-D1-C1-Q33',
  'ENEM-2023-D1-C1-Q34',
  'ENEM-2023-D1-C1-Q44',
  'ENEM-2023-D1-C1-Q46',
  'ENEM-2023-D1-C1-Q56',
  'ENEM-2023-D1-C1-Q72',
  'ENEM-2023-D1-C1-Q76',
  'ENEM-2023-D1-C1-Q89',
  'ENEM-2023-D1-C1-REDACAO',
]);

const readyManifestItems = manifest.items.filter(
  (item) => item.ingestionStatus === 'ready_text' && !item.requiresMedia
);

const expectedIds = new Set(readyManifestItems.map((item) => item.externalId));

function fail(message: string) {
  console.error(`FALHA: ${message}`);
  process.exit(1);
}

function assertCount(label: string, actual: number, expected: number) {
  if (actual !== expected) {
    fail(`${label}: esperado ${expected}, encontrado ${actual}`);
  }
}

function containsBrokenText(question: Question) {
  const blob = [
    question.prompt,
    question.question,
    question.supportTitle,
    question.supportText,
    question.sourceCitation,
    question.explanation,
    ...question.options,
  ]
    .filter(Boolean)
    .join(' ');

  return BROKEN_PATTERNS.some((pattern) => blob.includes(pattern));
}

function getCorrectLetter(question: Question) {
  const match = question.correctAnswer.match(/^([A-E])\)/);
  return match?.[1];
}

function auditQuestion(question: Question) {
  const id = String(question.externalId ?? question.id);
  const errors: string[] = [];

  if (!expectedIds.has(id)) {
    errors.push('ID inesperado no lote textual');
  }

  if (EXCLUDED_MEDIA_IDS.has(id)) {
    errors.push('ID dependente de mídia incluído indevidamente');
  }

  if (question.options.length !== 5) {
    errors.push(`alternativas=${question.options.length}`);
  }

  if (question.options.some((option) => !option.trim())) {
    errors.push('alternativa vazia');
  }

  if (!question.prompt?.trim()) {
    errors.push('prompt vazio');
  }

  if (question.requiresImage) {
    errors.push('requiresImage=true');
  }

  if (question.requiresMedia) {
    errors.push('requiresMedia=true');
  }

  if (containsBrokenText(question)) {
    errors.push('caractere/resíduo quebrado');
  }

  const manifestItem = readyManifestItems.find((item) => item.externalId === id);
  const letter = getCorrectLetter(question);
  if (!letter) {
    errors.push('gabarito inválido');
  } else if (manifestItem && manifestItem.answerKey !== letter) {
    errors.push(
      `gabarito divergente (manifesto=${manifestItem.answerKey}, banco=${letter})`
    );
  }

  if (!question.options.includes(question.correctAnswer)) {
    errors.push('correctAnswer fora das alternativas');
  }

  return errors;
}

console.log('=== Auditoria ENEM 2023 — texto integral ===');
assertCount('Registros processados', enem2023Day1TextQuestions.length, 84);
assertCount('Verificadas', enem2023Day1VerifiedQuestions.length, 84);
assertCount('Staging', enem2023Day1StagingQuestions.length, 0);

const foreignCount = enem2023Day1TextQuestions.filter(
  (question) => question.languageTrack === 'english' || question.languageTrack === 'spanish'
).length;
const languagesCount = enem2023Day1TextQuestions.filter(
  (question) => !question.languageTrack && question.area === 'Linguagens'
).length;
const humanCount = enem2023Day1TextQuestions.filter(
  (question) => question.area === 'Ciências Humanas'
).length;

assertCount('Língua estrangeira', foreignCount, 8);
assertCount('Linguagens comuns', languagesCount, 36);
assertCount('Ciências Humanas', humanCount, 40);

const ids = enem2023Day1TextQuestions.map((question) =>
  String(question.externalId ?? question.id)
);
const uniqueIds = new Set(ids);
if (uniqueIds.size !== ids.length) {
  fail('IDs duplicados no lote ENEM 2023');
}

for (const expectedId of expectedIds) {
  if (!uniqueIds.has(expectedId)) {
    fail(`ID esperado ausente: ${expectedId}`);
  }
}

for (const id of uniqueIds) {
  if (!expectedIds.has(id)) {
    fail(`ID inesperado: ${id}`);
  }
}

const problems: { id: string; errors: string[] }[] = [];
enem2023Day1TextQuestions.forEach((question) => {
  const errors = auditQuestion(question);
  if (errors.length > 0) {
    problems.push({
      id: String(question.externalId ?? question.id),
      errors,
    });
  }
});

if (problems.length > 0) {
  problems.forEach((problem) => {
    console.error(`${problem.id}: ${problem.errors.join('; ')}`);
  });
  fail(`${problems.length} questões com problemas`);
}

const duplicateReport = auditQuestionDuplicates(officialQuestionBank);

if (duplicateReport.externalIdDuplicates.length > 0) {
  fail(
    `Duplicatas por externalId: ${duplicateReport.externalIdDuplicates
      .map((group) => group.join(' / '))
      .join(', ')}`
  );
}

if (duplicateReport.identityDuplicates.length > 0) {
  fail(
    `Duplicatas por identidade oficial: ${duplicateReport.identityDuplicates
      .map((group) => group.join(' / '))
      .join(', ')}`
  );
}

if (duplicateReport.fingerprintDuplicates.length > 0) {
  fail(
    `Duplicatas por fingerprint: ${duplicateReport.fingerprintDuplicates
      .map((group) => group.join(' / '))
      .join(', ')}`
  );
}

const runtimeFingerprints = new Set(
  officialQuestionBank.map((question) => buildQuestionFingerprint(question))
);
const stagingFingerprints = enem2023Day1TextQuestions
  .filter((question) => !question.verified)
  .map((question) => buildQuestionFingerprint(question));

for (const fingerprint of stagingFingerprints) {
  if (runtimeFingerprints.has(fingerprint)) {
    fail('Fingerprint textual duplicada contra banco runtime');
  }
}

console.log('IDs únicos: OK');
console.log('Gabaritos vs manifesto: OK');
console.log('Duplicatas exatas contra banco atual: 0');
console.log(
  `Possíveis duplicatas por similaridade: ${duplicateReport.highSimilarity.length}`
);
duplicateReport.highSimilarity.slice(0, 5).forEach((item) => {
  console.log(
    `  ${item.idA} ~ ${item.idB} (${(item.similarity * 100).toFixed(1)}%) — ${item.reason}`
  );
});

console.log('\nAuditoria ENEM 2023 concluída com sucesso.');
