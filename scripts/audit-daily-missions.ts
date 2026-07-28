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

console.log('=== Auditoria: Missões Diárias ===\n');

const stats = getQuestionBankStats();
const logic = readRel('src/missions/missionLogic.ts');
const store = readRel('src/store/missionStore.ts');
const card = readRel('src/components/missions/DailyMissionsCard.tsx');
const estudar = readRel('src/app/(tabs)/estudar.tsx');
const voce = readRel('src/app/(tabs)/voce.tsx');
const session = readRel('src/app/study-session.tsx');
const review = readRel('src/app/review-mistakes.tsx');
const docs = readRel('docs/gamification/daily-missions.md');
const checklist = readRel('docs/beta/free-beta-launch-checklist.md');
const pro = readRel('src/app/pro.tsx');
const pkg = readRel('package.json');
const livesStore = readRel('src/store/livesStore.ts');
const progressStore = readRel('src/store/studyProgressStore.ts');

check('1. lógica de missões existe', existsSync(join(ROOT, 'src/missions/missionLogic.ts')));
check('2. store de missões existe', existsSync(join(ROOT, 'src/store/missionStore.ts')));
check(
  '3. card de missões existe',
  existsSync(join(ROOT, 'src/components/missions/DailyMissionsCard.tsx'))
);
check('4. missão aparece em Estudar', /DailyMissionsCard/.test(estudar));
check('5. missão aparece em Você', /DailyMissionsCard/.test(voce));
check(
  '6. sessão registra lição/questões/acertos',
  /recordLessonSession/.test(session) && /answeredInSessionRef/.test(session)
);
check('7. revisão registra revisões', /recordReviewAnswer/.test(review));
check(
  '8. XP reward não duplica',
  /already_claimed/.test(logic) && /claimMissionReward/.test(logic) && /addBonusXp/.test(progressStore)
);
check(
  '9. bônus diário não duplica',
  /already_claimed/.test(logic) && /dailyBonusClaimed/.test(store)
);
check(
  '10. bônus usa fragmento de vida existente',
  /grantLifeFragment/.test(store) && /grantLifeFragment/.test(livesStore)
);
check(
  '11. tela dev existe',
  existsSync(join(ROOT, 'src/app/dev/missions-health.tsx'))
);
check(
  '12. docs existem',
  existsSync(join(ROOT, 'docs/gamification/daily-missions.md')) &&
    /missões diárias/i.test(checklist)
);
check(
  '13. sem pagamento real',
  !/stripe|revenuecat|react-native-purchases|google-play-billing|react-native-iap/i.test(
    pkg
  ) && /Missões extras/.test(pro)
);
check(
  '14. NPS preservado',
  existsSync(join(ROOT, 'src/components/feedback/NpsPrompt.tsx')) &&
    /NpsPrompt/.test(voce)
);
check(
  '15. vidas preservadas',
  existsSync(join(ROOT, 'src/store/livesStore.ts')) &&
    /lifeFragments/.test(livesStore)
);
check(
  '16. retry preservado',
  existsSync(join(ROOT, 'src/store/retryQueueStore.ts'))
);
check(
  '17. sync preservado',
  existsSync(join(ROOT, 'src/sync')) || /supabase/i.test(pkg)
);
check(
  '18. 149 questões intactas',
  stats.totalOfficialQuestions === 149,
  `total=${stats.totalOfficialQuestions}`
);
check(
  '19. Q177 fora',
  !officialQuestionBank.some((q) => q.externalId === 'ENEM-2023-D2-C5-Q177')
);
check('20. zero demos em produção', stats.totalDemoInProduction === 0);

const srcFiles = walk(join(ROOT, 'src'));
const paymentKeys = srcFiles.filter((file) => {
  const text = readFileSync(file, 'utf8');
  return /sk_live_|pk_live_|revenuecat_api|stripe_secret|goog_[a-zA-Z0-9]{20,}/.test(
    text
  );
});
check('Extra. sem chaves de pagamento', paymentKeys.length === 0);
check('Extra. card tem Resgatar', /Resgatar/.test(card));
check('Extra. templates de missão', /complete_lesson/.test(logic) && /review_mistakes/.test(logic));

console.log('');
if (failures === 0) {
  console.log('Auditoria daily missions: TODAS as verificações passaram.');
} else {
  console.error(
    `Auditoria daily missions: ${failures} verificação(ões) falharam.`
  );
  process.exitCode = 1;
}
