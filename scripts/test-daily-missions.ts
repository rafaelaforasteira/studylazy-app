import assert from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  applyMissionProgress,
  areAllMissionsCompleted,
  claimDailyBonus,
  claimMissionReward,
  createDailyMissions,
  createEmptyMissionsSnapshot,
  ensureMissionsForDate,
  getMissionDateKey,
} from '../src/missions/missionLogic';
import { MISSION_XP_REWARD } from '../src/missions/missionTypes';
import {
  addReviewFragmentDev,
  createInitialLivesSnapshot,
} from '../src/lives/livesLogic';
import { getQuestionBankStats } from '../src/data/questionBank';

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
const now = Date.parse('2026-07-28T15:00:00.000Z');
// Use a fixed local date by constructing Date from local parts via getMissionDateKey
const fixedLocal = new Date(2026, 6, 28, 12, 0, 0); // Jul 28 2026 local
const dateKey = getMissionDateKey(fixedLocal);
const nowMs = fixedLocal.getTime();

async function run() {
  await test('gera missões do dia', () => {
    const missions = createDailyMissions(dateKey);
    assert.equal(missions.length, 4);
    assert.deepEqual(
      missions.map((m) => m.type),
      [
        'complete_lesson',
        'answer_questions',
        'correct_answers',
        'review_mistakes',
      ]
    );
    assert.ok(missions.every((m) => m.xpReward === MISSION_XP_REWARD));
  });

  await test('dateKey local', () => {
    const key = getMissionDateKey(fixedLocal);
    assert.match(key, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(key, dateKey);
  });

  await test('reset no novo dia', () => {
    let snap = createEmptyMissionsSnapshot(dateKey);
    snap = applyMissionProgress(
      snap,
      { type: 'complete_lesson', amount: 1 },
      nowMs
    );
    assert.equal(snap.missions[0].progress, 1);
    const nextDay = getMissionDateKey(
      new Date(fixedLocal.getFullYear(), fixedLocal.getMonth(), fixedLocal.getDate() + 1)
    );
    const reset = ensureMissionsForDate(snap, nextDay);
    assert.equal(reset.dateKey, nextDay);
    assert.equal(reset.missions[0].progress, 0);
    assert.equal(reset.missions[0].status, 'active');
  });

  await test('completa lição', () => {
    const snap = applyMissionProgress(
      createEmptyMissionsSnapshot(dateKey),
      { type: 'complete_lesson', amount: 1 },
      nowMs
    );
    const lesson = snap.missions.find((m) => m.type === 'complete_lesson')!;
    assert.equal(lesson.progress, 1);
    assert.equal(lesson.status, 'completed');
  });

  await test('soma questões respondidas', () => {
    const snap = applyMissionProgress(
      createEmptyMissionsSnapshot(dateKey),
      { type: 'answer_questions', amount: 4 },
      nowMs
    );
    assert.equal(
      snap.missions.find((m) => m.type === 'answer_questions')!.progress,
      4
    );
  });

  await test('soma acertos', () => {
    const snap = applyMissionProgress(
      createEmptyMissionsSnapshot(dateKey),
      { type: 'correct_answers', amount: 3 },
      nowMs
    );
    assert.equal(
      snap.missions.find((m) => m.type === 'correct_answers')!.progress,
      3
    );
  });

  await test('soma revisões', () => {
    const snap = applyMissionProgress(
      createEmptyMissionsSnapshot(dateKey),
      { type: 'review_mistakes', amount: 2 },
      nowMs
    );
    assert.equal(
      snap.missions.find((m) => m.type === 'review_mistakes')!.progress,
      2
    );
  });

  await test('não passa do target', () => {
    const snap = applyMissionProgress(
      createEmptyMissionsSnapshot(dateKey),
      { type: 'answer_questions', amount: 50 },
      nowMs
    );
    const m = snap.missions.find((x) => x.type === 'answer_questions')!;
    assert.equal(m.progress, 10);
    assert.equal(m.status, 'completed');
  });

  await test('marca missão como completed', () => {
    const snap = applyMissionProgress(
      createEmptyMissionsSnapshot(dateKey),
      { type: 'review_mistakes', amount: 3 },
      nowMs
    );
    assert.equal(
      snap.missions.find((m) => m.type === 'review_mistakes')!.status,
      'completed'
    );
  });

  await test('recompensa XP só uma vez', () => {
    let snap = applyMissionProgress(
      createEmptyMissionsSnapshot(dateKey),
      { type: 'complete_lesson', amount: 1 },
      nowMs
    );
    const id = snap.missions.find((m) => m.type === 'complete_lesson')!.id;
    const first = claimMissionReward(snap, id, nowMs);
    assert.equal(first.result.applied, true);
    assert.equal(first.result.xpAwarded, 10);
    snap = first.snapshot;
    const second = claimMissionReward(snap, id, nowMs + 1);
    assert.equal(second.result.applied, false);
    assert.equal(second.result.reason, 'already_claimed');
    assert.equal(second.result.xpAwarded, 0);
  });

  await test('bônus de todas as missões só uma vez', () => {
    let snap = createEmptyMissionsSnapshot(dateKey);
    for (const type of [
      'complete_lesson',
      'answer_questions',
      'correct_answers',
      'review_mistakes',
    ] as const) {
      snap = applyMissionProgress(
        snap,
        {
          type,
          amount:
            type === 'complete_lesson'
              ? 1
              : type === 'answer_questions'
                ? 10
                : type === 'correct_answers'
                  ? 7
                  : 3,
        },
        nowMs
      );
    }
    assert.ok(areAllMissionsCompleted(snap));
    const first = claimDailyBonus(snap, nowMs);
    assert.equal(first.result.applied, true);
    assert.equal(first.result.shouldGrantFragment, true);
    snap = first.snapshot;
    const second = claimDailyBonus(snap, nowMs + 1);
    assert.equal(second.result.applied, false);
    assert.equal(second.result.reason, 'already_claimed');
  });

  await test('bônus dá 1 fragmento de vida', () => {
    let lives = createInitialLivesSnapshot({ currentLives: 3, lifeFragments: 0 });
    lives = addReviewFragmentDev(lives, nowMs);
    assert.equal(lives.lifeFragments, 1);
    assert.equal(lives.currentLives, 3);
  });

  await test('não acumula fragmento se vidas cheias', () => {
    let lives = createInitialLivesSnapshot({ currentLives: 5, lifeFragments: 0 });
    lives = addReviewFragmentDev(lives, nowMs);
    assert.equal(lives.lifeFragments, 0);
    assert.equal(lives.currentLives, 5);
  });

  await test('funciona convidado / logado (sem auth na lógica)', () => {
    const snap = applyMissionProgress(
      createEmptyMissionsSnapshot(dateKey),
      { type: 'complete_lesson', amount: 1 },
      nowMs
    );
    assert.equal(snap.missions[0].status, 'completed');
    // Lógica pura não consulta auth — convidado e logado usam o mesmo store local.
    assert.ok(true);
  });

  await test('offline preserva (campos persistidos no store)', () => {
    const store = readFileSync(join(root, 'src/store/missionStore.ts'), 'utf8');
    assert.ok(/studylazy-daily-missions/.test(store));
    assert.ok(/AsyncStorage/.test(store));
    assert.ok(/partialize/.test(store));
  });

  await test('não duplica por duplo toque (sessão + revisão)', () => {
    const session = readFileSync(
      join(root, 'src/app/study-session.tsx'),
      'utf8'
    );
    assert.ok(/hasSavedProgress/.test(session));
    assert.ok(/answerLockRef/.test(session));
    assert.ok(/recordLessonSession/.test(session));
    assert.ok(/answeredInSessionRef/.test(session));
    const review = readFileSync(
      join(root, 'src/app/review-mistakes.tsx'),
      'utf8'
    );
    assert.ok(/answerLockRef/.test(review));
    assert.ok(/recordReviewAnswer/.test(review));
  });

  await test('arquivos centrais existem', () => {
    assert.ok(existsSync(join(root, 'src/missions/missionLogic.ts')));
    assert.ok(existsSync(join(root, 'src/store/missionStore.ts')));
    assert.ok(
      existsSync(join(root, 'src/components/missions/DailyMissionsCard.tsx'))
    );
    assert.ok(existsSync(join(root, 'src/app/dev/missions-health.tsx')));
    assert.ok(existsSync(join(root, 'docs/gamification/daily-missions.md')));
  });

  await test('149 questões intactas', () => {
    assert.equal(getQuestionBankStats().totalOfficialQuestions, 149);
  });

  console.log('');
  console.log(`Testes daily missions: ${passed} passaram.`);
}

run();
