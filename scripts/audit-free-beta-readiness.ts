import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { getQuestionBankStats, officialQuestionBank } from '../src/data/questionBank';

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
    } else if (/\.(ts|tsx|json)$/.test(entry)) {
      files.push(full.replace(/\\/g, '/'));
    }
  }
  return files;
}

console.log('=== Auditoria: Prontidão Beta Gratuito ===\n');

// 1. 149 questões oficiais
const stats = getQuestionBankStats();
check(
  '1. 149 questões oficiais',
  stats.totalOfficialQuestions === 149,
  `total=${stats.totalOfficialQuestions}`
);

// 2. Zero demos em produção
check(
  '2. Zero demos em produção',
  stats.totalDemoInProduction === 0,
  `demos=${stats.totalDemoInProduction}`
);

// 3. Zero anuladas no banco oficial
const annulled = officialQuestionBank.filter(
  (q) =>
    q.officialStatus === 'annulled' ||
    String(q.externalId ?? '').includes('ANULADA')
).length;
check('3. Zero anuladas no runtime', annulled === 0, `anuladas=${annulled}`);

// 4. Q177 fora do banco pontuado
check(
  '4. Q177 fora do banco',
  !officialQuestionBank.some((q) => q.externalId === 'ENEM-2023-D2-C5-Q177')
);

// 5. Auth preservado
check('5. authStore preservado', existsSync(join(ROOT, 'src/store/authStore.ts')));
check(
  '5b. accountSecurity preservado',
  existsSync(join(ROOT, 'src/lib/accountSecurity.ts'))
);

// 6. Sync preservado
check(
  '6. syncCoordinator preservado',
  existsSync(join(ROOT, 'src/sync/syncCoordinator.ts'))
);
check(
  '6b. syncSerializer preservado',
  existsSync(join(ROOT, 'src/sync/syncSerializer.ts'))
);

// 7. EAS preservado
check('7. eas.json preservado', existsSync(join(ROOT, 'eas.json')));
const appJson = readRel('app.json');
check('7b. app.json com package Android', /com\.studylazy\.app/.test(appJson));

// 8. Sem SDK de pagamento real
const pkg = readRel('package.json');
check(
  '8. Sem SDK de pagamento real',
  !/stripe|revenuecat|react-native-purchases|google-play-billing|react-native-iap/i.test(
    pkg
  )
);

// 9. Sem chaves de pagamento no app
const srcFiles = walk(join(ROOT, 'src'));
const paymentKeys = srcFiles.filter((file) => {
  const text = readFileSync(file, 'utf8');
  return /sk_live_|pk_live_|revenuecat_api|stripe_secret|goog_[a-zA-Z0-9]{20,}/.test(
    text
  );
});
check(
  '9. Sem chaves de pagamento no código',
  paymentKeys.length === 0,
  paymentKeys.join(', ')
);

// 10. Tela /pro sem compra real
const proScreen = readRel('src/app/pro.tsx');
check('10. Tela /pro existe', existsSync(join(ROOT, 'src/app/pro.tsx')));
check(
  '10b. Sem botão de compra real',
  !/Assinar Pro|Restaurar compra|purchasePackage|react-native-purchases/i.test(
    proScreen
  )
);
check(
  '10c. CTA informativo (Em breve ou lista de espera)',
  /Em breve|lista de espera/i.test(proScreen)
);

// 11. Checklist beta existe
check(
  '11. Checklist beta launch in-app',
  existsSync(join(ROOT, 'src/app/dev/beta-launch-checklist.tsx'))
);
check(
  '11b. Checklist beta QA in-app',
  existsSync(join(ROOT, 'src/app/dev/beta-checklist.tsx'))
);

// 12. Docs beta existem
check(
  '12. Doc free-beta-launch-checklist',
  existsSync(join(ROOT, 'docs/beta/free-beta-launch-checklist.md'))
);
check(
  '12b. Doc known-limitations',
  existsSync(join(ROOT, 'docs/beta/known-limitations.md'))
);

// 13. App compila (estrutura mínima + tsconfig)
check('13. tsconfig.json existe', existsSync(join(ROOT, 'tsconfig.json')));
check('13b. entry expo-router', existsSync(join(ROOT, 'src/app/_layout.tsx')));

// 14. expo-doctor — verificado manualmente na validação obrigatória
check('14. package.json expo ~56', /"expo":\s*"~56/.test(pkg));

// 15. .env ignorado
const gitignore = readRel('.gitignore');
check('15. .env no .gitignore', /^\.env$/m.test(gitignore));

// 16. dist ignorado
check('16. dist/ no .gitignore', /^dist\/$/m.test(gitignore));

// Extras
check(
  'Extra. Sem docs RevenueCat',
  !existsSync(join(ROOT, 'docs/revenuecat'))
);
check(
  'Extra. BETA_SOFT_LIMITS ativo',
  /BETA_SOFT_LIMITS\s*=\s*true/.test(readRel('src/entitlements/limits.ts'))
);
check('Extra. +not-found existe', existsSync(join(ROOT, 'src/app/+not-found.tsx')));

console.log('');
if (failures === 0) {
  console.log('Auditoria Beta Gratuito: TODAS as verificações passaram.');
} else {
  console.error(`Auditoria Beta Gratuito: ${failures} verificação(ões) falharam.`);
  process.exitCode = 1;
}
