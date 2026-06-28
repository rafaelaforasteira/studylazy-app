import assert from 'node:assert';

import { officialQuestionBank } from '../src/data/questionBank';
import { mergeProgressSnapshots } from '../src/sync/syncMerge';
import {
  pushWithRetry,
  resolveOwnership,
  runInitialSync,
} from '../src/sync/syncOrchestrator';
import {
  createEmptyPayload,
  estimatePayloadSize,
  isProgressPayloadEmpty,
  serializeSnapshot,
  validateProgressSyncPayload,
} from '../src/sync/syncSerializer';
import type {
  LocalSnapshotInput,
  ProgressSyncPayloadV1,
} from '../src/sync/syncTypes';
import { reconstructMistakeItems } from '../src/utils/questionMistake';

/** Campos PROIBIDOS no payload sincronizado (conteúdo de questão). */
const FORBIDDEN_PAYLOAD_KEYS = [
  'question',
  'prompt',
  'options',
  'supportText',
  'supportTitle',
  'sourceCitation',
  'explanation',
  'contentBlocks',
];

function assertNoForbiddenKeys(payload: ProgressSyncPayloadV1) {
  const json = JSON.stringify(payload);
  for (const key of FORBIDDEN_PAYLOAD_KEYS) {
    assert.ok(
      !json.includes(`"${key}"`),
      `Payload contém campo proibido: ${key}`
    );
  }
}
import type {
  SyncRepository,
  WriteSyncStateResult,
} from '../src/sync/supabaseSyncRepository';

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

// --- Builders -------------------------------------------------------------

function emptyInput(): LocalSnapshotInput {
  return {
    foreignLanguage: null,
    foreignLanguageUpdatedAt: null,
    xp: 0,
    streak: 0,
    lastStudyDate: null,
    sessionsCompleted: 0,
    history: [],
    questionPerformance: {},
    recentQuestionIds: [],
    mistakes: [],
  };
}

function buildPayload(over: Partial<LocalSnapshotInput>): ProgressSyncPayloadV1 {
  return serializeSnapshot({ ...emptyInput(), ...over }, '2026-06-28T00:00:00.000Z');
}

// In-memory mock repository ------------------------------------------------

type RemoteRow = {
  exists: boolean;
  revision: number | null;
  payload: unknown | null;
};

function createMockRepo(initial?: RemoteRow) {
  let row: RemoteRow = initial ?? { exists: false, revision: null, payload: null };
  const calls = {
    fetchProfile: 0,
    upsertProfile: 0,
    fetchState: 0,
    insert: 0,
    update: 0,
  };
  let networkError = false;
  let externalRevisionBump = false;

  const repo: SyncRepository = {
    async fetchProfile() {
      calls.fetchProfile += 1;
      return { ok: true, profile: null };
    },
    async upsertProfile() {
      calls.upsertProfile += 1;
      return { ok: true, profile: null };
    },
    async fetchRemoteSyncState() {
      calls.fetchState += 1;
      if (networkError) {
        return { ok: false, error: { kind: 'network', message: 'net' } };
      }
      return {
        ok: true,
        exists: row.exists,
        revision: row.revision,
        payload: row.payload,
        serverUpdatedAt: null,
      };
    },
    async insertInitialSyncState(_userId, payload) {
      calls.insert += 1;
      if (networkError) {
        return { ok: false, error: { kind: 'network', message: 'net' } };
      }
      row = { exists: true, revision: 1, payload };
      return { ok: true, updated: true, revision: 1 };
    },
    async updateSyncStateWithRevision({ expectedRevision, payload }): Promise<WriteSyncStateResult> {
      calls.update += 1;
      if (networkError) {
        return { ok: false, error: { kind: 'network', message: 'net' } };
      }
      // Simula outro dispositivo que moveu a revisão antes desta tentativa.
      if (externalRevisionBump) {
        externalRevisionBump = false;
        row = {
          exists: true,
          revision: (row.revision ?? 0) + 1,
          payload: row.payload,
        };
      }
      if (!row.exists || row.revision !== expectedRevision) {
        return { ok: true, updated: false, revision: null };
      }
      row = { exists: true, revision: (row.revision ?? 0) + 1, payload };
      return { ok: true, updated: true, revision: row.revision };
    },
  };

  return {
    repo,
    calls,
    getRow: () => row,
    setRow: (next: RemoteRow) => {
      row = next;
    },
    setNetworkError: (value: boolean) => {
      networkError = value;
    },
    triggerExternalBump: () => {
      externalRevisionBump = true;
    },
  };
}

