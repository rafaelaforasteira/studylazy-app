import assert from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getQuestionBankStats, getQuestionsForLesson } from '../src/data/questionBank';
import { BETA_SOFT_LIMITS } from '../src/entitlements/limits';
import {
  checkSessionStart,
  resolveEntitlementState,
  sliceReviewQueue,
} from '../src/entitlements/entitlementLogic';
import { describeSyncStatus } from '../src/store/syncStore';

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

const root = join(__dirname, '..');

async function run() {
  await test('modo convidado: plano Free padrão', () => {
    const guest = resolveEntitlementState({
      plan: 'free',
      devProEnabled: false,
      source: 'default',
    });
    assert.equal(guest.isPro, false);
    assert.equal(guest.plan, 'free');
  });

  await test('usuário autenticado: estrutura não exige Pro', () => {
    const logged = resolveEntitlementState({
      plan: 'free',
      devProEnabled: false,
      source: 'remote_future',
    });
    assert.equal(logged.isPro, false);
  });

  await test('plano free padrão no store', () => {
    const store = readFileSync(
      join(root, 'src/entitlements/entitlementStore.ts'),
      'utf8'
    );
    assert.match(store, /plan:\s*'free'/);
  });

  await test('tela Pro sem pagamento', () => {
    const pro = readFileSync(join(root, 'src/app/pro.tsx'), 'utf8');
    assert.match(pro, /Em breve|lista de espera/i);
    assert.doesNotMatch(pro, /Assinar Pro|Restaurar compra|react-native-purchases/i);
    assert.match(pro, /sem cobrança|não estão disponíveis|não há valor/i);
  });

  await test('sessão de estudo permitida (soft limits beta)', () => {
    assert.equal(BETA_SOFT_LIMITS, true);
    const free = resolveEntitlementState({
      plan: 'free',
      devProEnabled: false,
      source: 'default',
    });
    const decision = checkSessionStart({
      entitlement: free,
      progress: {
        lessonHistory: Array.from({ length: 10 }, (_, i) => ({
          id: `l-${i}`,
          subject: 'Português',
          minutes: 5,
          totalQuestions: 5,
          correctAnswers: 3,
          earnedXp: 10,
          date: '2026-07-11',
        })),
        answeredQuestionsToday: 100,
        dailyProgressDate: '2026-07-11',
        lastStudyDate: '2026-07-11',
      },
      questionCount: 5,
      today: '2026-07-11',
    });
    assert.equal(decision.allowed, false);
    assert.equal(decision.softOverride, true);
  });

  await test('idioma com até 4 questões oficiais', () => {
    const stats = getQuestionBankStats();
    assert.equal(stats.officialBySubject['Inglês'], 4);
    assert.equal(stats.officialBySubject['Espanhol'], 4);
    const english = getQuestionsForLesson({
      subject: 'Inglês',
      amount: 5,
    });
    assert.equal(english.length, 4);
  });

  await test('revisão não quebra (slice Free)', () => {
    const free = resolveEntitlementState({
      plan: 'free',
      devProEnabled: false,
      source: 'default',
    });
    const queue = Array.from({ length: 15 }, (_, i) => `m-${i}`);
    const sliced = sliceReviewQueue(queue, free);
    assert.equal(sliced.length, 10);
    assert.deepEqual(sliced, queue.slice(0, 10));
  });

  await test('sync não quebra (describeSyncStatus)', () => {
    assert.equal(describeSyncStatus('idle', null, false).label.length > 0, true);
    assert.equal(describeSyncStatus('syncing', null, true).tone, 'neutral');
    assert.match(describeSyncStatus('error', null, false).label, /Falha/i);
  });

  await test('logout não quebra (authStore expõe signOut)', () => {
    const auth = readFileSync(join(root, 'src/store/authStore.ts'), 'utf8');
    assert.match(auth, /signOut/);
    assert.match(auth, /scope.*local|local.*global/i);
  });

  await test('ausência de SDK de pagamento', () => {
    const pkg = JSON.parse(
      readFileSync(join(root, 'package.json'), 'utf8')
    ) as { dependencies?: Record<string, string> };
    const deps = Object.keys(pkg.dependencies ?? {}).join(' ');
    assert.doesNotMatch(deps, /stripe|revenuecat|react-native-purchases|iap/i);
  });

  await test('ausência de chave de pagamento no src', () => {
    const pro = readFileSync(join(root, 'src/app/pro.tsx'), 'utf8');
    assert.doesNotMatch(pro, /sk_live_|goog_[a-zA-Z0-9]{20,}/);
  });

  await test('rotas beta existem', () => {
    assert.equal(
      existsSync(join(root, 'src/app/dev/beta-launch-checklist.tsx')),
      true
    );
    assert.equal(existsSync(join(root, 'src/app/dev/beta-checklist.tsx')), true);
    assert.equal(
      existsSync(join(root, 'src/app/dev/android-beta-health.tsx')),
      true
    );
    assert.equal(
      existsSync(join(root, 'src/app/dev/account-security-health.tsx')),
      true
    );
  });

  await test('149 questões oficiais intactas', () => {
    const stats = getQuestionBankStats();
    assert.equal(stats.totalOfficialQuestions, 149);
  });

  await test('docs beta existem', () => {
    assert.equal(
      existsSync(join(root, 'docs/beta/free-beta-launch-checklist.md')),
      true
    );
    assert.equal(
      existsSync(join(root, 'docs/beta/known-limitations.md')),
      true
    );
  });
}

run().then(() => {
  console.log(`\n${passed} teste(s) de prontidão beta gratuito passaram.`);
  if (process.exitCode === 1) {
    console.error('Alguns testes falharam.');
  }
});
