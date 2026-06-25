/**
 * One-off helper: extract raw text from ENEM 2023 prova PDF by page.
 * Run: npx tsx scripts/extract-enem-2023-pdf.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { PDFParse } from 'pdf-parse';

const PDF_PATH = path.join(
  process.cwd(),
  'docs/sources/enem/2023/d1-c1-azul/prova.pdf'
);
const OUT_DIR = path.join(process.cwd(), 'docs/imports/enem/2023/extracted');

async function main() {
  const buffer = fs.readFileSync(PDF_PATH);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'full.txt'), result.text, 'utf8');

  result.pages.forEach((page, idx) => {
    fs.writeFileSync(
      path.join(OUT_DIR, `page-${String(idx + 1).padStart(2, '0')}.txt`),
      page.text,
      'utf8'
    );
  });

  console.log(`Extracted ${result.total} pages to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