const CLIENT_AT = '2026-06-28T12:00:00.000Z';

async function run() {
  // --- Serialização / validação ---
  await test('serialização normaliza números e datas', () => {
    const payload = buildPayload({
      xp: 120.7 as unknown as number,
      streak: -3 as unknown as number,
      lastStudyDate: '2026-06-27',
    });
    assert.equal(payload.version, 1);
    assert.equal(payload.progress.xp, 120);
    assert.equal(payload.progress.streak, 0);
    assert.equal(payload.progress.lastStudyDate, '2026-06-27');
  });

  await test('desserialização (validação) de payload válido', () => {
    const payload = buildPayload({ xp: 50 });
    const result = validateProgressSyncPayload(JSON.parse(JSON.stringify(payload)));
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.payload.progress.xp, 50);
  });

  await test('payload inválido é rejeitado', () => {
    assert.equal(validateProgressSyncPayload(null).ok, false);
    assert.equal(validateProgressSyncPayload({ version: 2 }).ok, false);
    assert.equal(
      validateProgressSyncPayload({ version: 1, profile: {}, progress: {}, mistakes: {} }).ok,
      false
    );
  });

  await test('payload legado sem id de sessão ganha fingerprint', () => {
    const payload = buildPayload({
      history: [
        {
          // sem id
          subject: 'Matemática',
          minutes: 10,
          totalQuestions: 5,
          correctAnswers: 3,
          earnedXp: 40,
          date: '2026-06-20',
        } as never,
      ],
    });
    assert.equal(payload.progress.history.length, 1);
    assert.ok(payload.progress.history[0].id.length > 0);
  });

  await test('payload nunca contém undefined', () => {
    const payload = buildPayload({ xp: 10 });
    assert.ok(!JSON.stringify(payload).includes('undefined'));
  });

  // --- Vazios ---
  await test('local vazio / remoto vazio / ambos vazios', () => {
    assert.equal(isProgressPayloadEmpty(createEmptyPayload()), true);
    assert.equal(isProgressPayloadEmpty(buildPayload({ xp: 1 })), false);
  });

  // --- Propriedade da conta ---
  await test('migração de convidado (claim) na primeira conta', () => {
    assert.equal(resolveOwnership(null, 'user-1'), 'claim');
  });
  await test('mesma conta (resume)', () => {
    assert.equal(resolveOwnership('user-1', 'user-1'), 'resume');
  });
  await test('conta diferente (conflict)', () => {
    assert.equal(resolveOwnership('user-1', 'user-2'), 'conflict');
  });

  // --- Sincronização inicial ---
  await test('criação da primeira linha (remoto inexistente)', async () => {
    const mock = createMockRepo();
    const local = buildPayload({ xp: 80, history: [historyItem('A', '2026-06-25', 80)] });
    const result = await runInitialSync({
      repo: mock.repo,
      userId: 'u1',
      displayName: 'Ana',
      localPayload: local,
      deviceId: 'dev1',
      clientUpdatedAt: CLIENT_AT,
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.outcome, 'created');
      assert.equal(result.payloadToApply, null);
      assert.equal(result.revision, 1);
    }
    assert.equal(mock.calls.insert, 1);
    assert.equal(mock.calls.update, 0);
  });

  await test('local vazio + remoto existente → aplica remoto (sem upload)', async () => {
    const remote = buildPayload({ xp: 200, history: [historyItem('B', '2026-06-26', 200)] });
    const mock = createMockRepo({ exists: true, revision: 3, payload: remote });
    const result = await runInitialSync({
      repo: mock.repo,
      userId: 'u1',
      displayName: 'Ana',
      localPayload: createEmptyPayload(),
      deviceId: 'dev1',
      clientUpdatedAt: CLIENT_AT,
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.outcome, 'applied');
      assert.equal(result.payloadToApply?.progress.xp, 200);
    }
    assert.equal(mock.calls.update, 0, 'não deve fazer upload');
  });

  await test('ambos existentes → merge determinístico + upload', async () => {
    const remote = buildPayload({ history: [historyItem('R', '2026-06-26', 100)] });
    const mock = createMockRepo({ exists: true, revision: 5, payload: remote });
    const local = buildPayload({ history: [historyItem('L', '2026-06-25', 80)] });
    const result = await runInitialSync({
      repo: mock.repo,
      userId: 'u1',
      displayName: 'Ana',
      localPayload: local,
      deviceId: 'dev1',
      clientUpdatedAt: CLIENT_AT,
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.outcome, 'merged');
      assert.equal(result.payloadToApply?.progress.history.length, 2);
      assert.equal(result.payloadToApply?.progress.xp, 180);
    }
    assert.equal(mock.calls.update, 1);
  });

  await test('sincronização inicial repetida é idempotente', async () => {
    const mock = createMockRepo();
    const local = buildPayload({ history: [historyItem('A', '2026-06-25', 80)] });
    const first = await runInitialSync({
      repo: mock.repo,
      userId: 'u1',
      displayName: 'Ana',
      localPayload: local,
      deviceId: 'dev1',
      clientUpdatedAt: CLIENT_AT,
    });
    assert.equal(first.ok, true);
    // Segunda vez: remoto agora existe com o mesmo conteúdo.
    const second = await runInitialSync({
      repo: mock.repo,
      userId: 'u1',
      displayName: 'Ana',
      localPayload: local,
      deviceId: 'dev1',
      clientUpdatedAt: CLIENT_AT,
    });
    assert.equal(second.ok, true);
    if (second.ok && second.payloadToApply) {
      assert.equal(second.payloadToApply.progress.history.length, 1, 'sem duplicar');
      assert.equal(second.payloadToApply.progress.xp, 80, 'sem duplicar XP');
    }
  });

  // --- Conflito de revisão / retry ---
  await test('conflito de revisão com retry bem-sucedido', async () => {
    const remote = buildPayload({ history: [historyItem('R', '2026-06-26', 100)] });
    const mock = createMockRepo({ exists: true, revision: 5, payload: remote });
    mock.triggerExternalBump(); // primeira tentativa falha por revisão
    const result = await pushWithRetry({
      repo: mock.repo,
      userId: 'u1',
      deviceId: 'dev1',
      payload: buildPayload({ history: [historyItem('L', '2026-06-25', 80)] }),
      expectedRevision: 5,
      clientUpdatedAt: CLIENT_AT,
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      // merge incorporou o remoto
      assert.equal(result.finalPayload.progress.history.length, 2);
    }
  });

  await test('conflito de revisão esgotado vira conflict', async () => {
    // Repo que SEMPRE falha a atualização (revisão sempre diferente).
    const repo: SyncRepository = {
      async fetchProfile() {
        return { ok: true, profile: null };
      },
      async upsertProfile() {
        return { ok: true, profile: null };
      },
      async fetchRemoteSyncState() {
        return {
          ok: true,
          exists: true,
          revision: Math.floor(Math.random() * 1000) + 10,
          payload: buildPayload({ xp: 1 }),
          serverUpdatedAt: null,
        };
      },
      async insertInitialSyncState() {
        return { ok: true, updated: true, revision: 1 };
      },
      async updateSyncStateWithRevision() {
        return { ok: true, updated: false, revision: null };
      },
    };
    const result = await pushWithRetry({
      repo,
      userId: 'u1',
      deviceId: 'dev1',
      payload: buildPayload({ xp: 5 }),
      expectedRevision: 1,
      clientUpdatedAt: CLIENT_AT,
      maxRetries: 2,
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.kind, 'conflict');
  });

  await test('falha de rede preserva local (offline)', async () => {
    const mock = createMockRepo();
    mock.setNetworkError(true);
    const result = await runInitialSync({
      repo: mock.repo,
      userId: 'u1',
      displayName: 'Ana',
      localPayload: buildPayload({ xp: 50 }),
      deviceId: 'dev1',
      clientUpdatedAt: CLIENT_AT,
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.kind, 'offline');
  });

  // --- Merge: regras ---
  await test('histórico duplicado é deduplicado', () => {
    const item = historyItem('A', '2026-06-25', 80);
    const a = buildPayload({ history: [item] });
    const b = buildPayload({ history: [item] });
    const merged = mergeProgressSnapshots(a, b).payload;
    assert.equal(merged.progress.history.length, 1);
  });

  await test('XP recalculado do histórico (sem duplicar)', () => {
    const a = buildPayload({ xp: 80, history: [historyItem('A', '2026-06-25', 80)] });
    const b = buildPayload({ xp: 80, history: [historyItem('A', '2026-06-25', 80)] });
    const merged = mergeProgressSnapshots(a, b).payload;
    assert.equal(merged.progress.xp, 80);
  });

  await test('streak não incrementa apenas por sincronizar', () => {
    const a = buildPayload({ streak: 1, history: [historyItem('A', '2026-06-25', 80)] });
    const b = buildPayload({ streak: 1, history: [historyItem('A', '2026-06-25', 80)] });
    const merged = mergeProgressSnapshots(a, b).payload;
    assert.equal(merged.progress.streak, 1);
  });

  await test('streak consecutivo recalculado do histórico', () => {
    const a = buildPayload({
      history: [
        historyItem('A', '2026-06-24', 40),
        historyItem('B', '2026-06-25', 40),
        historyItem('C', '2026-06-26', 40),
      ],
    });
    const merged = mergeProgressSnapshots(a, createEmptyPayload()).payload;
    assert.equal(merged.progress.streak, 3);
    assert.equal(merged.progress.lastStudyDate, '2026-06-26');
  });

  await test('desempenho por questão: maior consistente + mais recente', () => {
    const a = buildPayload({
      questionPerformance: {
        q1: perf('q1', 2, 1, 1, '2026-06-25T10:00:00Z', 'correct'),
      },
    });
    const b = buildPayload({
      questionPerformance: {
        q1: perf('q1', 3, 2, 1, '2026-06-26T10:00:00Z', 'incorrect'),
      },
    });
    const merged = mergeProgressSnapshots(a, b).payload;
    const q1 = merged.progress.questionPerformance.q1;
    assert.equal(q1.attempts, 3);
    assert.equal(q1.correctAttempts, 2);
    assert.equal(q1.incorrectAttempts, 1);
    assert.equal(q1.lastResult, 'incorrect');
  });

  await test('erros deduplicados por chave estável', () => {
    const m = mistake('Matemática', 'Quanto é 2+2?', '2026-06-25T10:00:00Z', 1);
    const m2 = mistake('Matemática', 'Quanto é 2+2?', '2026-06-26T10:00:00Z', 2);
    const a = buildPayload({ mistakes: [m] });
    const b = buildPayload({ mistakes: [m2] });
    const merged = mergeProgressSnapshots(a, b).payload;
    assert.equal(merged.mistakes.items.length, 1);
    assert.equal(merged.mistakes.items[0].errorCount, 2);
  });

  await test('erro não some porque outro dispositivo não o tem', () => {
    const a = buildPayload({ mistakes: [mistake('M', 'q1', '2026-06-25T10:00:00Z', 1)] });
    const b = buildPayload({ mistakes: [mistake('M', 'q2', '2026-06-25T10:00:00Z', 1)] });
    const merged = mergeProgressSnapshots(a, b).payload;
    assert.equal(merged.mistakes.items.length, 2);
  });

  await test('IDs recentes unidos, sem duplicar, máximo 30', () => {
    const local = Array.from({ length: 20 }, (_, i) => `L${i}`);
    const remote = Array.from({ length: 20 }, (_, i) => `R${i}`);
    const a = buildPayload({ recentQuestionIds: local });
    const b = buildPayload({ recentQuestionIds: remote });
    const merged = mergeProgressSnapshots(a, b).payload;
    assert.equal(merged.progress.recentQuestionIds.length, 30);
    assert.equal(new Set(merged.progress.recentQuestionIds).size, 30);
  });

  await test('idioma: local definido vence remoto nulo', () => {
    const a = buildPayload({ foreignLanguage: 'english', foreignLanguageUpdatedAt: '2026-06-25T00:00:00Z' });
    const b = createEmptyPayload();
    const merged = mergeProgressSnapshots(a, b).payload;
    assert.equal(merged.profile.foreignLanguage, 'english');
  });

  await test('idioma: divergência resolvida pelo metadado mais recente', () => {
    const a = buildPayload({ foreignLanguage: 'english', foreignLanguageUpdatedAt: '2026-06-25T00:00:00Z' });
    const b = buildPayload({ foreignLanguage: 'spanish', foreignLanguageUpdatedAt: '2026-06-27T00:00:00Z' });
    const merged = mergeProgressSnapshots(a, b).payload;
    assert.equal(merged.profile.foreignLanguage, 'spanish');
  });

  await test('idioma: sem metadado confiável preserva local + diagnóstico', () => {
    const a = buildPayload({ foreignLanguage: 'english', foreignLanguageUpdatedAt: null });
    const b = buildPayload({ foreignLanguage: 'spanish', foreignLanguageUpdatedAt: null });
    const result = mergeProgressSnapshots(a, b);
    assert.equal(result.payload.profile.foreignLanguage, 'english');
    assert.equal(result.diagnostics.languageConflict, true);
  });

  await test('aplicação remota não dispara upload (outcome applied sem update)', async () => {
    const remote = buildPayload({ xp: 200, history: [historyItem('B', '2026-06-26', 200)] });
    const mock = createMockRepo({ exists: true, revision: 1, payload: remote });
    const result = await runInitialSync({
      repo: mock.repo,
      userId: 'u1',
      displayName: 'Ana',
      localPayload: createEmptyPayload(),
      deviceId: 'dev1',
      clientUpdatedAt: CLIENT_AT,
    });
    assert.equal(result.ok, true);
    assert.equal(mock.calls.update, 0);
  });

  await test('dados corrompidos no remoto não apagam o local', async () => {
    const mock = createMockRepo({ exists: true, revision: 2, payload: { garbage: true } });
    const local = buildPayload({ xp: 80, history: [historyItem('A', '2026-06-25', 80)] });
    const result = await runInitialSync({
      repo: mock.repo,
      userId: 'u1',
      displayName: 'Ana',
      localPayload: local,
      deviceId: 'dev1',
      clientUpdatedAt: CLIENT_AT,
    });
    assert.equal(result.ok, true);
    if (result.ok && result.payloadToApply) {
      assert.equal(result.payloadToApply.progress.xp, 80);
      assert.equal(result.payloadToApply.progress.history.length, 1);
    }
  });

  await test('sessão expirada / erro do servidor vira error', async () => {
    const repo: SyncRepository = {
      async fetchProfile() {
        return { ok: true, profile: null };
      },
      async upsertProfile() {
        return { ok: true, profile: null };
      },
      async fetchRemoteSyncState() {
        return { ok: false, error: { kind: 'unknown', message: 'JWT expired' } };
      },
      async insertInitialSyncState() {
        return { ok: true, updated: true, revision: 1 };
      },
      async updateSyncStateWithRevision() {
        return { ok: true, updated: true, revision: 2 };
      },
    };
    const result = await runInitialSync({
      repo,
      userId: 'u1',
      displayName: 'Ana',
      localPayload: buildPayload({ xp: 10 }),
      deviceId: 'dev1',
      clientUpdatedAt: CLIENT_AT,
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.kind, 'error');
  });

  await test('payload de erro NÃO contém enunciado/alternativas/explicação', () => {
    const payload = buildPayload({
      mistakes: [
        {
          id: 'm1',
          subject: 'Matemática',
          question: 'Qual é o valor de x na equação 2x + 3 = 7?',
          options: ['x = 1', 'x = 2', 'x = 3', 'x = 4', 'x = 5'],
          selectedAnswer: 'x = 1',
          correctAnswer: 'x = 2',
          externalId: 'ENEM-2023-D2-C5-Q150',
          prompt: 'Enunciado completo da questão...',
          supportTitle: 'Texto de apoio',
          supportText: 'Um texto de apoio longo e detalhado...',
          sourceCitation: 'Fonte: ENEM',
          errorCount: 2,
          lastAnsweredAt: '2026-06-26T10:00:00Z',
        } as never,
      ],
    });
    assertNoForbiddenKeys(payload);
    // O item sincronizado guarda só o ID estável + metadados mínimos.
    const item = payload.mistakes.items[0];
    assert.equal(item.stableQuestionId, 'ENEM-2023-D2-C5-Q150');
    assert.ok(!('question' in item));
    assert.ok(!('options' in item));
    assert.ok(!('prompt' in item));
    assert.ok(!('supportText' in item));
    // Oficial → gabarito reconstruído do banco, não enviado.
    assert.ok(!('correctAnswer' in item));
  });

  await test('erro legado não oficial mantém correctAnswer mínimo', () => {
    const payload = buildPayload({
      mistakes: [
        {
          id: 'legacy-1',
          subject: 'Matemática',
          question: 'Pergunta legada sem externalId',
          options: ['a', 'b', 'c'],
          selectedAnswer: 'a',
          correctAnswer: 'b',
          errorCount: 1,
          lastAnsweredAt: '2026-06-26T10:00:00Z',
        } as never,
      ],
    });
    assertNoForbiddenKeys(payload);
    const item = payload.mistakes.items[0];
    assert.ok(item.stableQuestionId.startsWith('legacy:'));
    assert.equal(item.correctAnswer, 'b');
  });

  await test('payload remoto legado com conteúdo é higienizado na validação', () => {
    const dirtyRemote = {
      version: 1,
      exportedAt: '2026-06-28T00:00:00.000Z',
      profile: { foreignLanguage: null, foreignLanguageUpdatedAt: null },
      progress: {
        xp: 0,
        streak: 0,
        lastStudyDate: null,
        sessionsCompleted: 0,
        history: [],
        questionPerformance: {},
        recentQuestionIds: [],
      },
      mistakes: {
        items: [
          {
            id: 'x',
            subject: 'Matemática',
            question: 'Enunciado que NÃO deveria estar aqui',
            options: ['a', 'b', 'c'],
            prompt: 'prompt vazado',
            supportText: 'apoio vazado',
            externalId: 'ENEM-2023-D2-C5-Q150',
            errorCount: 3,
            lastAnsweredAt: '2026-06-26T10:00:00Z',
          },
        ],
      },
    };
    const result = validateProgressSyncPayload(dirtyRemote);
    assert.equal(result.ok, true);
    if (result.ok) {
      assertNoForbiddenKeys(result.payload);
      assert.equal(result.payload.mistakes.items[0].stableQuestionId, 'ENEM-2023-D2-C5-Q150');
    }
  });

  await test('revisão reconstrói a questão oficial pelo ID estável', () => {
    const official = officialQuestionBank[0];
    const stableId = String(official.externalId ?? official.id);
    const reconstructed = reconstructMistakeItems(
      [
        {
          stableQuestionId: stableId,
          subject: official.subject ?? 'Português',
          errorCount: 2,
          lastAnsweredAt: '2026-06-26T10:00:00Z',
          selectedAnswer: official.options[1],
        },
      ],
      []
    );
    assert.equal(reconstructed.length, 1);
    assert.ok(reconstructed[0].options.length > 0, 'alternativas reconstruídas');
    assert.ok(reconstructed[0].question.length > 0, 'enunciado reconstruído');
    assert.equal(reconstructed[0].correctAnswer, official.correctAnswer);
    assert.equal(reconstructed[0].errorCount, 2);
  });

  await test('revisão preserva legado local não oficial sem reenvio', () => {
    const localMistake = {
      id: 'legacy-1',
      subject: 'Matemática',
      question: 'Pergunta legada',
      options: ['a', 'b', 'c'],
      selectedAnswer: 'a',
      correctAnswer: 'b',
      errorCount: 1,
      lastAnsweredAt: '2026-06-20T10:00:00Z',
    };
    // Serializa o legado → item mínimo → reconstrói com o conteúdo local.
    const syncItem = buildPayload({ mistakes: [localMistake as never] }).mistakes.items[0];
    const reconstructed = reconstructMistakeItems([{ ...syncItem, errorCount: 4 }], [
      localMistake as never,
    ]);
    assert.equal(reconstructed[0].options.length, 3, 'conteúdo legado preservado localmente');
    assert.equal(reconstructed[0].errorCount, 4, 'contador atualizado');
  });

  await test('todos os snapshots de teste respeitam os campos proibidos', () => {
    assertNoForbiddenKeys(buildPayload({ recentQuestionIds: ['ENEM-2023-D1-C1-Q10'] }));
    assertNoForbiddenKeys(createEmptyPayload());
  });

  await test('149 questões oficiais permanecem intactas', () => {
    assert.equal(officialQuestionBank.length, 149);
  });

  // --- Tamanho aproximado do payload (requisito 6) ---
  await test('tamanho do payload é reportado e permanece compacto', () => {
    const makeSessions = (count: number) =>
      Array.from({ length: count }, (_, i) =>
        historyItem(`S${i}`, `2026-05-${String((i % 28) + 1).padStart(2, '0')}`, 80)
      );
    const makeMistakes = (count: number) =>
      Array.from({ length: count }, (_, i) =>
        mistake('Matemática', `q-${i}`, `2026-06-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`, 1)
      );

    const zero = buildPayload({});
    const ten = buildPayload({ xp: 800, history: makeSessions(10) });
    const fifty = buildPayload({ xp: 4000, history: makeSessions(50) });
    const withMistakes = buildPayload({
      xp: 4000,
      history: makeSessions(50),
      mistakes: makeMistakes(20),
    });

    const sizes = {
      zeroSessoes: estimatePayloadSize(zero),
      dezSessoes: estimatePayloadSize(ten),
      cinquentaSessoes: estimatePayloadSize(fifty),
      cinquentaSessoesMais20Erros: estimatePayloadSize(withMistakes),
    };
    console.log(`     tamanho (bytes): ${JSON.stringify(sizes)}`);
    [zero, ten, fifty, withMistakes].forEach(assertNoForbiddenKeys);
    // Compacto: 50 sessões + 20 erros devem caber bem abaixo de 60 KB.
    assert.ok(sizes.cinquentaSessoesMais20Erros < 60_000);
  });
}

// Helpers de construção -----------------------------------------------------

function historyItem(id: string, date: string, earnedXp: number) {
  return {
    id,
    subject: 'Matemática',
    minutes: 10,
    totalQuestions: 5,
    correctAnswers: 3,
    earnedXp,
    date,
    isRepeat: false,
  };
}

function perf(
  id: string,
  attempts: number,
  correct: number,
  incorrect: number,
  lastAnsweredAt: string,
  lastResult: 'correct' | 'incorrect'
) {
  return {
    stableQuestionId: id,
    attempts,
    correctAttempts: correct,
    incorrectAttempts: incorrect,
    lastAnsweredAt,
    lastResult,
  };
}

function mistake(
  subject: string,
  question: string,
  lastAnsweredAt: string,
  errorCount: number
) {
  return {
    id: `${subject}-${question}-${lastAnsweredAt}`,
    subject,
    question,
    options: ['a', 'b', 'c', 'd', 'e'],
    selectedAnswer: 'a',
    correctAnswer: 'b',
    errorCount,
    lastAnsweredAt,
  };
}

run().then(() => {
  console.log(`\n${passed} teste(s) de sincronização passaram.`);
  if (process.exitCode === 1) {
    console.error('Alguns testes falharam.');
  }
});
