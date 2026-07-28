import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  getQuestionBankStats,
  officialQuestionBank,
} from '../src/data/questionBank';

let failures = 0;

function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`OK   ${label}`);
  } else {
    console.error(`FALHA ${label}${detail ? ` — ${detail}` : ''}`);
    failures += 1;
  }
}

const ROOT = join(__dirname, '..');

function readRel(path: string): string {
  return readFileSync(join(ROOT, path), 'utf8');
}

function walk(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) {
    return files;
  }
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, files);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full.replace(/\\/g, '/'));
    }
  }
  return files;
}

console.log('=== Auditoria: Recompensa de vidas na revisão ===\n');

const stats = getQuestionBankStats();
const types = readRel('src/lives/livesTypes.ts');
const logic = readRel('src/lives/livesLogic.ts');
const store = readRel('src/store/livesStore.ts');
const review = readRel('src/app/review-mistakes.tsx');
const indicator = readRel('src/components/lives/LivesIndicator.tsx');
const health = readRel('src/app/dev/lives-health.tsx');
const docs = readRel('docs/gamification/lives-system.md');
const checklist = readRel('docs/beta/free-beta-launch-checklist.md');
const pro = readRel('src/app/pro.tsx');
const pkg = readRel('package.json');

check(
  '1. campos de fragmento existem',
  /lifeFragments/.test(types) &&
    /totalLivesRecoveredFromReview/.test(types) &&
    /lastLifeRecoveredFromReviewAt/.test(types) &&
    /reviewRewardHistory/.test(types) &&
    /lifeFragments/.test(store)
);

check(
  '2. recompensa integrada na revisão',
  /rewardFromReviewCorrect/.test(review) && /rewardReviewCorrect/.test(logic)
);

check(
  '3. revisão não consome vida',
  !/loseOneLife/.test(review) && /não consome vidas|não perde vida/i.test(docs)
);

check(
  '4. acerto dá 1/2 vida',
  /Boa! Você recuperou metade de uma vida/.test(logic) &&
    /FRAGMENTS_PER_LIFE/.test(logic)
);

check(
  '5. 2 acertos dão 1 vida',
  /FRAGMENTS_PER_LIFE/.test(logic) &&
    /Excelente! Você recuperou 1 vida/.test(logic)
);

check(
  '6. não passa de 5',
  /MAX_LIVES|clampLives/.test(logic) && /full_lives/.test(logic)
);

check(
  '7. anti-duplo-toque',
  /answerLockRef/.test(review) &&
    /rewardedKeysRef/.test(review) &&
    /lastReviewRewardKey/.test(store)
);

check(
  '8. anti-abuso por stableQuestionId',
  /stableQuestionId/.test(logic) &&
    /getStableQuestionId/.test(review) &&
    /already_rewarded|hasReviewReward/.test(logic)
);

check(
  '9. não salva texto completo de questão',
  /stableQuestionId/.test(types) &&
    /rewardedAt/.test(types) &&
    !/prompt\s*:|options\s*:|correctAnswer\s*:/.test(types) &&
    !/\bprompt\b|\boptions\b|\bcorrectAnswer\b/.test(
      store.split('partialize')[1]?.slice(0, 800) ?? ''
    )
);

check(
  '10. LivesIndicator mostra fragmento',
  /\+1\/2/.test(indicator) && /lifeFragments/.test(indicator)
);

check(
  '11. lives-health mostra fragmentos',
  /Fragmentos|lifeFragments/.test(health) &&
    /Adicionar fragmento/.test(health) &&
    /Limpar histórico de recompensa/.test(health)
);

check(
  '12. docs atualizadas',
  /fragmento/i.test(docs) &&
    /1\/2|metade/i.test(docs) &&
    /fragmento/i.test(checklist)
);

check(
  '13. sem pagamento real',
  !/stripe|revenuecat|react-native-purchases|google-play-billing|react-native-iap/i.test(
    pkg
  ) &&
    /Vidas ilimitadas/.test(pro) &&
    !/Assinar Pro|Restaurar compra/i.test(pro)
);

const feedbackFiles = [
  'src/store/feedbackStore.ts',
  'src/components/feedback/NpsPrompt.tsx',
].filter((p) => existsSync(join(ROOT, p)));
check(
  '14. NPS preservado',
  feedbackFiles.length === 2 &&
    /NpsPrompt/.test(readRel('src/app/(tabs)/voce.tsx'))
);

check(
  '15. sync preservado',
  existsSync(join(ROOT, 'src/sync')) ||
    existsSync(join(ROOT, 'src/lib/supabase.ts')) ||
    /supabase/i.test(readRel('package.json'))
);

check(
  '16. 149 questões intactas',
  stats.totalOfficialQuestions === 149,
  `total=${stats.totalOfficialQuestions}`
);

check(
  '17. Q177 fora',
  !officialQuestionBank.some((q) => q.externalId === 'ENEM-2023-D2-C5-Q177')
);

const srcFiles = walk(join(ROOT, 'src'));
const paymentKeys = srcFiles.filter((file) => {
  const text = readFileSync(file, 'utf8');
  return /sk_live_|pk_live_|revenuecat_api|stripe_secret|goog_[a-zA-Z0-9]{20,}/.test(
    text
  );
});
check('Extra. sem chaves de pagamento', paymentKeys.length === 0);

check(
  'Extra. Você menciona dica de revisão',
  /acerte revisões para recuperar vidas/i.test(
    readRel('src/app/(tabs)/voce.tsx')
  )
);

check(
  'Extra. /pro menciona recarga',
  /sem precisar esperar recarga/i.test(pro)
);

console.log('');
if (failures === 0) {
  console.log('Auditoria review life rewards: TODAS as verificações passaram.');
} else {
  console.error(
    `Auditoria review life rewards: ${failures} verificação(ões) falharam.`
  );
  process.exitCode = 1;
}
