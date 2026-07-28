import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { getQuestionBankStats } from '../src/data/questionBank';
import { shouldShowNpsPrompt } from '../src/feedback/feedbackLogic';

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
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (/\.(ts|tsx)$/.test(entry)) files.push(full.replace(/\\/g, '/'));
  }
  return files;
}

console.log('=== Auditoria: NPS e Feedback do Beta ===\n');

check(
  '1. componente NPS existe',
  existsSync(join(ROOT, 'src/components/feedback/NpsPrompt.tsx'))
);
check(
  '2. store feedback existe',
  existsSync(join(ROOT, 'src/store/feedbackStore.ts'))
);
check(
  '3. lógica NPS existe',
  existsSync(join(ROOT, 'src/feedback/feedbackLogic.ts'))
);
check('4. rota /feedback existe', existsSync(join(ROOT, 'src/app/feedback.tsx')));
check(
  '5. rota /dev/feedback-dashboard existe',
  existsSync(join(ROOT, 'src/app/dev/feedback-dashboard.tsx'))
);
check(
  '6. docs existem',
  existsSync(join(ROOT, 'docs/beta/nps-feedback.md'))
);
check(
  '7. SQL existe',
  existsSync(join(ROOT, 'docs/supabase/user-feedback-table.sql'))
);

const pkg = readRel('package.json');
check(
  '8. não há SDK de pagamento',
  !/stripe|revenuecat|react-native-purchases|google-play-billing|react-native-iap/i.test(
    pkg
  )
);

const srcFiles = walk(join(ROOT, 'src'));
const paymentKeys = srcFiles.filter((file) =>
  /sk_live_|pk_live_|revenuecat_api|stripe_secret|goog_[a-zA-Z0-9]{20,}/.test(
    readFileSync(file, 'utf8')
  )
);
check('9. não há chaves de pagamento', paymentKeys.length === 0, paymentKeys.join(', '));

const stats = getQuestionBankStats();
check(
  '10. 149 questões oficiais intactas',
  stats.totalOfficialQuestions === 149,
  `total=${stats.totalOfficialQuestions}`
);

check(
  '11. sync de progresso preservado',
  existsSync(join(ROOT, 'src/sync/syncCoordinator.ts'))
);
check('12. auth preservado', existsSync(join(ROOT, 'src/store/authStore.ts')));
check(
  '13. sistema de vidas preservado',
  existsSync(join(ROOT, 'src/store/livesStore.ts')) &&
    existsSync(join(ROOT, 'src/lives/livesLogic.ts'))
);
check(
  '14. retry de erros preservado',
  existsSync(join(ROOT, 'src/store/retryQueueStore.ts')) &&
    existsSync(join(ROOT, 'src/retry/retryQueueLogic.ts'))
);

const firstOpen = shouldShowNpsPrompt({
  firstOpenedAt: null,
  lastNpsShownAt: null,
  dismissedUntil: null,
  completedSessions: 10,
  hasSubmittedNps: false,
  trigger: 'session_end',
});
check(
  '15. NPS não aparece na primeira abertura',
  firstOpen.shouldShow === false && firstOpen.reason === 'first_open'
);

const store = readRel('src/store/feedbackStore.ts');
check(
  '16. feedback funciona offline (persistência local)',
  /persist|AsyncStorage|status:\s*'pending'/.test(store)
);

check(
  '17. não salva texto de questão completa',
  !/correctAnswer|question:\s*|prompt:\s*|options:\s*/.test(store)
);

const dashboard = readRel('src/app/dev/feedback-dashboard.tsx');
check(
  '18. não expõe e-mail completo no painel',
  !/@[a-z0-9.-]+\.[a-z]{2,}/i.test(dashboard) &&
    !/session\.user\.email|user\.email/.test(dashboard)
);

check(
  'Extra. hook useFeedbackSync no layout',
  /useFeedbackSync/.test(readRel('src/app/_layout.tsx'))
);
check(
  'Extra. checklist beta menciona NPS',
  /NPS|feedback/i.test(readRel('docs/beta/free-beta-launch-checklist.md'))
);
check(
  'Extra. Você tem card Avaliar',
  /Avaliar o StudyLazy|NpsPrompt/.test(readRel('src/app/(tabs)/voce.tsx'))
);

console.log('');
if (failures === 0) {
  console.log('Auditoria Feedback/NPS: TODAS as verificações passaram.');
} else {
  console.error(`Auditoria Feedback/NPS: ${failures} verificação(ões) falharam.`);
  process.exitCode = 1;
}
