import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { getQuestionBankStats } from '../src/data/questionBank';
import {
  BETA_SOFT_LIMITS,
  FREE_LIMITS,
  PRO_LIMITS,
} from '../src/entitlements/limits';
import {
  canAccessAdvancedStats,
  checkSessionStart,
  countSessionsOnDate,
  getEffectiveDailyQuestions,
  getPlanLimits,
  getReviewMistakeLimit,
  resolveEntitlementState,
  shouldShowReviewLimitHint,
  sliceReviewQueue,
} from '../src/entitlements/entitlementLogic';
import type { LessonHistoryItem } from '../src/store/progressLogic';

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

const today = '2026-07-10';

function makeHistory(count: number, date = today): LessonHistoryItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `lesson-${index}`,
    subject: 'Português',
    minutes: 5,
    totalQuestions: 5,
    correctAnswers: 3,
    earnedXp: 10,
    date,
  }));
}

async function run() {
  await test('padrão: usuário Free', () => {
    const state = resolveEntitlementState({
      plan: 'free',
      devProEnabled: false,
      source: 'default',
    });
    assert.equal(state.plan, 'free');
    assert.equal(state.isPro, false);
    assert.equal(state.source, 'default');
  });

  await test('dev: simulação Pro local', () => {
    const state = resolveEntitlementState({
      plan: 'free',
      devProEnabled: true,
      source: 'default',
    });
    assert.equal(state.isPro, true);
    assert.equal(state.source, 'local_dev');
  });

  await test('limites Free centralizados', () => {
    assert.equal(FREE_LIMITS.dailySessions, 3);
    assert.equal(FREE_LIMITS.dailyQuestions, 25);
    assert.equal(FREE_LIMITS.dailyReviewMistakes, 10);
    assert.equal(FREE_LIMITS.advancedStats, false);
  });

  await test('limites Pro sem teto prático', () => {
    assert.equal(PRO_LIMITS.advancedStats, true);
    assert.equal(Number.isFinite(PRO_LIMITS.dailySessions), false);
  });

  await test('reset diário de questões respondidas', () => {
    const yesterday = getEffectiveDailyQuestions(
      {
        lessonHistory: [],
        answeredQuestionsToday: 20,
        dailyProgressDate: '2026-07-09',
        lastStudyDate: '2026-07-09',
      },
      today
    );
    assert.equal(yesterday, 0);
  });

  await test('sessão permitida dentro do limite Free', () => {
    const free = resolveEntitlementState({
      plan: 'free',
      devProEnabled: false,
      source: 'default',
    });
    const decision = checkSessionStart({
      entitlement: free,
      progress: {
        lessonHistory: makeHistory(1),
        answeredQuestionsToday: 5,
        dailyProgressDate: today,
        lastStudyDate: today,
      },
      questionCount: 5,
      today,
    });
    assert.equal(decision.allowed, true);
  });

  await test('sessão acima do limite diário de sessões', () => {
    const free = resolveEntitlementState({
      plan: 'free',
      devProEnabled: false,
      source: 'default',
    });
    const decision = checkSessionStart({
      entitlement: free,
      progress: {
        lessonHistory: makeHistory(FREE_LIMITS.dailySessions),
        answeredQuestionsToday: 0,
        dailyProgressDate: today,
        lastStudyDate: today,
      },
      questionCount: 5,
      today,
    });
    assert.equal(decision.allowed, false);
    assert.equal(decision.reason, 'daily_sessions');
    assert.equal(decision.softOverride, BETA_SOFT_LIMITS);
  });

  await test('sessão acima do limite diário de questões', () => {
    const free = resolveEntitlementState({
      plan: 'free',
      devProEnabled: false,
      source: 'default',
    });
    const decision = checkSessionStart({
      entitlement: free,
      progress: {
        lessonHistory: [],
        answeredQuestionsToday: 22,
        dailyProgressDate: today,
        lastStudyDate: today,
      },
      questionCount: 5,
      today,
    });
    assert.equal(decision.allowed, false);
    assert.equal(decision.reason, 'daily_questions');
  });

  await test('Pro ignora limites de sessão', () => {
    const pro = resolveEntitlementState({
      plan: 'pro',
      devProEnabled: false,
      source: 'default',
    });
    const decision = checkSessionStart({
      entitlement: pro,
      progress: {
        lessonHistory: makeHistory(50),
        answeredQuestionsToday: 200,
        dailyProgressDate: today,
        lastStudyDate: today,
      },
      questionCount: 15,
      today,
    });
    assert.equal(decision.allowed, true);
  });

  await test('revisão limitada no Free', () => {
    const free = resolveEntitlementState({
      plan: 'free',
      devProEnabled: false,
      source: 'default',
    });
    const items = Array.from({ length: 15 }, (_, i) => `m-${i}`);
    const sliced = sliceReviewQueue(items, free);
    assert.equal(sliced.length, FREE_LIMITS.dailyReviewMistakes);
    assert.equal(getReviewMistakeLimit(free), FREE_LIMITS.dailyReviewMistakes);
  });

  await test('hint visual de limite de revisão', () => {
    const free = resolveEntitlementState({
      plan: 'free',
      devProEnabled: false,
      source: 'default',
    });
    assert.equal(shouldShowReviewLimitHint(11, free), true);
    assert.equal(shouldShowReviewLimitHint(5, free), false);
    const pro = resolveEntitlementState({
      plan: 'pro',
      devProEnabled: true,
      source: 'local_dev',
    });
    assert.equal(shouldShowReviewLimitHint(99, pro), false);
  });

  await test('estatísticas avançadas bloqueadas no Free', () => {
    const free = resolveEntitlementState({
      plan: 'free',
      devProEnabled: false,
      source: 'default',
    });
    assert.equal(canAccessAdvancedStats(free), false);
    assert.equal(getPlanLimits(free).advancedStats, false);
  });

  await test('contagem de sessões por dia', () => {
    assert.equal(countSessionsOnDate(makeHistory(2), today), 2);
    assert.equal(countSessionsOnDate(makeHistory(1, '2026-07-09'), today), 0);
  });

  await test('tela Pro existe', () => {
    const root = join(__dirname, '..');
    assert.equal(existsSync(join(root, 'src/app/pro.tsx')), true);
    const pro = readFileSync(join(root, 'src/app/pro.tsx'), 'utf8');
    assert.match(pro, /Em breve|lista de espera/i);
    assert.doesNotMatch(pro, /R\$\s*\d|\/mês/i);
  });

  await test('ausência de SDK de pagamento no package.json', () => {
    const pkg = JSON.parse(
      readFileSync(join(__dirname, '..', 'package.json'), 'utf8')
    ) as { dependencies?: Record<string, string> };
    const deps = Object.keys(pkg.dependencies ?? {}).join(' ');
    assert.doesNotMatch(deps, /stripe|revenuecat|react-native-purchases|iap/i);
  });

  await test('compatível com convidado (plano default Free)', () => {
    const guest = resolveEntitlementState({
      plan: 'free',
      devProEnabled: false,
      source: 'default',
    });
    assert.equal(guest.isPro, false);
  });

  await test('compatível com usuário logado (estrutura não depende de auth)', () => {
    const logged = resolveEntitlementState({
      plan: 'free',
      devProEnabled: false,
      source: 'remote_future',
    });
    assert.equal(logged.plan, 'free');
  });

  await test('149 questões oficiais intactas', () => {
    const stats = getQuestionBankStats();
    assert.equal(stats.totalOfficialQuestions, 149);
  });
}

run().then(() => {
  console.log(`\n${passed} teste(s) de plano Free/Pro passaram.`);
  if (process.exitCode === 1) {
    console.error('Alguns testes falharam.');
  }
});
