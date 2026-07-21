import assert from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  getQuestionBankStats,
  officialQuestionBank,
} from '../src/data/questionBank';
import { selectSmartQuestions } from '../src/data/questionSelection';
import { getStableQuestionId } from '../src/data/questionTypes';
import {
  canStartStudy,
  createInitialLivesSnapshot,
  loseLife,
  msUntilNextLife,
  regenerateLives,
} from '../src/lives/livesLogic';
import { LIFE_REGEN_MS, MAX_LIVES } from '../src/lives/livesTypes';
import {
  computeRetryTargetCount,
  createEmptyRetryQueue,
  getActiveRetryIds,
  mixRetryIntoSelection,
  reduceRetryOnCorrect,
  upsertRetryOnMiss,
} from '../src/retry/retryQueueLogic';

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
  await test('começa com 5 vidas', () => {
    const snap = createInitialLivesSnapshot();
    assert.equal(snap.currentLives, 5);
    assert.equal(snap.maxLives, MAX_LIVES);
  });

  await test('perde 1 vida', () => {
    const { snapshot, result } = loseLife({
      snapshot: createInitialLivesSnapshot(),
      lossKey: 'q1',
      nowMs: now,
    });
    assert.equal(result.applied, true);
    assert.equal(snapshot.currentLives, 4);
    assert.equal(snapshot.totalLivesLost, 1);
  });

  await test('não fica negativo', () => {
    let snap = createInitialLivesSnapshot({ currentLives: 1 });
    for (let i = 0; i < 5; i += 1) {
      const out = loseLife({
        snapshot: snap,
        lossKey: `q-${i}`,
        nowMs: now + i,
      });
      snap = out.snapshot;
    }
    assert.equal(snap.currentLives, 0);
    assert.ok(snap.currentLives >= 0);
  });

  await test('bloqueia com 0 vidas', () => {
    const check = canStartStudy(
      createInitialLivesSnapshot({
        currentLives: 0,
        lastLifeLostAt: new Date(now).toISOString(),
        lastLifeRegeneratedAt: new Date(now).toISOString(),
      }),
      now
    );
    assert.equal(check.allowed, false);
    assert.equal(check.lives, 0);
  });

  await test('regenera 1 após 30 min', () => {
    const lostAt = new Date(now).toISOString();
    const result = regenerateLives(
      createInitialLivesSnapshot({
        currentLives: 3,
        lastLifeLostAt: lostAt,
        lastLifeRegeneratedAt: lostAt,
      }),
      now + LIFE_REGEN_MS
    );
    assert.equal(result.lives, 4);
    assert.equal(result.regenerated, 1);
  });

  await test('regenera múltiplas após tempo longo', () => {
    const lostAt = new Date(now).toISOString();
    const result = regenerateLives(
      createInitialLivesSnapshot({
        currentLives: 1,
        lastLifeLostAt: lostAt,
        lastLifeRegeneratedAt: lostAt,
      }),
      now + LIFE_REGEN_MS * 4
    );
    assert.equal(result.lives, 5);
    assert.equal(result.regenerated, 4);
  });

  await test('não passa de 5', () => {
    const lostAt = new Date(now).toISOString();
    const result = regenerateLives(
      createInitialLivesSnapshot({
        currentLives: 4,
        lastLifeLostAt: lostAt,
        lastLifeRegeneratedAt: lostAt,
      }),
      now + LIFE_REGEN_MS * 10
    );
    assert.equal(result.lives, 5);
  });

  await test('Pro/unlimited não bloqueia', () => {
    const check = canStartStudy(
      createInitialLivesSnapshot({ currentLives: 0, isUnlimited: true }),
      now
    );
    assert.equal(check.allowed, true);
    assert.equal(check.isUnlimited, true);
  });

  await test('duplo toque não perde duplicado', () => {
    const first = loseLife({
      snapshot: createInitialLivesSnapshot(),
      lossKey: 'same-q',
      nowMs: now,
    });
    const second = loseLife({
      snapshot: first.snapshot,
      alreadyLostForKey: 'same-q',
      lossKey: 'same-q',
      nowMs: now + 1,
    });
    assert.equal(first.result.applied, true);
    assert.equal(second.result.applied, false);
    assert.equal(second.result.reason, 'duplicate_guard');
    assert.equal(second.snapshot.currentLives, 4);
  });

  await test('calcula tempo até próxima vida', () => {
    const lostAt = new Date(now).toISOString();
    const ms = msUntilNextLife(
      createInitialLivesSnapshot({
        currentLives: 2,
        lastLifeLostAt: lostAt,
        lastLifeRegeneratedAt: lostAt,
      }),
      now + 5 * 60 * 1000
    );
    assert.ok(ms !== null);
    assert.ok((ms as number) > 0);
    assert.ok((ms as number) <= LIFE_REGEN_MS);
  });

  await test('offline preserva (snapshot serializável)', () => {
    const snap = createInitialLivesSnapshot({ currentLives: 3 });
    const json = JSON.stringify(snap);
    const parsed = JSON.parse(json);
    assert.equal(parsed.currentLives, 3);
    assert.equal(parsed.maxLives, 5);
  });

  await test('retry criado ao errar', () => {
    const queue = upsertRetryOnMiss({
      queue: createEmptyRetryQueue(),
      stableQuestionId: 'ENEM-TEST-Q12',
      subject: 'Matemática',
      nowIso: new Date(now).toISOString(),
    });
    assert.equal(queue.items.length, 1);
    assert.equal(queue.items[0]?.active, true);
    assert.equal(queue.items[0]?.errorCount, 1);
  });

  await test('retry priorizado na próxima rodada', () => {
    const math = officialQuestionBank.filter((q) => q.subject === 'Matemática');
    assert.ok(math.length >= 5);
    const target = math[0];
    const stableId = getStableQuestionId(target);

    const result = selectSmartQuestions({
      questions: math,
      requestedCount: 5,
      subject: 'Matemática',
      activeRetryIds: [stableId],
      shuffleSeed: 42,
      performanceByQuestion: {
        [stableId]: {
          attempts: 1,
          incorrectAttempts: 1,
          lastResult: 'incorrect',
        },
      },
    });

    assert.ok(result.diagnostics.retryCount >= 1);
    assert.ok(
      result.questions.some((q) => getStableQuestionId(q) === stableId),
      'questão errada deve aparecer na sessão'
    );
    const ids = result.questions.map((q) => getStableQuestionId(q));
    assert.equal(new Set(ids).size, ids.length, 'sem duplicatas');
  });

  await test('retry reduz prioridade ao acertar', () => {
    let queue = upsertRetryOnMiss({
      queue: createEmptyRetryQueue(),
      stableQuestionId: 'Q-A',
      subject: 'Português',
    });
    queue = reduceRetryOnCorrect({
      queue,
      stableQuestionId: 'Q-A',
      subject: 'Português',
    });
    assert.equal(queue.items[0]?.active, false);
    assert.equal(getActiveRetryIds(queue, 'Português').has('Q-A'), false);
  });

  await test('não duplica questão na sessão (mix)', () => {
    const scored = [
      { stableId: 'a', score: 10 },
      { stableId: 'b', score: 9 },
      { stableId: 'c', score: 8 },
      { stableId: 'd', score: 7 },
      { stableId: 'e', score: 6 },
    ];
    const mixed = mixRetryIntoSelection({
      scored,
      activeRetryIds: new Set(['a', 'b', 'c']),
      targetCount: 4,
    });
    const ids = mixed.map((item) => item.stableId);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(mixed.length, 4);
    const retryTarget = computeRetryTargetCount(4, 3);
    assert.ok(retryTarget >= 2 && retryTarget <= 2);
  });

  await test('não seleciona demo/anulada/Q177', () => {
    const result = selectSmartQuestions({
      questions: officialQuestionBank,
      requestedCount: 10,
      shuffleSeed: 7,
      activeRetryIds: ['ENEM-2023-D2-C5-Q177'],
    });
    assert.ok(
      !result.questions.some((q) => q.externalId === 'ENEM-2023-D2-C5-Q177')
    );
    assert.ok(!result.questions.some((q) => q.originType === 'demo'));
    assert.ok(
      !result.questions.some((q) => q.officialStatus === 'annulled')
    );
  });

  await test('149 questões oficiais intactas', () => {
    const stats = getQuestionBankStats();
    assert.equal(stats.totalOfficialQuestions, 149);
  });

  await test('arquivos centrais existem', () => {
    assert.equal(existsSync(join(root, 'src/lives/livesLogic.ts')), true);
    assert.equal(existsSync(join(root, 'src/store/livesStore.ts')), true);
    assert.equal(
      existsSync(join(root, 'src/components/lives/LivesIndicator.tsx')),
      true
    );
    assert.equal(existsSync(join(root, 'src/retry/retryQueueLogic.ts')), true);
    assert.equal(existsSync(join(root, 'docs/gamification/lives-system.md')), true);
  });

  await test('retry store não persiste enunciado', () => {
    const store = readFileSync(join(root, 'src/store/retryQueueStore.ts'), 'utf8');
    assert.match(store, /stableQuestionId/);
    assert.doesNotMatch(store, /prompt:\s*|question:\s*|options:\s*/);
  });
}

run().then(() => {
  console.log(`\n${passed} teste(s) do sistema de vidas passaram.`);
  if (process.exitCode === 1) {
    console.error('Alguns testes falharam.');
  }
});
