/**
 * Parse ENEM 2023 extracted PDF pages into structured question JSON.
 * Run: npx tsx scripts/parse-enem-2023-extracted.ts
 */
import fs from 'node:fs';
import path from 'node:path';

type ManifestItem = {
  externalId: string;
  questionNumber: number;
  languageTrack: 'english' | 'spanish' | null;
  area: 'languages' | 'human_sciences';
  answerKey: string;
  sourcePage: number;
  ingestionStatus: string;
  requiresMedia: boolean;
};

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
const EXTRACTED_DIR = path.join(ROOT, 'docs/imports/enem/2023/extracted');
const MANIFEST_PATH = path.join(ROOT, 'docs/imports/enem/2023/filter-manifest.json');
const OUT_PATH = path.join(ROOT, 'docs/imports/enem/2023/parsed-questions.json');

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as {
  items: ManifestItem[];
};

const readyItems = manifest.items.filter(
  (item) => item.ingestionStatus === 'ready_text' && !item.requiresMedia
);

function cleanLine(line: string) {
  return line
    .replace(/^\d+\t–.*$/i, '')
    .replace(/^\*010175AZ\d+\*$/i, '')
    .replace(/^LINGUAGENS.*$/i, '')
    .replace(/^CIÊNCIAS HUMANAS.*$/i, '')
    .replace(/^Questões de \d+ a \d+.*$/i, '')
    .replace(/^Questões de \d+ a \d+ \(opção.*$/i, '')
    .trim();
}

function isHeaderNoise(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (/^\d+\t–/.test(trimmed)) return true;
  if (/^\*010175AZ/.test(trimmed)) return true;
  if (/^LINGUAGENS/i.test(trimmed)) return true;
  if (/^CIÊNCIAS HUMANAS/i.test(trimmed)) return true;
  if (/^Questões de \d+/i.test(trimmed)) return true;
  return false;
}

function isOptionLine(line: string) {
  return /^[A-E]\t[A-E]\s/.test(line.trim());
}

function parseOptionLine(line: string) {
  const match = line.trim().match(/^([A-E])\t[A-E]\s+(.*)$/);
  if (!match) return null;
  return { id: match[1], text: match[2].trim() };
}

function isCitationLine(line: string) {
  const t = line.trim();
  return (
    /Disponível em:/i.test(t) ||
    /^apud /i.test(t) ||
    /, \d{4}\s*\(/.test(t) ||
    /Press, \d{4}/.test(t) ||
    /São Paulo:/.test(t) ||
    /Londres:/.test(t) ||
    /Houston:/.test(t) ||
    /Delaware:/.test(t) ||
    /maio-ago\. \d{4}/.test(t) ||
    /jan\.-jun\. \d{4}/.test(t) ||
    /jan\.-abr\. \d{4}/.test(t) ||
    /n\. \d+,/.test(t) ||
    /Revista /.test(t) ||
    /CALAÇA/.test(t) ||
    /SCARELI/.test(t) ||
    /NINIO/.test(t) ||
    /ALVES/.test(t) ||
    /ARRAES/.test(t) ||
    /AGUALUSA/.test(t) ||
    /DONEGÁ/.test(t) ||
    /QUIROZ/.test(t) ||
    /ORISHAS\./.test(t) ||
    /CAMPBELL/.test(t) ||
    /LAVIERA/.test(t) ||
    /DONNE/.test(t) ||
    /PING/.test(t) ||
    /Rio de Janeiro:/.test(t) ||
    /Campinas:/.test(t) ||
    /, (19|20)\d{2}\.\s*$/.test(t) ||
    /EVARISTO/.test(t) ||
    /RIBEIRO/.test(t) ||
    /KHEL/.test(t)
  );
}

function looksLikeVerse(lines: string[]) {
  if (lines.length < 4) return false;
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  const shortLines = nonEmpty.filter((l) => l.trim().length < 55);
  return shortLines.length >= 6 && shortLines.length / nonEmpty.length > 0.55;
}

function splitBody(bodyLines: string[]) {
  const cleaned = bodyLines.map((l) => l.trim()).filter((l) => l.length > 0);
  const issues: string[] = [];

  let lastCitationIdx = -1;
  cleaned.forEach((line, index) => {
    if (isCitationLine(line)) {
      lastCitationIdx = index;
    }
  });

  let prompt: string;
  let supportBlock: string[];

  if (lastCitationIdx >= 0 && lastCitationIdx < cleaned.length - 1) {
    prompt = cleaned
      .slice(lastCitationIdx + 1)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    supportBlock = cleaned.slice(0, lastCitationIdx + 1);
  } else {
    const promptLines = cleaned.slice(-2);
    prompt = promptLines.join(' ').replace(/\s+/g, ' ').trim();
    supportBlock = cleaned.slice(0, -2);
    issues.push('prompt inferido sem citação explícita');
  }

  if (!prompt) {
    prompt = cleaned[cleaned.length - 1] ?? '';
    supportBlock = cleaned.slice(0, -1);
    issues.push('prompt de fallback na última linha');
  }

  let sourceCitation: string | undefined;
  let supportTitle: string | undefined;
  let supportText: string | undefined;

  const citationLines = supportBlock.filter((line) => isCitationLine(line));
  const nonCitationLines = supportBlock.filter((line) => !isCitationLine(line));

  if (citationLines.length > 0) {
    sourceCitation = citationLines.join(' ').replace(/\s+/g, ' ').trim();
  }

  if (nonCitationLines.length > 0) {
    const first = nonCitationLines[0];
    if (
      nonCitationLines.length > 2 &&
      first.length < 80 &&
      !first.endsWith('.') &&
      !/^TEXTO /.test(first)
    ) {
      supportTitle = first;
      supportText = nonCitationLines.slice(1).join('\n').trim();
    } else {
      supportText = nonCitationLines.join('\n').trim();
    }
  }

  const contentFormat = looksLikeVerse(
    (supportText ?? '').split('\n').filter(Boolean)
  )
    ? 'verse'
    : 'prose';

  return {
    supportTitle,
    supportText: supportText || undefined,
    sourceCitation,
    prompt,
    contentFormat: contentFormat as 'prose' | 'verse',
    issues,
  };
}

function readPageText(page: number) {
  const file = path.join(
    EXTRACTED_DIR,
    `page-${String(page).padStart(2, '0')}.txt`
  );
  if (!fs.existsSync(file)) {
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function parsePageQuestions(pageText: string) {
  const lines = pageText.split('\n').map(cleanLine);
  const blocks: { number: number; lines: string[] }[] = [];
  let current: { number: number; lines: string[] } | null = null;

  for (const line of lines) {
    if (isHeaderNoise(line)) continue;

    const qMatch = line.match(/^QUESTÃO\s+0*(\d+)\s*$/i);
    if (qMatch) {
      if (current) blocks.push(current);
      current = { number: Number(qMatch[1]), lines: [] };
      continue;
    }

    if (current) {
      current.lines.push(line);
    }
  }

  if (current) blocks.push(current);

  return blocks.map((block) => {
    const optionStart = block.lines.findIndex((line) => isOptionLine(line));
    const bodyLines = optionStart >= 0 ? block.lines.slice(0, optionStart) : block.lines;
    const optionLines = optionStart >= 0 ? block.lines.slice(optionStart) : [];

    const options: { id: string; text: string }[] = [];
    let currentOption: { id: string; text: string } | null = null;

    for (const line of optionLines) {
      const parsed = parseOptionLine(line);
      if (parsed) {
        if (currentOption) options.push(currentOption);
        currentOption = parsed;
      } else if (currentOption && line.trim()) {
        currentOption.text = `${currentOption.text} ${line.trim()}`.trim();
      }
    }
    if (currentOption) options.push(currentOption);

    const split = splitBody(bodyLines.filter((l) => l.trim().length > 0));
    const issues = [...split.issues];
    if (options.length !== 5) {
      issues.push(`alternativas=${options.length}`);
    }

    return {
      questionNumber: block.number,
      ...split,
      options,
      parseIssues: issues,
    };
  });
}

function resolveExternalId(item: ManifestItem, parsedNumber: number) {
  if (item.languageTrack === 'english') {
    return `ENEM-2023-D1-C1-ING-${String(parsedNumber).padStart(2, '0')}`;
  }
  if (item.languageTrack === 'spanish') {
    return `ENEM-2023-D1-C1-ESP-${String(parsedNumber).padStart(2, '0')}`;
  }
  return `ENEM-2023-D1-C1-Q${String(parsedNumber).padStart(2, '0')}`;
}

const pageCache = new Map<number, ReturnType<typeof parsePageQuestions>>();

function findParsedForItem(item: ManifestItem) {
  if (!pageCache.has(item.sourcePage)) {
    pageCache.set(item.sourcePage, parsePageQuestions(readPageText(item.sourcePage)));
  }

  const pageQuestions = pageCache.get(item.sourcePage) ?? [];
  const match = pageQuestions.find((q) => q.questionNumber === item.questionNumber);

  if (match) return match;

  // Spanish/English share page numbers with different question numbers 1-5
  return pageQuestions.find((q) => {
    const ext = resolveExternalId(item, q.questionNumber);
    return ext === item.externalId;
  });
}

const parsed: ParsedQuestion[] = [];
const missing: string[] = [];

for (const item of readyItems) {
  const found = findParsedForItem(item);
  if (!found) {
    missing.push(item.externalId);
    continue;
  }

  parsed.push({
    externalId: item.externalId,
    questionNumber: item.questionNumber,
    languageTrack: item.languageTrack,
    area: item.area,
    answerKey: item.answerKey,
    supportTitle: found.supportTitle,
    supportText: found.supportText,
    sourceCitation: found.sourceCitation,
    prompt: found.prompt,
    contentFormat: found.contentFormat,
    options: found.options,
    parseIssues: found.parseIssues,
  });
}

const result = {
  expected: readyItems.length,
  parsed: parsed.length,
  missing,
  questions: parsed,
};

fs.writeFileSync(OUT_PATH, JSON.stringify(result, null, 2), 'utf8');
console.log(`Parsed ${parsed.length}/${readyItems.length} -> ${OUT_PATH}`);
if (missing.length) console.log('Missing:', missing.join(', '));
const withIssues = parsed.filter((q) => q.parseIssues.length > 0 || q.options.length !== 5);
console.log(`With parse issues: ${withIssues.length}`);
withIssues.slice(0, 10).forEach((q) => {
  console.log(`  ${q.externalId}: ${q.parseIssues.join('; ')}`);
});
