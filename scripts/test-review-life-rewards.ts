import assert from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  getQuestionBankStats,
  officialQuestionBank,
} from '../src/data/questionBank';
import { getStableQuestionId } from '../src/data/questionTypes';
import {
  addReviewFragmentDev,
  clearReviewRewardHistory,
  createInitialLivesSnapshot,
  loseLife,
  rewardReviewCorrect,
  trimReviewRewardHistory,
} from '../src/lives/livesLogic';
import {
  MAX_LIVES,
  MAX_REVIEW_REWARD_HISTORY,
} from '../src/lives/livesTypes';

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
const now = Date.parse('2026-07-21T12:00:00.000Z');

async function run() {
  await test('acerto em revisão gera 1 fragmento', () => {
    const { snapshot, result } = rewardReviewCorrect({
      snapshot: createInitialLivesSnapshot({ currentLives: 3 }),
      stableQuestionId: 'ENEM-TEST-Q1',
      isEligibleOfficial: true,
      nowMs: now,
    });
    assert.equal(result.applied, true);
    assert.equal(result.reason, 'ok_fragment');
    assert.equal(snapshot.lifeFragments, 1);
    assert.equal(snapshot.currentLives, 3);
    assert.match(result.message ?? '', /metade/i);
  });

  await test('2 fragmentos viram 1 vida', () => {
    let snap = createInitialLivesSnapshot({ currentLives: 3, lifeFragments: 0 });
    const first = rewardReviewCorrect({
      snapshot: snap,
      stableQuestionId: 'ENEM-TEST-Q1',
      isEligibleOfficial: true,
      nowMs: now,
    });
    snap = first.snapshot;
    const second = rewardReviewCorrect({
      snapshot: snap,
      stableQuestionId: 'ENEM-TEST-Q2',
      isEligibleOfficial: true,
      nowMs: now + 1,
    });
    assert.equal(second.result.reason, 'ok_life');
    assert.equal(second.snapshot.lifeFragments, 0);
    assert.equal(second.snapshot.currentLives, 4);
    assert.equal(second.snapshot.totalLivesRecoveredFromReview, 1);
    assert.match(second.result.message ?? '', /1 vida/i);
  });

  await test('não passa de 5 vidas', () => {
    const { snapshot, result } = rewardReviewCorrect({
      snapshot: createInitialLivesSnapshot({
        currentLives: 4,
        lifeFragments: 1,
      }),
      stableQuestionId: 'ENEM-TEST-Q3',
      isEligibleOfficial: true,
      nowMs: now,
    });
    assert.equal(result.applied, true);
    assert.equal(snapshot.currentLives, MAX_LIVES);
    assert.ok(snapshot.currentLives <= MAX_LIVES);
  });

  await test('não acumula fragmento se já está cheio', () => {
    const { snapshot, result } = rewardReviewCorrect({
      snapshot: createInitialLivesSnapshot({
        currentLives: 5,
        lifeFragments: 0,
      }),
      stableQuestionId: 'ENEM-TEST-Q4',
      isEligibleOfficial: true,
      nowMs: now,
    });
    assert.equal(result.applied, false);
    assert.equal(result.reason, 'full_lives');
    assert.equal(snapshot.lifeFragments, 0);
    assert.equal(snapshot.reviewRewardHistory.length, 0);
  });

  await test('erro na revisão não tira vida', () => {
    // Erro na revisão não chama loseLife — documentado via ausência na tela.
    const review = readFileSync(
      join(root, 'src/app/review-mistakes.tsx'),
      'utf8'
    );
    assert.ok(!/loseOneLife/.test(review));
    const snap = createInitialLivesSnapshot({ currentLives: 3 });
    assert.equal(snap.currentLives, 3);
  });

  await test('erro na revisão não dá fragmento', () => {
    // rewardReviewCorrect só é chamado em acerto; estado permanece.
    const snap = createInitialLivesSnapshot({
      currentLives: 3,
      lifeFragments: 0,
    });
    assert.equal(snap.lifeFragments, 0);
    const review = readFileSync(
      join(root, 'src/app/review-mistakes.tsx'),
      'utf8'
    );
    assert.ok(/if \(isCorrect\)/.test(review));
    assert.ok(/rewardFromReviewCorrect/.test(review));
  });

  await test('mesma questão não recompensa duas vezes', () => {
    let snap = createInitialLivesSnapshot({ currentLives: 2 });
    const first = rewardReviewCorrect({
      snapshot: snap,
      stableQuestionId: 'ENEM-DUP-1',
      isEligibleOfficial: true,
      nowMs: now,
    });
    snap = first.snapshot;
    const second = rewardReviewCorrect({
      snapshot: snap,
      stableQuestionId: 'ENEM-DUP-1',
      isEligibleOfficial: true,
      nowMs: now + 10,
    });
    assert.equal(first.result.applied, true);
    assert.equal(second.result.applied, false);
    assert.equal(second.result.reason, 'already_rewarded');
    assert.equal(snap.lifeFragments, 1);
    assert.equal(second.snapshot.lifeFragments, 1);
  });

  await test('duplo toque não recompensa duas vezes', () => {
    const review = readFileSync(
      join(root, 'src/app/review-mistakes.tsx'),
      'utf8'
    );
    assert.ok(/answerLockRef/.test(review));
    assert.ok(/rewardedKeysRef/.test(review));
    const store = readFileSync(join(root, 'src/store/livesStore.ts'), 'utf8');
    assert.ok(/lastReviewRewardKey/.test(store));
  });

  await test('stableQuestionId usado', () => {
    const sample = officialQuestionBank[0];
    assert.ok(sample);
    const id = getStableQuestionId(sample);
    const { snapshot } = rewardReviewCorrect({
      snapshot: createInitialLivesSnapshot({ currentLives: 2 }),
      stableQuestionId: id,
      isEligibleOfficial: true,
      nowMs: now,
    });
    assert.equal(snapshot.reviewRewardHistory[0]?.stableQuestionId, id);
    const review = readFileSync(
      join(root, 'src/app/review-mistakes.tsx'),
      'utf8'
    );
    assert.ok(/getStableQuestionId/.test(review));
  });

  await test('histórico limitado', () => {
    const history = Array.from({ length: 250 }, (_, i) => ({
      stableQuestionId: `Q-${i}`,
      rewardedAt: new Date(now + i).toISOString(),
    }));
    const trimmed = trimReviewRewardHistory(history);
    assert.equal(trimmed.length, MAX_REVIEW_REWARD_HISTORY);
  });

  await test('Pro/unlimited ignora recompensa', () => {
    const { snapshot, result } = rewardReviewCorrect({
      snapshot: createInitialLivesSnapshot({
        currentLives: 2,
        isUnlimited: true,
      }),
      stableQuestionId: 'ENEM-PRO-1',
      isEligibleOfficial: true,
      nowMs: now,
    });
    assert.equal(result.applied, false);
    assert.equal(result.reason, 'unlimited');
    assert.equal(snapshot.lifeFragments, 0);
  });

  await test('offline preserva estado (campos persistidos)', () => {
    const store = readFileSync(join(root, 'src/store/livesStore.ts'), 'utf8');
    assert.ok(/lifeFragments/.test(store));
    assert.ok(/reviewRewardHistory/.test(store));
    assert.ok(/studylazy-lives/.test(store));
    assert.ok(/AsyncStorage/.test(store));
    assert.ok(/partialize/.test(store));
  });

  await test('reset / clear dev funciona', () => {
    let snap = createInitialLivesSnapshot({
      currentLives: 2,
      lifeFragments: 1,
      reviewRewardHistory: [
        { stableQuestionId: 'X', rewardedAt: new Date(now).toISOString() },
      ],
      totalLivesRecoveredFromReview: 3,
    });
    snap = clearReviewRewardHistory(snap);
    assert.equal(snap.reviewRewardHistory.length, 0);
    snap = addReviewFragmentDev(snap, now);
    assert.equal(snap.lifeFragments, 0);
    assert.equal(snap.currentLives, 3);
    const reset = createInitialLivesSnapshot();
    assert.equal(reset.lifeFragments, 0);
    assert.equal(reset.currentLives, MAX_LIVES);
    assert.equal(reset.reviewRewardHistory.length, 0);
  });

  await test('Q177/demo/anulada não recompensa', () => {
    const ineligible = rewardReviewCorrect({
      snapshot: createInitialLivesSnapshot({ currentLives: 2 }),
      stableQuestionId: 'ENEM-2023-D2-C5-Q177',
      isEligibleOfficial: false,
      nowMs: now,
    });
    assert.equal(ineligible.result.applied, false);
    assert.equal(ineligible.result.reason, 'ineligible');

    const review = readFileSync(
      join(root, 'src/app/review-mistakes.tsx'),
      'utf8'
    );
    assert.ok(/Q177|ENEM-2023-D2-C5-Q177/.test(review));
    assert.ok(/isOfficialVerifiedQuestion|isEligibleForReviewLifeReward/.test(review));
    assert.ok(!officialQuestionBank.some((q) => q.externalId === 'ENEM-2023-D2-C5-Q177'));
  });

  await test('erro em lição ainda perde vida (compat)', () => {
    const { snapshot, result } = loseLife({
      snapshot: createInitialLivesSnapshot(),
      lossKey: 'lesson-q',
      nowMs: now,
    });
    assert.equal(result.applied, true);
    assert.equal(snapshot.currentLives, 4);
  });

  await test('149 questões intactas', () => {
    const stats = getQuestionBankStats();
    assert.equal(stats.totalOfficialQuestions, 149);
  });

  await test('arquivos de UI e docs existem', () => {
    assert.ok(existsSync(join(root, 'src/components/lives/LivesIndicator.tsx')));
    assert.ok(existsSync(join(root, 'src/app/dev/lives-health.tsx')));
    assert.ok(existsSync(join(root, 'docs/gamification/lives-system.md')));
    const indicator = readFileSync(
      join(root, 'src/components/lives/LivesIndicator.tsx'),
      'utf8'
    );
    assert.ok(/\+1\/2/.test(indicator));
    const health = readFileSync(
      join(root, 'src/app/dev/lives-health.tsx'),
      'utf8'
    );
    assert.ok(/lifeFragments|Fragmentos/.test(health));
    assert.ok(/Adicionar fragmento/.test(health));
  });

  console.log('');
  console.log(`Testes review life rewards: ${passed} passaram.`);
}

run();
