import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { getQuestionBankStats } from '../src/data/questionBank';
import { REVENUECAT_ENTITLEMENT_PRO } from '../src/entitlements/revenueCatProducts';
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
    } else if (/\.(ts|tsx|json|md|env)$/.test(entry) || entry === '.env.example') {
      files.push(full.replace(/\\/g, '/'));
    }
  }
  return files;
}

console.log('=== Auditoria: RevenueCat + Pro (PASSO 1 e 2) ===\n');

const allTracked = [
  ...walk(join(ROOT, 'src')),
  ...walk(join(ROOT, 'scripts')),
  join(ROOT, 'package.json').replace(/\\/g, '/'),
  join(ROOT, '.env.example').replace(/\\/g, '/'),
  join(ROOT, 'eas.json').replace(/\\/g, '/'),
  join(ROOT, 'app.json').replace(/\\/g, '/'),
].filter((f) => existsSync(f));

// 1. Nenhuma chave real hardcoded (somente código do app)
const appFiles = walk(join(ROOT, 'src'));
const hardcodedKeys = appFiles.filter((file) => {
  const text = readFileSync(file, 'utf8');
  return /sk_live_|sk_test_[a-zA-Z0-9]{10,}|goog_[a-zA-Z0-9]{20,}|appl_[a-zA-Z0-9]{20,}/.test(
    text
  );
});
check('1. Nenhuma chave real hardcoded', hardcodedKeys.length === 0, hardcodedKeys.join(', '));

// 2. Nenhuma secret key
const secretRefs = allTracked.filter((file) => {
  const text = readFileSync(file, 'utf8');
  return /secret.?key|REVENUECAT_SECRET|service_role/i.test(text) && file.includes('src/');
});
check('2. Nenhuma secret key no app', secretRefs.length === 0, secretRefs.join(', '));

// 3. RevenueCat centralizado
const rcLib = readRel('src/lib/revenueCat.ts');
check('3. Cliente central em src/lib/revenueCat.ts', existsSync(join(ROOT, 'src/lib/revenueCat.ts')));
check('3b. Inicialização idempotente', /initState|initPromise/.test(rcLib));
check('3c. Chaves via process.env EXPO_PUBLIC', /EXPO_PUBLIC_REVENUECAT/.test(rcLib));

// 4. Entitlement pro centralizado
const products = readRel('src/entitlements/revenueCatProducts.ts');
check('4. Entitlement "pro" centralizado', REVENUECAT_ENTITLEMENT_PRO === 'pro');
check('4b. Constante exportada', /REVENUECAT_ENTITLEMENT_PRO\s*=\s*'pro'/.test(products));

// 5. Tela Pro usa camada central
const proScreen = readRel('src/app/pro.tsx');
check('5. Tela /pro importa lib/revenueCat', /from ['"].*lib\/revenueCat['"]/.test(proScreen));
check('5b. Botão Assinar Pro', /Assinar Pro/.test(proScreen));
check('5c. Botão Restaurar compra', /Restaurar compra/.test(proScreen));
check('5d. Aviso loja (sem cartão no app)', /loja|Google Play|App Store/i.test(proScreen));

// 6. Compra protegida contra duplo toque
const purchaseFlow = readRel('src/entitlements/purchaseFlow.ts');
check('6. createPurchaseGuard na camada pura', /createPurchaseGuard/.test(purchaseFlow));
check('6b. Guard usado no cliente', /purchaseGuard|createPurchaseGuard/.test(rcLib));

// 7. Restauração implementada
const settings = readRel('src/app/settings.tsx');
check('7. Restaurar em /pro', /restorePurchases/.test(proScreen));
check('7b. Restaurar em Configurações', /restorePurchases/.test(settings));

// 8. Ausência de Stripe/SDK duplicado
const pkg = readRel('package.json');
check('8. react-native-purchases instalado', /react-native-purchases/.test(pkg));
check(
  '8b. Sem Stripe ou billing duplicado',
  !/stripe|@stripe|google-play-billing|react-native-iap/i.test(pkg)
);

// 9. Free continua padrão
const store = readRel('src/entitlements/entitlementStore.ts');
check("9. Plano padrão Free", /plan:\s*'free'/.test(store));
const defaultState = resolveEntitlementState({
  plan: 'free',
  devProEnabled: false,
  source: 'default',
});
check('9b. resolveEntitlementState Free por padrão', !defaultState.isPro);

// 10. Pro depende de entitlement/plan
const logic = readRel('src/entitlements/revenueCatLogic.ts');
check('10. mapCustomerInfoToPlan usa entitlement', /isProEntitlementActive/.test(logic));
const proState = resolveEntitlementState({
  plan: 'pro',
  devProEnabled: false,
  source: 'revenuecat',
});
check('10b. plan=pro com source revenuecat', proState.isPro === true);

// 11. Auth preservado
check('11. authStore preservado', existsSync(join(ROOT, 'src/store/authStore.ts')));
check('11b. identifyRevenueCatUser no cliente', /identifyRevenueCatUser|logIn/.test(rcLib));

// 12. Sync preservado (sem recibos)
const syncSerializer = readRel('src/sync/syncSerializer.ts');
check('12. syncSerializer preservado', existsSync(join(ROOT, 'src/sync/syncSerializer.ts')));
check(
  '12b. Sync não serializa recibos RevenueCat',
  !/receipt|purchaseToken|revenuecat/i.test(syncSerializer)
);

// 13. EAS preservado
check('13. eas.json preservado', existsSync(join(ROOT, 'eas.json')));
check('13b. app.json package Android', /com\.studylazy\.app/.test(readRel('app.json')));

// 14. 149 questões intactas
const stats = getQuestionBankStats();
check(
  '14. 149 questões oficiais intactas',
  stats.totalOfficialQuestions === 149,
  `total=${stats.totalOfficialQuestions}`
);

// Extras
check('Extra. Docs environment-setup', existsSync(join(ROOT, 'docs/revenuecat/environment-setup.md')));
check('Extra. Docs products-setup', existsSync(join(ROOT, 'docs/revenuecat/products-setup.md')));
check('Extra. .env.example com chaves RC', /EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY/.test(readRel('.env.example')));
check('Extra. Hook useRevenueCat no layout', /useRevenueCat/.test(readRel('src/app/_layout.tsx')));

console.log('');
if (failures === 0) {
  console.log('Auditoria RevenueCat/Pro: TODAS as verificações passaram.');
} else {
  console.error(`Auditoria RevenueCat/Pro: ${failures} verificação(ões) falharam.`);
  process.exitCode = 1;
}
