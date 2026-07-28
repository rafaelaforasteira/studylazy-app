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

console.log('=== Auditoria: Conquistas e Níveis ===\n');

const stats = getQuestionBankStats();
const voce = readRel('src/app/(tabs)/voce.tsx');
const atividade = readRel('src/app/(tabs)/atividade.tsx');
const pro = readRel('src/app/pro.tsx');
const pkg = readRel('package.json');
const progress = readRel('src/store/progressLogic.ts');
const gamification = readRel('src/utils/gamification.ts');
const achievementStore = readRel('src/store/achievementStore.ts');
const checklist = readRel('docs/beta/free-beta-launch-checklist.md');

check(
  '1. lógica de conquistas existe',
  existsSync(join(ROOT, 'src/achievements/achievementLogic.ts'))
);
check(
  '2. store de conquistas existe',
  existsSync(join(ROOT, 'src/store/achievementStore.ts'))
);
check(
  '3. lógica de níveis existe',
  existsSync(join(ROOT, 'src/levels/levelLogic.ts'))
);
check(
  '4. card de conquistas existe',
  existsSync(join(ROOT, 'src/components/achievements/AchievementsCard.tsx'))
);
check(
  '5. card de nível existe',
  existsSync(join(ROOT, 'src/components/levels/LevelProgressCard.tsx'))
);
check(
  '6. aparece na tela Você',
  /AchievementsCard/.test(voce) && /LevelProgressCard/.test(voce)
);
check(
  '7. aparece na Atividade',
  /AchievementsCard/.test(atividade) && /LevelProgressCard/.test(atividade)
);
check(
  '8. tela dev existe',
  existsSync(join(ROOT, 'src/app/dev/achievements-health.tsx'))
);
check(
  '9. docs existem',
  existsSync(join(ROOT, 'docs/gamification/achievements-and-levels.md')) &&
    /Conquistas/i.test(checklist)
);
check(
  '10. não há pagamento real',
  !/stripe|revenuecat|react-native-purchases|google-play-billing|react-native-iap/i.test(
    pkg
  ) && /Conquistas especiais/.test(pro)
);
check(
  '11. NPS preservado',
  existsSync(join(ROOT, 'src/components/feedback/NpsPrompt.tsx')) &&
    /NpsPrompt/.test(voce)
);
check(
  '12. vidas preservadas',
  existsSync(join(ROOT, 'src/store/livesStore.ts'))
);
check(
  '13. missões preservadas',
  existsSync(join(ROOT, 'src/store/missionStore.ts')) &&
    /DailyMissionsCard/.test(voce)
);
check(
  '14. retry preservado',
  existsSync(join(ROOT, 'src/store/retryQueueStore.ts'))
);
check(
  '15. sync preservado',
  existsSync(join(ROOT, 'src/sync')) || /supabase/i.test(pkg)
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
check('18. zero demos em produção', stats.totalDemoInProduction === 0);
check(
  '19. não salva texto completo de questão',
  !/prompt:|correctAnswer:|options:/.test(achievementStore) &&
    /stableQuestionId|AchievementId|counters/.test(achievementStore)
);
check(
  '20. XP/streak original preservado',
  /calculateXp|calculateStreak|computeLessonResult/.test(progress) &&
    /computeStudentLevel/.test(gamification)
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
  'Extra. integração sessão/revisão',
  /recordQuestionAnswered|useAchievementStore/.test(
    readRel('src/app/study-session.tsx')
  ) &&
    /recordReviewAnswered/.test(readRel('src/app/review-mistakes.tsx'))
);

console.log('');
if (failures === 0) {
  console.log('Auditoria achievements/levels: TODAS as verificações passaram.');
} else {
  console.error(
    `Auditoria achievements/levels: ${failures} verificação(ões) falharam.`
  );
  process.exitCode = 1;
}
