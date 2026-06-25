import fs from 'node:fs';
import path from 'node:path';
import {
  enem2023Day2AnnulledRegistry,
  enem2023Day2StagingQuestions,
  enem2023Day2TextQuestions,
  enem2023Day2VerifiedQuestions,
} from '../src/data/questions/enem/2023/day2';
import { officialQuestionBank } from '../src/data/questionBank';
import {
  auditQuestionDuplicates,
  buildQuestionFingerprint,
} from '../src/data/questionFingerprint';
import type { Question } from '../src/data/questionTypes';

const manifest = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'docs/imports/enem/2023/day2/filter-manifest.json'),
    'utf8'
  )
) as {
  items: Array<{
    externalId: string;
    questionNumber: number;
    area: string;
    ingestionStatus: string;
    requiresMedia: boolean;
    officialStatus: string;
    eligibleForScoredSessions: boolean;
    answerKey: string | null;
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

const readyManifestItems = manifest.items.filter(
  (item) =>
    item.ingestionStatus === 'ready_text' &&
    !item.requiresMedia &&
    item.officialStatus === 'valid' &&
    item.eligibleForScoredSessions
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
        return [...block.columns, ...block.rows.flat(), block.caption ?? ''].join(
          ' '
        );
      })
      .join(' ') ?? '';

  const blob = [
    question.prompt,
    question.question,
    question.supportTitle,
    question.supportText,
    question.sourceCitation,
    blockText,
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

  if (question.officialStatus !== 'valid') {
    errors.push(`officialStatus=${question.officialStatus ?? 'undefined'}`);
  }

  if (question.eligibleForScoredSessions !== true) {
    errors.push('eligibleForScoredSessions=false');
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

  question.contentBlocks?.forEach((block) => {
    if (block.type === 'formula' && !block.fallbackText.trim()) {
      errors.push('fórmula sem fallbackText');
    }
    if (block.type === 'table') {
      if (block.columns.length === 0) {
        errors.push('tabela sem colunas');
      }
      if (block.rows.length === 0) {
        errors.push('tabela sem linhas');
      }
    }
  });

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

console.log('=== Auditoria ENEM 2023 D2 — texto integral ===');
assertCount('Registros processados', enem2023Day2TextQuestions.length, 55);
assertCount('Verificadas', enem2023Day2VerifiedQuestions.length, 55);
assertCount('Staging', enem2023Day2StagingQuestions.length, 0);

const natureCount = enem2023Day2TextQuestions.filter(
  (question) => question.area === 'Ciências da Natureza'
).length;
const mathCount = enem2023Day2TextQuestions.filter(
  (question) => question.area === 'Matemática'
).length;

assertCount('Ciências da Natureza', natureCount, 32);
assertCount('Matemática', mathCount, 23);

const annulled = enem2023Day2AnnulledRegistry.find(
  (item) => item.externalId === 'ENEM-2023-D2-C5-Q177'
);
if (!annulled) {
  fail('Q177 ausente do registro histórico');
}
if (annulled.answerKey !== null) {
  fail('Q177 deve ter answerKey null');
}
if (annulled.officialStatus !== 'annulled') {
  fail('Q177 deve ter officialStatus annulled');
}
if (annulled.eligibleForScoredSessions !== false) {
  fail('Q177 deve ser inelegível para sessões pontuadas');
}

const runtimeHas177 = officialQuestionBank.some(
  (question) => question.externalId === 'ENEM-2023-D2-C5-Q177'
);
if (runtimeHas177) {
  fail('Q177 presente no banco pontuado');
}

const ids = enem2023Day2TextQuestions.map((question) =>
  String(question.externalId ?? question.id)
);
const uniqueIds = new Set(ids);
if (uniqueIds.size !== ids.length) {
  fail('IDs duplicados no lote ENEM 2023 D2');
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
enem2023Day2TextQuestions.forEach((question) => {
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
const stagingFingerprints = enem2023Day2TextQuestions
  .filter((question) => !question.verified)
  .map((question) => buildQuestionFingerprint(question));

for (const fingerprint of stagingFingerprints) {
  if (runtimeFingerprints.has(fingerprint)) {
    fail('Fingerprint textual duplicada contra banco runtime');
  }
}

console.log('IDs únicos: OK');
console.log('Gabaritos vs manifesto: OK');
console.log('Q177 fora do banco pontuado: OK');
console.log('Duplicatas exatas contra banco atual: 0');
console.log(
  `Possíveis duplicatas por similaridade: ${duplicateReport.highSimilarity.length}`
);
duplicateReport.highSimilarity.slice(0, 5).forEach((item) => {
  console.log(
    `  ${item.idA} ~ ${item.idB} (${(item.similarity * 100).toFixed(1)}%) — ${item.reason}`
  );
});

console.log('\nAuditoria ENEM 2023 D2 concluída com sucesso.');
