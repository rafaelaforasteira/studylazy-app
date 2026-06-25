/**
 * Parse ENEM 2023 D2 extracted PDF pages into structured question JSON.
 * Run: npx tsx scripts/parse-enem-2023-d2-extracted.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import type { QuestionContentBlock } from '../src/data/questionTypes';

type ManifestItem = {
  externalId: string;
  questionNumber: number;
  area: 'natural_sciences' | 'mathematics';
  answerKey: string;
  sourcePage: number;
  ingestionStatus: string;
  requiresMedia: boolean;
  officialStatus: string;
  eligibleForScoredSessions: boolean;
};

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
  contentFormat: 'prose' | 'verse';
  options: { id: string; text: string }[];
  parseIssues: string[];
};

const ROOT = process.cwd();
const EXTRACTED_DIR = path.join(ROOT, 'docs/imports/enem/2023/day2/extracted');
const MANIFEST_PATH = path.join(
  ROOT,
  'docs/imports/enem/2023/day2/filter-manifest.json'
);
const OUT_PATH = path.join(
  ROOT,
  'docs/imports/enem/2023/day2/parsed-questions.json'
);

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as {
  items: ManifestItem[];
};

const readyItems = manifest.items.filter(
  (item) =>
    item.ingestionStatus === 'ready_text' &&
    !item.requiresMedia &&
    item.officialStatus === 'valid' &&
    item.eligibleForScoredSessions
);

function normalizeScientificText(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s*–\s*(\d+)/g, '⁻$1')
    .replace(/\s*-\s*(\d+)(?=\s*\.|$)/g, '⁻$1')
    .replace(/\s*\.\s*$/g, '.')
    .trim();
}

function cleanLine(line: string) {
  return line
    .replace(/^\d+\t.*$/i, '')
    .replace(/^\*020125AM\d+\*$/i, '')
    .replace(/^CIÊNCIAS DA NATUREZA.*$/i, '')
    .replace(/^MATEMÁTICA E SUAS TECNOLOGIAS.*$/i, '')
    .replace(/^Questões de \d+ a \d+.*$/i, '')
    .trim();
}

function isHeaderNoise(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (/^\d+\t/.test(trimmed)) return true;
  if (/^\*020125AM/.test(trimmed)) return true;
  if (/^CIÊNCIAS DA NATUREZA/i.test(trimmed)) return true;
  if (/^MATEMÁTICA E SUAS TECNOLOGIAS/i.test(trimmed)) return true;
  if (/^Questões de \d+/i.test(trimmed)) return true;
  if (/^(CN|MT)\s*•/i.test(trimmed)) return true;
  return false;
}

function isOptionLine(line: string) {
  return /^[A-E]\t[A-E]\s/.test(line.trim());
}

function parseOptionLine(line: string) {
  const match = line.trim().match(/^([A-E])\t[A-E]\s+(.*)$/);
  if (!match) return null;
  return { id: match[1], text: normalizeScientificText(match[2]) };
}

function isCitationLine(line: string) {
  const t = line.trim();
  return (
    /Disponível em:/i.test(t) ||
    /^apud /i.test(t) ||
    /^[A-ZÁÉÍÓÚÃÕÂÊÔÇ][A-ZÁÉÍÓÚÃÕÂÊÔÇ'’-]+,\s/.test(t) ||
    /, \d{4}\s*\(/.test(t) ||
    /São Paulo:/.test(t) ||
    /Rio de Janeiro:/.test(t) ||
    /Campinas:/.test(t) ||
    /, (19|20)\d{2}\.\s*$/.test(t) ||
    /Revista /.test(t) ||
    /SOUSA,/.test(t) ||
    /CIRINO,/.test(t) ||
    /CAVAGIS,/.test(t) ||
    /sbim\.org/i.test(t) ||
    /\(adaptado\)/.test(t)
  );
}

function isPromptStartLine(line: string) {
  const t = line.trim();
  return /^(Em |Nesse|Nessa|Nesta|Neste|Com base|De acordo|Considerando|Qual|Quais|O que|Por que|Por quê|Como|Assinale|Determine|Calcule|Identifique|Indique|Selecione|É correto|Nessas condições|Para que|O valor|O coquetel|O desconto|A partir|Sabendo|Dados|Sendo|Se |Ao |Uma |Um |Em um|Em uma|Comparando|Analisando|Suponha|Imagine|Represente|Express|Encontre|Obtenha|Construa|Classifique|Relacione|Justifique|Explique|Descreva|Apresente|Complete|Marque|Escolha|Qual é|Entre|Dentro|Essa|A morte|A média|A expressão|Entre as|Entre esses)/i.test(
    t
  ) || /(impediu o\(a\)|favorecem o\(a\)|pertence ao intervalo|é provocada pela)/i.test(t) || /^Nas viagens/i.test(t);
}

function findPromptStartIndex(lines: string[]) {
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.endsWith('?') || isPromptStartLine(line)) {
      let start = i;
      for (let j = i - 1; j >= 0; j -= 1) {
        const prev = lines[j].trim();
        if (!prev) break;
        if (isPromptStartLine(prev)) {
          start = j;
          continue;
        }
        const nextLine = lines[start].trim();
        if (/^[a-záéíóúãõâêôç]/.test(nextLine)) {
          start = j;
          continue;
        }
        break;
      }
      return start;
    }
  }

  return -1;
}

function collectCitationIndices(lines: string[]) {
  const indices: number[] = [];
  lines.forEach((line, index) => {
    if (isCitationLine(line)) {
      indices.push(index);
    }
  });

  if (indices.length === 0) {
    return -1;
  }

  let start = indices[0];
  let end = indices[indices.length - 1];
  for (let i = 1; i < indices.length; i += 1) {
    if (indices[i] - indices[i - 1] <= 2) {
      end = indices[i];
    }
  }

  return end;
}

function isFormulaLine(text: string) {
  return (
    /×\s*10/.test(text) ||
    /\^\d/.test(text) ||
    /[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(text) ||
    /=\s*\d/.test(text) ||
    /[A-Z][a-z]?[₀-₉\d]/.test(text) ||
    /\d+\s*\/\s*\d+/.test(text) ||
    /√/.test(text) ||
    /π/.test(text) ||
    /°/.test(text)
  );
}

function buildContentBlocks(params: {
  supportTitle?: string;
  supportText?: string;
  sourceCitation?: string;
}): QuestionContentBlock[] | undefined {
  const blocks: QuestionContentBlock[] = [];

  if (params.supportTitle) {
    blocks.push({ type: 'paragraph', text: params.supportTitle });
  }

  if (params.supportText) {
    params.supportText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const text = normalizeScientificText(line);
        if (isFormulaLine(text)) {
          blocks.push({ type: 'formula', latex: text, fallbackText: text });
        } else {
          blocks.push({ type: 'paragraph', text });
        }
      });
  }

  if (params.sourceCitation) {
    blocks.push({ type: 'citation', text: params.sourceCitation });
  }

  return blocks.length > 0 ? blocks : undefined;
}

function splitBody(bodyLines: string[]) {
  const cleaned = bodyLines.map((l) => l.trim()).filter((l) => l.length > 0);
  const issues: string[] = [];

  const lastCitationIdx = collectCitationIndices(cleaned);

  let prompt: string;
  let supportBlock: string[];

  if (lastCitationIdx >= 0 && lastCitationIdx < cleaned.length - 1) {
    prompt = normalizeScientificText(
      cleaned.slice(lastCitationIdx + 1).join(' ')
    );
    supportBlock = cleaned.slice(0, lastCitationIdx + 1);
  } else {
    const promptStart = findPromptStartIndex(cleaned);
    if (promptStart >= 0) {
      prompt = normalizeScientificText(
        cleaned.slice(promptStart).join(' ')
      );
      supportBlock = cleaned.slice(0, promptStart);
    } else {
      const promptLines = cleaned.slice(-2);
      prompt = normalizeScientificText(promptLines.join(' '));
      supportBlock = cleaned.slice(0, -2);
      issues.push('prompt inferido sem citação explícita');
    }
  }

  if (!prompt) {
    prompt = normalizeScientificText(cleaned[cleaned.length - 1] ?? '');
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
      first.length < 90 &&
      !first.endsWith('.') &&
      !/^TEXTO /.test(first)
    ) {
      supportTitle = normalizeScientificText(first);
      supportText = nonCitationLines
        .slice(1)
        .map((line) => normalizeScientificText(line))
        .join('\n')
        .trim();
    } else {
      supportText = nonCitationLines
        .map((line) => normalizeScientificText(line))
        .join('\n')
        .trim();
    }
  }

  const contentBlocks = buildContentBlocks({
    supportTitle,
    supportText,
    sourceCitation,
  });

  return {
    supportTitle,
    supportText: supportText || undefined,
    sourceCitation,
    contentBlocks,
    prompt,
    contentFormat: 'prose' as const,
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
    const bodyLines =
      optionStart >= 0 ? block.lines.slice(0, optionStart) : block.lines;
    const optionLines = optionStart >= 0 ? block.lines.slice(optionStart) : [];

    const options: { id: string; text: string }[] = [];
    let currentOption: { id: string; text: string } | null = null;

    for (const line of optionLines) {
      const parsed = parseOptionLine(line);
      if (parsed) {
        if (currentOption) options.push(currentOption);
        currentOption = parsed;
      } else if (currentOption && line.trim()) {
        const fragment = normalizeScientificText(line.trim());
        currentOption.text = normalizeScientificText(
          `${currentOption.text} ${fragment}`
        );
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

const pageCache = new Map<number, ReturnType<typeof parsePageQuestions>>();

function findParsedForItem(item: ManifestItem) {
  if (!pageCache.has(item.sourcePage)) {
    pageCache.set(
      item.sourcePage,
      parsePageQuestions(readPageText(item.sourcePage))
    );
  }

  const pageQuestions = pageCache.get(item.sourcePage) ?? [];
  return pageQuestions.find((q) => q.questionNumber === item.questionNumber);
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
    area: item.area,
    answerKey: item.answerKey,
    supportTitle: found.supportTitle,
    supportText: found.supportText,
    sourceCitation: found.sourceCitation,
    contentBlocks: found.contentBlocks,
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
const withIssues = parsed.filter(
  (q) => q.parseIssues.length > 0 || q.options.length !== 5
);
console.log(`With parse issues: ${withIssues.length}`);
withIssues.slice(0, 15).forEach((q) => {
  console.log(`  ${q.externalId}: ${q.parseIssues.join('; ')}`);
});
