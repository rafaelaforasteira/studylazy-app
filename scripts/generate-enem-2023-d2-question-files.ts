/**
 * Generate ENEM 2023 day2 question TS modules from parsed JSON.
 * Run: npx tsx scripts/generate-enem-2023-d2-question-files.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import type { QuestionContentBlock } from '../src/data/questionTypes';

type ParsedQuestion = {
  externalId: string;
  questionNumber: number;
  area: 'natural_sciences' | 'mathematics';
  answerKey: string;
  supportTitle?: string;
  supportText?: string;
  sourceCitation?: string;
  contentBlocks?: QuestionContentBlock[];
  prompt: string;
  options: { id: string; text: string }[];
  parseIssues: string[];
};

const ROOT = process.cwd();
const PARSED_PATH = path.join(
  ROOT,
  'docs/imports/enem/2023/day2/parsed-questions.json'
);
const OUT_DIR = path.join(ROOT, 'src/data/questions/enem/2023/day2');

const parsed = JSON.parse(fs.readFileSync(PARSED_PATH, 'utf8')) as {
  questions: ParsedQuestion[];
};

function escapeString(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

function inferTopic(q: ParsedQuestion) {
  const blob = `${q.prompt} ${q.supportText ?? ''}`.toLowerCase();
  if (q.area === 'mathematics') {
    if (/probabil|chance|sorteio/.test(blob)) return 'Probabilidade';
    if (/estat|média|mediana|dados/.test(blob)) return 'Estatística';
    if (/geometr|ângulo|triângulo|área|volume|metro/.test(blob))
      return 'Geometria';
    if (/funç|gráfico|equaç/.test(blob)) return 'Funções';
    if (/porcent|juros|desconto|lucro/.test(blob)) return 'Matemática financeira';
    if (/razão|propor/.test(blob)) return 'Razão e proporção';
    return 'Aritmética';
  }
  if (/físic|força|energia|onda|corrente|campo|velocidade/.test(blob))
    return 'Física';
  if (/químic|mol|átomo|reação|ph|solução/.test(blob)) return 'Química';
  return 'Biologia';
}

function isVerified(q: ParsedQuestion) {
  return (
    q.options.length === 5 &&
    q.parseIssues.length === 0 &&
    q.prompt.trim().length > 10 &&
    q.options.every((o) => o.text.trim().length > 0) &&
    !/[]|Ã§|Ã£|Ã©|â€œ|â€|undefined|NaN/.test(
      `${q.prompt}${q.supportText ?? ''}${q.options.map((o) => o.text).join('')}`
    )
  );
}

function renderContentBlocks(blocks?: QuestionContentBlock[]) {
  if (!blocks?.length) return null;
  const rendered = blocks
    .map((block) => {
      if (block.type === 'paragraph') {
        return `      { type: 'paragraph', text: \`${escapeString(block.text)}\` }`;
      }
      if (block.type === 'formula') {
        return `      { type: 'formula', latex: \`${escapeString(block.latex)}\`, fallbackText: \`${escapeString(block.fallbackText)}\` }`;
      }
      if (block.type === 'citation') {
        return `      { type: 'citation', text: \`${escapeString(block.text)}\` }`;
      }
      if (block.type === 'list') {
        const items = block.items
          .map((item) => `\`${escapeString(item)}\``)
          .join(', ');
        return `      { type: 'list', items: [${items}] }`;
      }
      const columns = block.columns
        .map((column) => `\`${escapeString(column)}\``)
        .join(', ');
      const rows = block.rows
        .map(
          (row) =>
            `[${row.map((cell) => `\`${escapeString(cell)}\``).join(', ')}]`
        )
        .join(', ');
      const caption = block.caption
        ? `, caption: \`${escapeString(block.caption)}\``
        : '';
      return `      { type: 'table', columns: [${columns}], rows: [${rows}]${caption} }`;
    })
    .join(',\n');
  return `contentBlocks: [\n${rendered}\n    ]`;
}

function renderQuestion(q: ParsedQuestion) {
  const fields: string[] = [
    `externalId: '${q.externalId}'`,
    `questionNumber: ${q.questionNumber}`,
    `area: '${q.area}'`,
    `topic: '${inferTopic(q).replace(/'/g, "\\'")}'`,
    `prompt: \`${escapeString(q.prompt)}\``,
  ];

  if (q.supportTitle) {
    fields.push(`supportTitle: \`${escapeString(q.supportTitle)}\``);
  }
  if (q.supportText) {
    fields.push(`supportText: \`${escapeString(q.supportText)}\``);
  }
  if (q.sourceCitation) {
    fields.push(`sourceCitation: \`${escapeString(q.sourceCitation)}\``);
  }

  const blocksField = renderContentBlocks(q.contentBlocks);
  if (blocksField) {
    fields.push(blocksField);
  }

  const options = q.options
    .map(
      (o) =>
        `      { id: '${o.id}', text: \`${escapeString(o.text)}\` }`
    )
    .join(',\n');

  fields.push(
    `options: [\n${options}\n    ]`,
    `correctAnswerId: '${q.answerKey}'`,
    `verified: ${isVerified(q)}`
  );

  return `  buildEnem2023Day2Question({\n    ${fields.join(',\n    ')}\n  })`;
}

function writeModule(
  filename: string,
  exportName: string,
  questions: ParsedQuestion[]
) {
  const body = questions.map(renderQuestion).join(',\n');
  const content = `import { buildEnem2023Day2Question } from './buildQuestion';

export const ${exportName}: ReturnType<typeof buildEnem2023Day2Question>[] = [
${body},
];
`;
  fs.writeFileSync(path.join(OUT_DIR, filename), content, 'utf8');
}

const natural = parsed.questions.filter((q) => q.area === 'natural_sciences');
const math = parsed.questions.filter((q) => q.area === 'mathematics');

fs.mkdirSync(OUT_DIR, { recursive: true });

writeModule('naturalSciences.ts', 'naturalSciencesQuestions', natural);
writeModule('mathematics.ts', 'mathematicsQuestions', math);

const annulledContent = `export const enem2023Day2AnnulledRegistry = [
  {
    externalId: 'ENEM-2023-D2-C5-Q177',
    questionNumber: 177,
    area: 'mathematics',
    subject: 'Matemática',
    source: 'ENEM 2023',
    year: 2023,
    examDay: 2,
    booklet: 'Caderno 5 — Amarelo',
    officialStatus: 'annulled',
    eligibleForScoredSessions: false,
    answerKey: null,
    verified: false,
    sourceVerified: true,
    requiresMedia: true,
    mediaType: 'bar_chart',
    note: 'Questão anulada no gabarito oficial. Registro histórico apenas; não integrar sessões pontuadas.',
  },
] as const;
`;

fs.writeFileSync(
  path.join(OUT_DIR, 'annulledRegistry.ts'),
  annulledContent,
  'utf8'
);

const indexContent = `import { naturalSciencesQuestions } from './naturalSciences';
import { mathematicsQuestions } from './mathematics';

export { buildEnem2023Day2Question } from './buildQuestion';
export { enem2023Day2AnnulledRegistry } from './annulledRegistry';
export { naturalSciencesQuestions } from './naturalSciences';
export { mathematicsQuestions } from './mathematics';

export const enem2023Day2TextQuestions = [
  ...naturalSciencesQuestions,
  ...mathematicsQuestions,
];

export const enem2023Day2VerifiedQuestions = enem2023Day2TextQuestions.filter(
  (question) => question.verified
);

export const enem2023Day2StagingQuestions = enem2023Day2TextQuestions.filter(
  (question) => !question.verified
);
`;

fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), indexContent, 'utf8');

console.log(
  `Generated ${natural.length} nature, ${math.length} math, verified ${parsed.questions.filter(isVerified).length}/${parsed.questions.length}`
);
