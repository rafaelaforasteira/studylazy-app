import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { getQuestionBankStats } from '../src/data/questionBank';
import {
  BETA_SOFT_LIMITS,
  FREE_LIMITS,
} from '../src/entitlements/limits';
import {
  canAccessAdvancedStats,
  checkSessionStart,
  resolveEntitlementState,
  sliceReviewQueue,
} from '../src/entitlements/entitlementLogic';
import {
  createPurchaseGuard,
  purchaseProPackage,
  restorePurchases,
} from '../src/entitlements/purchaseFlow';
import {
  EXPECTED_PRODUCT_IDS,
  REVENUECAT_ENTITLEMENT_PRO,
} from '../src/entitlements/revenueCatProducts';
import {
  extractOfferingOptions,
  getRevenueCatApiKey,
  hasAvailableOfferings,
  isProEntitlementActive,
  isRevenueCatConfigured,
  mapCustomerInfoToPlan,
  mapPurchaseError,
  mapRestoreResult,
  requiresLoginForPurchase,
  shouldKeepLastKnownPlanOnSyncFailure,
  type CustomerInfoLike,
  type PackageLike,
} from '../src/entitlements/revenueCatLogic';

let passed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      passed += 1;
      console.log(`OK   ${name}`);
    })
    .catch((error) => {
      console.error(`FALHA ${name}`);
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}

function proCustomerInfo(): CustomerInfoLike {
  return {
    entitlements: { active: { [REVENUECAT_ENTITLEMENT_PRO]: {} } },
  };
}

function freeCustomerInfo(): CustomerInfoLike {
  return { entitlements: { active: {} } };
}

const mockPkg: PackageLike = {
  identifier: 'monthly_pkg',
  packageType: 'MONTHLY',
  product: {
    identifier: EXPECTED_PRODUCT_IDS.monthly,
    title: 'Pro Mensal',
    priceString: 'R$ 9,90',
  },
};

async function run() {
  await test('inicialização sem chave: não configurado', () => {
    assert.equal(
      isRevenueCatConfigured('android', { android: '', ios: '', web: '' }),
      false
    );
    assert.equal(getRevenueCatApiKey('android', { android: null }), null);
  });

  await test('inicialização Android: chave presente', () => {
    assert.equal(
      isRevenueCatConfigured('android', { android: 'android_rc_public_key' }),
      true
    );
    assert.equal(
      getRevenueCatApiKey('android', { android: ' android_rc_public_key ' }),
      'android_rc_public_key'
    );
  });

  await test('usuário convidado: compra exige login', () => {
    assert.equal(requiresLoginForPurchase(false), true);
    assert.equal(requiresLoginForPurchase(true), false);
  });

  await test('usuário logado: pode iniciar fluxo de compra', async () => {
    const result = await purchaseProPackage({
      client: {
        purchasePackage: async () => ({
          customerInfo: proCustomerInfo(),
        }),
        restorePurchases: async () => ({ customerInfo: freeCustomerInfo() }),
      },
      pkg: mockPkg,
      isAuthenticated: true,
    });
    assert.equal(result.status, 'success');
    if (result.status === 'success') {
      assert.equal(result.plan, 'pro');
    }
  });

  await test('entitlement ausente → plano Free', () => {
    const mapped = mapCustomerInfoToPlan(freeCustomerInfo());
    assert.equal(mapped.plan, 'free');
    assert.equal(mapped.source, 'revenuecat');
    assert.equal(isProEntitlementActive(freeCustomerInfo()), false);
  });

  await test('entitlement Pro ativo → plano Pro', () => {
    const mapped = mapCustomerInfoToPlan(proCustomerInfo());
    assert.equal(mapped.plan, 'pro');
    assert.equal(isProEntitlementActive(proCustomerInfo()), true);
  });

  await test('offerings ausentes', () => {
    assert.equal(hasAvailableOfferings(null), false);
    assert.equal(hasAvailableOfferings({ current: null }), false);
    assert.equal(
      hasAvailableOfferings({ current: { availablePackages: [] } }),
      false
    );
    assert.equal(extractOfferingOptions(null).length, 0);
  });

  await test('offerings com mensal e anual', () => {
    const options = extractOfferingOptions({
      current: {
        availablePackages: [
          mockPkg,
          {
            identifier: 'annual_pkg',
            packageType: 'ANNUAL',
            product: {
              identifier: EXPECTED_PRODUCT_IDS.annual,
              priceString: 'R$ 79,90',
            },
          },
        ],
      },
    });
    assert.equal(options.length, 2);
    assert.equal(options[0]?.packageType, 'monthly');
    assert.equal(options[1]?.packageType, 'annual');
  });

  await test('compra cancelada pelo usuário', async () => {
    const result = await purchaseProPackage({
      client: {
        purchasePackage: async () => ({
          customerInfo: freeCustomerInfo(),
          error: { userCancelled: true },
        }),
        restorePurchases: async () => ({ customerInfo: freeCustomerInfo() }),
      },
      pkg: mockPkg,
      isAuthenticated: true,
    });
    assert.equal(result.status, 'cancelled');
    assert.equal(mapPurchaseError({ userCancelled: true }), 'Compra cancelada.');
  });

  await test('compra bem-sucedida confirma Pro', async () => {
    const result = await purchaseProPackage({
      client: {
        purchasePackage: async () => ({ customerInfo: proCustomerInfo() }),
        restorePurchases: async () => ({ customerInfo: freeCustomerInfo() }),
      },
      pkg: mockPkg,
      isAuthenticated: true,
    });
    assert.equal(result.status, 'success');
  });

  await test('compra sem confirmação de entitlement → erro', async () => {
    const result = await purchaseProPackage({
      client: {
        purchasePackage: async () => ({ customerInfo: freeCustomerInfo() }),
        restorePurchases: async () => ({ customerInfo: freeCustomerInfo() }),
      },
      pkg: mockPkg,
      isAuthenticated: true,
    });
    assert.equal(result.status, 'error');
  });

  await test('proteção contra toque duplo na compra', async () => {
    const guard = createPurchaseGuard();
    let calls = 0;
    const client = {
      purchasePackage: async () => {
        calls += 1;
        await new Promise((r) => setTimeout(r, 10));
        return { customerInfo: proCustomerInfo() };
      },
      restorePurchases: async () => ({ customerInfo: freeCustomerInfo() }),
    };
    const first = purchaseProPackage({
      client,
      pkg: mockPkg,
      isAuthenticated: true,
      guard,
    });
    const second = purchaseProPackage({
      client,
      pkg: mockPkg,
      isAuthenticated: true,
      guard,
    });
    const [r1, r2] = await Promise.all([first, second]);
    assert.equal(calls, 1);
    const statuses = [r1.status, r2.status].sort();
    assert.deepEqual(statuses, ['error', 'success']);
  });

  await test('restauração sem compra', async () => {
    const result = await restorePurchases({
      client: {
        purchasePackage: async () => ({ customerInfo: freeCustomerInfo() }),
        restorePurchases: async () => ({ customerInfo: freeCustomerInfo() }),
      },
    });
    assert.equal(result.status, 'none');
    assert.equal(
      mapRestoreResult(freeCustomerInfo()).message,
      'Nenhuma assinatura ativa encontrada para esta conta.'
    );
  });

  await test('restauração com Pro', async () => {
    const result = await restorePurchases({
      client: {
        purchasePackage: async () => ({ customerInfo: proCustomerInfo() }),
        restorePurchases: async () => ({ customerInfo: proCustomerInfo() }),
      },
    });
    assert.equal(result.status, 'restored');
    assert.equal(mapRestoreResult(proCustomerInfo()).restored, true);
  });

  await test('limite Free (sessões)', () => {
    const free = resolveEntitlementState({
      plan: 'free',
      devProEnabled: false,
      source: 'revenuecat',
    });
    const decision = checkSessionStart({
      entitlement: free,
      progress: {
        lessonHistory: Array.from({ length: FREE_LIMITS.dailySessions }, (_, i) => ({
          id: `l-${i}`,
          subject: 'Português',
          minutes: 5,
          totalQuestions: 5,
          correctAnswers: 3,
          earnedXp: 10,
          date: '2026-07-10',
        })),
        answeredQuestionsToday: 0,
        dailyProgressDate: '2026-07-10',
        lastStudyDate: '2026-07-10',
      },
      questionCount: 5,
      today: '2026-07-10',
    });
    assert.equal(decision.allowed, false);
    assert.equal(decision.softOverride, BETA_SOFT_LIMITS);
  });

  await test('acesso Pro ilimitado (RevenueCat)', () => {
    const pro = resolveEntitlementState({
      plan: 'pro',
      devProEnabled: false,
      source: 'revenuecat',
    });
    const decision = checkSessionStart({
      entitlement: pro,
      progress: {
        lessonHistory: Array.from({ length: 50 }, (_, i) => ({
          id: `l-${i}`,
          subject: 'Português',
          minutes: 5,
          totalQuestions: 5,
          correctAnswers: 3,
          earnedXp: 10,
          date: '2026-07-10',
        })),
        answeredQuestionsToday: 500,
        dailyProgressDate: '2026-07-10',
        lastStudyDate: '2026-07-10',
      },
      questionCount: 20,
      today: '2026-07-10',
    });
    assert.equal(decision.allowed, true);
    assert.equal(canAccessAdvancedStats(pro), true);
    assert.equal(sliceReviewQueue(Array.from({ length: 30 }, (_, i) => `m-${i}`), pro).length, 30);
  });

  await test('logout/login: convidado exige login na compra', async () => {
    const guestPurchase = await purchaseProPackage({
      client: {
        purchasePackage: async () => ({ customerInfo: proCustomerInfo() }),
        restorePurchases: async () => ({ customerInfo: freeCustomerInfo() }),
      },
      pkg: mockPkg,
      isAuthenticated: false,
    });
    assert.equal(guestPurchase.status, 'login_required');
  });

  await test('offline: manter último estado conhecido', () => {
    assert.equal(shouldKeepLastKnownPlanOnSyncFailure(true), true);
    assert.equal(shouldKeepLastKnownPlanOnSyncFailure(false), false);
  });

  await test('erro de rede mapeado', () => {
    assert.match(
      mapPurchaseError({ message: 'Network request failed' }),
      /internet|conexão/i
    );
  });

  await test('produto indisponível mapeado', () => {
    assert.match(
      mapPurchaseError({ code: 'product_not_available' }),
      /disponível/i
    );
  });

  await test('entitlement centralizado como "pro"', () => {
    assert.equal(REVENUECAT_ENTITLEMENT_PRO, 'pro');
    assert.equal(EXPECTED_PRODUCT_IDS.monthly, 'studylazy_pro_monthly');
    assert.equal(EXPECTED_PRODUCT_IDS.annual, 'studylazy_pro_annual');
  });

  await test('149 questões oficiais intactas', () => {
    const stats = getQuestionBankStats();
    assert.equal(stats.totalOfficialQuestions, 149);
  });

  await test('camada central revenueCat.ts existe', () => {
    const root = join(__dirname, '..');
    assert.equal(existsSync(join(root, 'src/lib/revenueCat.ts')), true);
    const src = readFileSync(join(root, 'src/lib/revenueCat.ts'), 'utf8');
    assert.match(src, /initializeRevenueCat/);
    assert.match(src, /purchaseProPackage/);
    assert.match(src, /restorePurchases/);
    assert.doesNotMatch(src, /sk_live_|goog_[a-zA-Z0-9]{20,}/);
  });

  await test('.env.example documenta chaves RevenueCat', () => {
    const env = readFileSync(join(__dirname, '..', '.env.example'), 'utf8');
    assert.match(env, /EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY/);
    assert.match(env, /EXPO_PUBLIC_REVENUECAT_IOS_API_KEY/);
    assert.match(env, /EXPO_PUBLIC_REVENUECAT_WEB_API_KEY/);
  });
}

run().then(() => {
  console.log(`\n${passed} teste(s) RevenueCat/Pro passaram.`);
  if (process.exitCode === 1) {
    console.error('Alguns testes falharam.');
  }
});
