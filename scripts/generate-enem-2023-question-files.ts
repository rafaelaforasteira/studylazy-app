/**
 * Generate ENEM 2023 day1 question TS modules from parsed JSON.
 * Run: npx tsx scripts/generate-enem-2023-question-files.ts
 */
import fs from 'node:fs';
import path from 'node:path';

type ParsedQuestion = {
  externalId: string;
  questionNumber: number;
  languageTrack: 'english' | 'spanish' | null;
  area: 'languages' | 'human_sciences';
  answerKey: string;
  supportTitle?: string;
  supportText?: string;
  sourceCitation?: string;
  prompt: string;
  contentFormat: 'prose' | 'verse';
  options: { id: string; text: string }[];
  parseIssues: string[];
};

const ROOT = process.cwd();
const PARSED_PATH = path.join(ROOT, 'docs/imports/enem/2023/parsed-questions.json');
const OUT_DIR = path.join(ROOT, 'src/data/questions/enem/2023/day1');

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
  if (q.languageTrack === 'english') {
    return 'Interpretação de texto em língua inglesa';
  }
  if (q.languageTrack === 'spanish') {
    return 'Interpretação de texto em língua espanhola';
  }
  if (q.area === 'human_sciences') {
    const p = `${q.prompt} ${q.supportText ?? ''}`.toLowerCase();
    if (/geograf|territ|clima|solo|região|paisagem|urban/.test(p)) return 'Geografia';
    if (/filosof|ética|moral|exist/.test(p)) return 'Filosofia';
    if (/socio|sociedade|cidad|direito|polític/.test(p)) return 'Sociologia';
    return 'História';
  }
  const p = `${q.prompt} ${q.supportText ?? ''}`.toLowerCase();
  if (/literat|poema|romance|narrat|autor/.test(p)) return 'Literatura';
  if (/art|músic|cinema|teatro|dança/.test(p)) return 'Artes';
  if (/inglês|espanhol|língua|lingu/.test(p)) return 'Língua Portuguesa';
  return 'Língua Portuguesa';
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

function renderQuestion(q: ParsedQuestion) {
  const fields: string[] = [
    `externalId: '${q.externalId}'`,
    `questionNumber: ${q.questionNumber}`,
    `languageTrack: ${q.languageTrack ? `'${q.languageTrack}'` : 'null'}`,
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
  if (q.contentFormat === 'verse') {
    fields.push(`contentFormat: 'verse'`);
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

  return `  buildEnem2023Question({\n    ${fields.join(',\n    ')}\n  })`;
}

function writeModule(
  filename: string,
  exportName: string,
  questions: ParsedQuestion[]
) {
  const body = questions.map(renderQuestion).join(',\n');
  const content = `import { buildEnem2023Question } from './buildQuestion';

export const ${exportName}: ReturnType<typeof buildEnem2023Question>[] = [
${body},
];
`;
  fs.writeFileSync(path.join(OUT_DIR, filename), content, 'utf8');
}

const foreign = parsed.questions.filter((q) => q.languageTrack !== null);
const languages = parsed.questions.filter(
  (q) => q.languageTrack === null && q.area === 'languages'
);
const human = parsed.questions.filter((q) => q.area === 'human_sciences');

fs.mkdirSync(OUT_DIR, { recursive: true });

writeModule('foreignLanguages.ts', 'foreignLanguageQuestions', foreign);
writeModule('languages.ts', 'languageQuestions', languages);
writeModule('humanSciences.ts', 'humanSciencesQuestions', human);

const indexContent = `import { foreignLanguageQuestions } from './foreignLanguages';
import { humanSciencesQuestions } from './humanSciences';
import { languageQuestions } from './languages';

export { buildEnem2023Question } from './buildQuestion';
export { foreignLanguageQuestions } from './foreignLanguages';
export { languageQuestions } from './languages';
export { humanSciencesQuestions } from './humanSciences';

export const enem2023Day1TextQuestions = [
  ...foreignLanguageQuestions,
  ...languageQuestions,
  ...humanSciencesQuestions,
];

export const enem2023Day1VerifiedQuestions = enem2023Day1TextQuestions.filter(
  (question) => question.verified
);

export const enem2023Day1StagingQuestions = enem2023Day1TextQuestions.filter(
  (question) => !question.verified
);
`;

fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), indexContent, 'utf8');

console.log(`Generated ${foreign.length} foreign, ${languages.length} languages, ${human.length} human`);
console.log(`Verified: ${parsed.questions.filter(isVerified).length}/${parsed.questions.length}`);
