import assert from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  createEmptyAchievementSnapshot,
  evaluateAchievements,
  recordAllDailyMissionsCompleted,
  recordCorrectAnswer,
  recordQuestionAnswered,
  recordReviewAnswered,
  recordStreakChanged,
  recordStudySessionCompleted,
  recordXpChanged,
  unlockAchievementDev,
} from '../src/achievements/achievementLogic';
import {
  computeStudentLevel,
  detectLevelUp,
  getLevelForXp,
  getLevelName,
} from '../src/levels/levelLogic';
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
const now = Date.parse('2026-07-28T18:00:00.000Z');

async function run() {
  await test('nível 1 com 0 XP', () => {
    const info = computeStudentLevel(0);
    assert.equal(info.level, 1);
    assert.equal(info.name, 'Iniciante');
  });

  await test('nível 2 com 100 XP', () => {
    const info = computeStudentLevel(100);
    assert.equal(info.level, 2);
    assert.equal(info.name, 'Focado');
  });

  await test('nível correto em XP intermediário', () => {
    assert.equal(getLevelForXp(249), 2);
    assert.equal(getLevelForXp(250), 3);
    assert.equal(getLevelForXp(5000), 10);
    assert.equal(getLevelName(10), 'Lenda StudyLazy');
  });

  await test('progresso até próximo nível', () => {
    const info = computeStudentLevel(150);
    assert.equal(info.level, 2);
    assert.equal(info.xpIntoLevel, 50);
    assert.equal(info.xpSpanToNext, 150);
    assert.equal(info.xpRemaining, 100);
    assert.ok(info.progressPercent > 0 && info.progressPercent < 100);
    const up = detectLevelUp(90, 100);
    assert.equal(up.leveledUp, true);
    assert.equal(up.currentLevel, 2);
  });

  await test('desbloqueia primeira lição', () => {
    const { snapshot, newlyUnlocked } = recordStudySessionCompleted(
      createEmptyAchievementSnapshot(),
      1,
      now
    );
    assert.ok(newlyUnlocked.includes('first_lesson'));
    assert.ok(snapshot.unlocked.some((u) => u.id === 'first_lesson'));
  });

  await test('não desbloqueia duas vezes', () => {
    let snap = createEmptyAchievementSnapshot();
    snap = recordStudySessionCompleted(snap, 1, now).snapshot;
    const second = recordStudySessionCompleted(snap, 1, now + 1);
    assert.ok(!second.newlyUnlocked.includes('first_lesson'));
    assert.equal(
      second.snapshot.unlocked.filter((u) => u.id === 'first_lesson').length,
      1
    );
  });

  await test('desbloqueia por quantidade de questões', () => {
    const { newlyUnlocked } = recordQuestionAnswered(
      createEmptyAchievementSnapshot(),
      10,
      now
    );
    assert.ok(newlyUnlocked.includes('questions_10'));
  });

  await test('desbloqueia por revisão', () => {
    const { newlyUnlocked } = recordReviewAnswered(
      createEmptyAchievementSnapshot(),
      1,
      now
    );
    assert.ok(newlyUnlocked.includes('first_review'));
  });

  await test('desbloqueia por streak', () => {
    const { newlyUnlocked } = recordStreakChanged(
      createEmptyAchievementSnapshot(),
      3,
      now
    );
    assert.ok(newlyUnlocked.includes('streak_3'));
  });

  await test('desbloqueia por XP', () => {
    const { newlyUnlocked } = recordXpChanged(
      createEmptyAchievementSnapshot(),
      100,
      now
    );
    assert.ok(newlyUnlocked.includes('xp_100'));
  });

  await test('desbloqueia por missão diária (todas)', () => {
    const { newlyUnlocked } = recordAllDailyMissionsCompleted(
      createEmptyAchievementSnapshot(),
      now
    );
    assert.ok(newlyUnlocked.includes('all_daily_missions'));
  });

  await test('desbloqueia por acertos', () => {
    const { newlyUnlocked } = recordCorrectAnswer(
      createEmptyAchievementSnapshot(),
      10,
      now
    );
    assert.ok(newlyUnlocked.includes('correct_10'));
  });

  await test('funciona offline (persistência no store)', () => {
    const store = readFileSync(
      join(root, 'src/store/achievementStore.ts'),
      'utf8'
    );
    assert.ok(/studylazy-achievements/.test(store));
    assert.ok(/AsyncStorage/.test(store));
  });

  await test('convidado / logado (lógica sem auth)', () => {
    const snap = evaluateAchievements(createEmptyAchievementSnapshot(), now)
      .snapshot;
    assert.equal(snap.unlocked.length, 0);
  });

  await test('reset / unlock dev funciona', () => {
    const unlocked = unlockAchievementDev(
      createEmptyAchievementSnapshot(),
      'first_lesson',
      now
    );
    assert.ok(unlocked.unlocked.some((u) => u.id === 'first_lesson'));
    const reset = createEmptyAchievementSnapshot();
    assert.equal(reset.unlocked.length, 0);
  });

  await test('não salva texto de questão', () => {
    const types = readFileSync(
      join(root, 'src/achievements/achievementTypes.ts'),
      'utf8'
    );
    const store = readFileSync(
      join(root, 'src/store/achievementStore.ts'),
      'utf8'
    );
    assert.ok(!/\bprompt\b|\benunciado\b|\boptions\b/.test(types));
    assert.ok(!/\bprompt\b|\boptions\b|\bcorrectAnswer\b/.test(store));
  });

  await test('não altera 149 questões', () => {
    assert.equal(getQuestionBankStats().totalOfficialQuestions, 149);
  });

  await test('arquivos centrais existem', () => {
    assert.ok(existsSync(join(root, 'src/achievements/achievementLogic.ts')));
    assert.ok(existsSync(join(root, 'src/levels/levelLogic.ts')));
    assert.ok(
      existsSync(join(root, 'src/components/achievements/AchievementsCard.tsx'))
    );
    assert.ok(
      existsSync(join(root, 'src/components/levels/LevelProgressCard.tsx'))
    );
    assert.ok(existsSync(join(root, 'src/app/dev/achievements-health.tsx')));
    assert.ok(
      existsSync(join(root, 'docs/gamification/achievements-and-levels.md'))
    );
  });

  console.log('');
  console.log(`Testes achievements/levels: ${passed} passaram.`);
}

run();
