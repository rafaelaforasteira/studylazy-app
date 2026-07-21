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

console.log('=== Auditoria: Sistema de Vidas + Retry ===\n');

const stats = getQuestionBankStats();

check('1. store de vidas existe', existsSync(join(ROOT, 'src/store/livesStore.ts')));
check('2. lógica de vidas existe', existsSync(join(ROOT, 'src/lives/livesLogic.ts')));
check(
  '3. componente LivesIndicator existe',
  existsSync(join(ROOT, 'src/components/lives/LivesIndicator.tsx'))
);

const estudar = readRel('src/app/(tabs)/estudar.tsx');
check('4. indicador em Estudar', /LivesIndicator/.test(estudar));

const session = readRel('src/app/study-session.tsx');
check('5. indicador na sessão', /LivesIndicator/.test(session));
check('6. bloqueio por 0 vidas existe', /canStudy|Sem vidas|livesCheck/.test(readRel('src/hooks/use-start-study.ts')));
check('7. perda de vida em erro existe', /loseOneLife/.test(session));
check(
  '8. proteção contra duplo toque existe',
  /lostLifeKeysRef|answerLockRef|lossKey/.test(session)
);
check(
  '9. regeneração por tempo existe',
  /LIFE_REGEN_MS|regenerateLives/.test(readRel('src/lives/livesLogic.ts'))
);
check(
  '10. tela dev existe',
  existsSync(join(ROOT, 'src/app/dev/lives-health.tsx'))
);
check(
  '11. docs existem',
  existsSync(join(ROOT, 'docs/gamification/lives-system.md'))
);

const pro = readRel('src/app/pro.tsx');
check(
  '12. /pro menciona vidas ilimitadas sem compra',
  /Vidas ilimitadas/.test(pro) &&
    !/Assinar Pro|Restaurar compra|react-native-purchases/i.test(pro)
);

const pkg = readRel('package.json');
check(
  '13. sem SDK de pagamento real',
  !/stripe|revenuecat|react-native-purchases|google-play-billing|react-native-iap/i.test(
    pkg
  )
);

const srcFiles = walk(join(ROOT, 'src'));
const paymentKeys = srcFiles.filter((file) => {
  const text = readFileSync(file, 'utf8');
  return /sk_live_|pk_live_|revenuecat_api|stripe_secret|goog_[a-zA-Z0-9]{20,}/.test(
    text
  );
});
check(
  '14. sem chaves de pagamento',
  paymentKeys.length === 0,
  paymentKeys.join(', ')
);

check(
  '15. 149 questões intactas',
  stats.totalOfficialQuestions === 149,
  `total=${stats.totalOfficialQuestions}`
);
check('16. zero demos em produção', stats.totalDemoInProduction === 0);
const annulled = officialQuestionBank.filter(
  (q) => q.officialStatus === 'annulled'
).length;
check('17. zero anuladas', annulled === 0);
check(
  '18. Q177 fora',
  !officialQuestionBank.some((q) => q.externalId === 'ENEM-2023-D2-C5-Q177')
);

const retryStore = readRel('src/store/retryQueueStore.ts');
const retryLogic = readRel('src/retry/retryQueueLogic.ts');
check(
  '19. retry usa stableQuestionId',
  /stableQuestionId/.test(retryStore) && /stableQuestionId/.test(retryLogic)
);
check(
  '20. retry não salva texto completo de questão',
  !/question:\s*|prompt:\s*|options:\s*|correctAnswer:\s*/.test(retryStore) &&
    !/\b(prompt|options|correctAnswer)\s*:/.test(retryLogic)
);

check(
  'Extra. badge revisão de erro',
  /Revisão de erro|isRetry/.test(readRel('src/components/questions/QuestionMetaBadges.tsx'))
);
check(
  'Extra. vidas em Você',
  /LivesIndicator/.test(readRel('src/app/(tabs)/voce.tsx'))
);
check(
  'Extra. checklist beta menciona vidas',
  /vidas/i.test(readRel('docs/beta/free-beta-launch-checklist.md'))
);

console.log('');
if (failures === 0) {
  console.log('Auditoria Vidas/Retry: TODAS as verificações passaram.');
} else {
  console.error(`Auditoria Vidas/Retry: ${failures} verificação(ões) falharam.`);
  process.exitCode = 1;
}
