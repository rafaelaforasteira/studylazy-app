import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { getQuestionBankStats } from '../src/data/questionBank';
import { FREE_LIMITS } from '../src/entitlements/limits';
import { resolveEntitlementState } from '../src/entitlements/entitlementLogic';

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

console.log('=== Auditoria: Plano Gratuito vs Pro (PASSO 2) ===\n');

// 1. Padrão Free
const store = readRel('src/entitlements/entitlementStore.ts');
check('1. Plano padrão é Free', /plan:\s*'free'/.test(store));

const defaultState = resolveEntitlementState({
  plan: 'free',
  devProEnabled: false,
  source: 'default',
});
check('1b. resolveEntitlementState retorna Free por padrão', !defaultState.isPro);

// 2. Pro representado corretamente
const logic = readRel('src/entitlements/entitlementLogic.ts');
check('2. Pro via plan ou devProEnabled', /devProEnabled/.test(logic));
const proState = resolveEntitlementState({
  plan: 'pro',
  devProEnabled: false,
  source: 'default',
});
check('2b. plan=pro resolve isPro', proState.isPro === true);

// 3. Constantes centralizadas
const limits = readRel('src/entitlements/limits.ts');
check('3. FREE_LIMITS centralizado', /FREE_LIMITS/.test(limits));
check(
  '3b. Limites diários definidos',
  FREE_LIMITS.dailySessions > 0 &&
    FREE_LIMITS.dailyQuestions > 0 &&
    FREE_LIMITS.dailyReviewMistakes > 0
);

// 4. Nenhuma dependência de pagamento
const pkg = readRel('package.json');
check(
  '4. Sem Stripe/RevenueCat/Billing no package.json',
  !/stripe|revenuecat|react-native-purchases|google-play-billing|iap/i.test(pkg)
);

// 5. Nenhuma chave de pagamento
const allFiles = walk(join(ROOT, 'src'));
const paymentKeys = allFiles.filter((file) => {
  const text = readFileSync(file, 'utf8');
  return /sk_live_|pk_live_|revenuecat_api|stripe_secret/i.test(text);
});
check(
  '5. Nenhuma chave de pagamento no código',
  paymentKeys.length === 0,
  paymentKeys.join(', ')
);

// 6. 149 questões intactas
const stats = getQuestionBankStats();
check(
  '6. 149 questões oficiais intactas',
  stats.totalOfficialQuestions === 149,
  `total=${stats.totalOfficialQuestions}`
);

// 7. Auth preservado (smoke: arquivos existem)
check('7. authStore preservado', existsSync(join(ROOT, 'src/store/authStore.ts')));
check(
  '7b. accountSecurity preservado',
  existsSync(join(ROOT, 'src/lib/accountSecurity.ts'))
);

// 8. Sync preservado
check(
  '8. syncCoordinator preservado',
  existsSync(join(ROOT, 'src/sync/syncCoordinator.ts'))
);
check(
  '8b. syncSerializer preservado',
  existsSync(join(ROOT, 'src/sync/syncSerializer.ts'))
);

// 9. EAS preservado
check('9. eas.json preservado', existsSync(join(ROOT, 'eas.json')));
const appJson = readRel('app.json');
check('9b. app.json com package Android', /com\.studylazy\.app/.test(appJson));

// 10. Tela Pro
check('10. Tela /pro existe', existsSync(join(ROOT, 'src/app/pro.tsx')));
const proScreen = readRel('src/app/pro.tsx');
check(
  '10b. Sem promessa de preço',
  !/R\$\s*\d|\/mês|preço fixo/i.test(proScreen)
);

// 11. Cards de upgrade
check(
  '11. UpgradeCard existe',
  existsSync(join(ROOT, 'src/components/entitlements/UpgradeCard.tsx'))
);
const voce = readRel('src/app/(tabs)/voce.tsx');
const settings = readRel('src/app/settings.tsx');
const revisar = readRel('src/app/(tabs)/revisar.tsx');
check('11b. Card em Você', /UpgradeCard/.test(voce));
check('11c. Card em Configurações', /UpgradeCard/.test(settings));
check('11d. Card/hint em Revisar', /UpgradeCard|shouldShowReviewLimitHint/.test(revisar));

// 12. App compila (estrutura mínima)
check('12. Módulo entitlements exporta tipos', existsSync(join(ROOT, 'src/entitlements/index.ts')));
check(
  '12b. use-start-study integra limites',
  /checkSessionStart/.test(readRel('src/hooks/use-start-study.ts'))
);

// Beta polish extras
check(
  'Extra. beta-checklist existe',
  existsSync(join(ROOT, 'src/app/dev/beta-checklist.tsx'))
);
check('Extra. +not-found existe', existsSync(join(ROOT, 'src/app/+not-found.tsx')));
check(
  'Extra. AppAccessGate nas abas',
  /AppAccessGate/.test(readRel('src/app/(tabs)/_layout.tsx'))
);

console.log('');
if (failures === 0) {
  console.log('Auditoria Free/Pro: TODAS as verificações passaram.');
} else {
  console.error(`Auditoria Free/Pro: ${failures} verificação(ões) falharam.`);
  process.exitCode = 1;
}
