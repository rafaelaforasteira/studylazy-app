import assert from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getQuestionBankStats } from '../src/data/questionBank';
import {
  calculateNps,
  classifyNpsScore,
  createDismissedUntil,
  isValidNpsScore,
  maskEmail,
  mentionsLives,
  sanitizeComment,
  shouldShowNpsPrompt,
  summarizeNps,
  validateFeedbackInput,
} from '../src/feedback/feedbackLogic';
import {
  NPS_COOLDOWN_MS,
  NPS_MIN_APP_AGE_MS,
  NPS_MIN_COMPLETED_SESSIONS,
} from '../src/feedback/feedbackTypes';

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

async function run() {
  await test('validação score 0', () => {
    assert.equal(isValidNpsScore(0), true);
  });

  await test('validação score 10', () => {
    assert.equal(isValidNpsScore(10), true);
  });

  await test('rejeita -1', () => {
    assert.equal(isValidNpsScore(-1), false);
  });

  await test('rejeita 11', () => {
    assert.equal(isValidNpsScore(11), false);
  });

  await test('classifica detrator', () => {
    assert.equal(classifyNpsScore(0), 'detractor');
    assert.equal(classifyNpsScore(6), 'detractor');
  });

  await test('classifica neutro', () => {
    assert.equal(classifyNpsScore(7), 'passive');
    assert.equal(classifyNpsScore(8), 'passive');
  });

  await test('classifica promotor', () => {
    assert.equal(classifyNpsScore(9), 'promoter');
    assert.equal(classifyNpsScore(10), 'promoter');
  });

  await test('calcula NPS positivo', () => {
    // 2 promotores, 0 detratores em 2 → 100
    assert.equal(calculateNps([9, 10]), 100);
  });

  await test('calcula NPS negativo', () => {
    // 0 promotores, 2 detratores → -100
    assert.equal(calculateNps([0, 3]), -100);
  });

  await test('calcula NPS zero', () => {
    // 1 de cada em 2 → 0
    assert.equal(calculateNps([10, 2]), 0);
  });

  await test('cooldown', () => {
    const decision = shouldShowNpsPrompt({
      firstOpenedAt: new Date(now - NPS_MIN_APP_AGE_MS * 2).toISOString(),
      lastNpsShownAt: new Date(now - 1000).toISOString(),
      dismissedUntil: null,
      completedSessions: 5,
      hasSubmittedNps: false,
      nowMs: now,
      trigger: 'session_end',
    });
    assert.equal(decision.shouldShow, false);
    assert.equal(decision.reason, 'cooldown');
  });

  await test('aparece após 2 sessões', () => {
    const decision = shouldShowNpsPrompt({
      firstOpenedAt: new Date(now - NPS_MIN_APP_AGE_MS * 2).toISOString(),
      lastNpsShownAt: null,
      dismissedUntil: null,
      completedSessions: NPS_MIN_COMPLETED_SESSIONS,
      hasSubmittedNps: false,
      nowMs: now,
      trigger: 'session_end',
    });
    assert.equal(decision.shouldShow, true);
    assert.equal(decision.reason, 'ok');
  });

  await test('não aparece antes de 2 sessões', () => {
    const decision = shouldShowNpsPrompt({
      firstOpenedAt: new Date(now - NPS_MIN_APP_AGE_MS * 2).toISOString(),
      lastNpsShownAt: null,
      dismissedUntil: null,
      completedSessions: 1,
      hasSubmittedNps: false,
      nowMs: now,
      trigger: 'session_end',
    });
    assert.equal(decision.shouldShow, false);
    assert.equal(decision.reason, 'too_few_sessions');
  });

  await test('não aparece na primeira abertura', () => {
    const decision = shouldShowNpsPrompt({
      firstOpenedAt: null,
      lastNpsShownAt: null,
      dismissedUntil: null,
      completedSessions: 10,
      hasSubmittedNps: false,
      nowMs: now,
      trigger: 'auto',
    });
    assert.equal(decision.shouldShow, false);
    assert.equal(decision.reason, 'first_open');
  });

  await test('manual sempre pode abrir', () => {
    const decision = shouldShowNpsPrompt({
      firstOpenedAt: null,
      lastNpsShownAt: null,
      dismissedUntil: null,
      completedSessions: 0,
      hasSubmittedNps: false,
      nowMs: now,
      trigger: 'manual',
    });
    assert.equal(decision.shouldShow, true);
    assert.equal(decision.reason, 'manual');
  });

  await test('dismissed bloqueia até o prazo', () => {
    const until = createDismissedUntil(now, NPS_COOLDOWN_MS);
    const decision = shouldShowNpsPrompt({
      firstOpenedAt: new Date(now - NPS_MIN_APP_AGE_MS * 2).toISOString(),
      lastNpsShownAt: new Date(now).toISOString(),
      dismissedUntil: until,
      completedSessions: 5,
      hasSubmittedNps: false,
      nowMs: now + 1000,
      trigger: 'session_end',
    });
    assert.equal(decision.shouldShow, false);
    assert.equal(decision.reason, 'dismissed');
  });

  await test('feedback pendente / sincronizado / falho (status types)', () => {
    const summary = summarizeNps([10, 8, 2]);
    assert.equal(summary.promoters, 1);
    assert.equal(summary.passives, 1);
    assert.equal(summary.detractors, 1);
    assert.equal(summary.total, 3);
  });

  await test('modo convidado (guestId permitido na validação)', () => {
    const ok = validateFeedbackInput({
      kind: 'suggestion',
      comment: 'Gostei do retry',
    });
    assert.equal(ok.ok, true);
  });

  await test('usuário logado (NPS com score)', () => {
    const ok = validateFeedbackInput({ kind: 'nps', score: 9 });
    assert.equal(ok.ok, true);
  });

  await test('texto longo tratado', () => {
    const long = 'a'.repeat(5000);
    const sanitized = sanitizeComment(long);
    assert.ok(sanitized);
    assert.ok((sanitized as string).length <= 2000);
  });

  await test('comentário vazio permitido para score', () => {
    const ok = validateFeedbackInput({ kind: 'nps', score: 8, comment: '' });
    assert.equal(ok.ok, true);
    assert.equal(sanitizeComment('   '), null);
  });

  await test('bug report sem score', () => {
    const ok = validateFeedbackInput({
      kind: 'bug',
      comment: 'Travou ao abrir sessão',
    });
    assert.equal(ok.ok, true);
    const bad = validateFeedbackInput({ kind: 'bug', comment: '' });
    assert.equal(bad.ok, false);
  });

  await test('feedback sobre vidas permitido', () => {
    assert.equal(mentionsLives('As vidas zeraram rápido'), true);
    assert.equal(mentionsLives('Adorei o XP'), false);
    const ok = validateFeedbackInput({
      kind: 'suggestion',
      comment: 'Recuperar vidas mais rápido',
    });
    assert.equal(ok.ok, true);
  });

  await test('máscara de e-mail no painel', () => {
    assert.equal(maskEmail('aluno@example.com'), 'a…@example.com');
    assert.equal(maskEmail(null), '—');
  });

  await test('149 questões intactas', () => {
    assert.equal(getQuestionBankStats().totalOfficialQuestions, 149);
  });

  await test('arquivos centrais existem', () => {
    assert.equal(existsSync(join(root, 'src/feedback/feedbackLogic.ts')), true);
    assert.equal(existsSync(join(root, 'src/store/feedbackStore.ts')), true);
    assert.equal(
      existsSync(join(root, 'src/components/feedback/NpsPrompt.tsx')),
      true
    );
    assert.equal(existsSync(join(root, 'src/app/feedback.tsx')), true);
    assert.equal(
      existsSync(join(root, 'src/app/dev/feedback-dashboard.tsx')),
      true
    );
    assert.equal(existsSync(join(root, 'docs/beta/nps-feedback.md')), true);
    assert.equal(
      existsSync(join(root, 'docs/supabase/user-feedback-table.sql')),
      true
    );
  });

  await test('feedback não salva enunciado de questão', () => {
    const store = readFileSync(join(root, 'src/store/feedbackStore.ts'), 'utf8');
    assert.doesNotMatch(store, /correctAnswer|prompt:\s*|options:\s*/);
  });
}

run().then(() => {
  console.log(`\n${passed} teste(s) de feedback/NPS passaram.`);
  if (process.exitCode === 1) {
    console.error('Alguns testes falharam.');
  }
});
