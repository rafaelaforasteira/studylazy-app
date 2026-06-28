import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { officialQuestionBank } from '../src/data/questionBank';
import { isOfficialVerifiedQuestion } from '../src/data/questionTypes';
import { mergeProgressSnapshots } from '../src/sync/syncMerge';
import { resolveOwnership } from '../src/sync/syncOrchestrator';
import {
  createEmptyPayload,
  estimatePayloadSize,
  isProgressPayloadEmpty,
  serializeSnapshot,
} from '../src/sync/syncSerializer';
import type { LocalSnapshotInput, ProgressSyncPayloadV1 } from '../src/sync/syncTypes';

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

function payloadHasForbiddenKey(payload: ProgressSyncPayloadV1): string | null {
  const json = JSON.stringify(payload);
  for (const key of FORBIDDEN_PAYLOAD_KEYS) {
    if (json.includes(`"${key}"`)) {
      return key;
    }
  }
  return null;
}

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
const SRC = join(ROOT, 'src');

function readFile(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf8');
}

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, files);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

const srcContents = walk(SRC).map((file) => ({
  file: file.replace(/\\/g, '/'),
  text: readFileSync(file, 'utf8'),
}));

function emptyInput(over: Partial<LocalSnapshotInput> = {}): LocalSnapshotInput {
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
    ...over,
  };
}

console.log('=== Auditoria da Sincronização de Progresso (Supabase) ===\n');

const repository = readFile('src/sync/supabaseSyncRepository.ts');
const coordinator = readFile('src/sync/syncCoordinator.ts');
const orchestrator = readFile('src/sync/syncOrchestrator.ts');
const serializer = readFile('src/sync/syncSerializer.ts');
const syncStore = readFile('src/store/syncStore.ts');

// 1. Nenhuma secret key (JWT embutido).
const jwtLike = srcContents.filter(({ text }) => /eyJ[A-Za-z0-9_-]{10,}\./.test(text));
check('1. Nenhuma secret key hardcoded', jwtLike.length === 0, jwtLike.map((c) => c.file).join(', '));

// 2. Nenhuma service role.
const serviceRole = srcContents.filter(({ text }) => /service_role|serviceRole|SERVICE_ROLE/.test(text));
check('2. Nenhuma service role no código', serviceRole.length === 0, serviceRole.map((c) => c.file).join(', '));

// 3. Cliente Supabase central preservado (apenas um createClient, em lib/supabase.ts).
const createClientFiles = srcContents.filter(({ text }) => /createClient\s*\(/.test(text));
check(
  '3. Cliente Supabase central preservado',
  createClientFiles.length === 1 && createClientFiles[0].file.endsWith('src/lib/supabase.ts'),
  createClientFiles.map((c) => c.file).join(', ')
);

// 4. Tabelas corretas usadas (profiles e user_sync_state) e nenhuma outra.
check(
  '4. Tabelas corretas usadas',
  /'profiles'/.test(repository) && /'user_sync_state'/.test(repository)
);
// Apenas chamadas estilo Supabase: .from('tabela') ou .from(CONST_TABLE).
// Exclui Array.from(...) e métodos que recebem variáveis/arrays.
const supabaseFromGlobal = () =>
  /\.from\(\s*('[^']+'|[A-Z][A-Z0-9_]*_TABLE)\s*\)/g;
const fromCalls = srcContents.flatMap(({ text }) =>
  [...text.matchAll(supabaseFromGlobal())].map((m) => m[1])
);
const onlyAllowedTables = fromCalls.every(
  (t) =>
    ['PROFILES_TABLE', 'SYNC_TABLE'].includes(t) ||
    t === "'profiles'" ||
    t === "'user_sync_state'"
);
check('4b. Nenhuma tabela inesperada via .from()', onlyAllowedTables, fromCalls.join(', '));

// 5. RLS não contornado: .from() de tabela só no repositório.
const fromOutsideRepo = srcContents.filter(
  ({ file, text }) =>
    !file.endsWith('src/sync/supabaseSyncRepository.ts') &&
    supabaseFromGlobal().test(text)
);
check(
  '5. RLS não contornado (.from só no repositório)',
  fromOutsideRepo.length === 0,
  fromOutsideRepo.map((c) => c.file).join(', ')
);

// 6. Usuário autenticado usado como chave (id: userId / user_id: userId).
check(
  '6. Usuário autenticado como chave',
  /id:\s*userId/.test(repository) && /user_id:\s*userId/.test(repository)
);

// 7. Payload versionado.
check(
  '7. Payload versionado (schema_version/version)',
  /SYNC_SCHEMA_VERSION/.test(serializer) && /schema_version:\s*1/.test(repository)
);

// 8/9. Tokens e senha fora do payload.
const sampleInput = emptyInput({ xp: 50, recentQuestionIds: ['x'] });
const samplePayload = serializeSnapshot(sampleInput, '2026-06-28T00:00:00.000Z');
const serializedSample = JSON.stringify(samplePayload).toLowerCase();
check(
  '8. Tokens fora do payload',
  !serializedSample.includes('access_token') &&
    !serializedSample.includes('refresh_token') &&
    !serializedSample.includes('"token"')
);
check(
  '9. Senha fora do payload',
  !serializedSample.includes('password') && !serializedSample.includes('senha')
);

// 10. Banco de questões fora do payload (somente IDs, sem enunciado/alternativas).
const firstOfficial = officialQuestionBank[0];
const officialPrompt = (firstOfficial.prompt ?? firstOfficial.question ?? '').slice(0, 30);
const richMistakePayload = serializeSnapshot(
  emptyInput({
    mistakes: [
      {
        id: 'm1',
        subject: 'Matemática',
        question: firstOfficial.question ?? 'Enunciado oficial completo',
        options: [...(firstOfficial.options ?? ['a', 'b', 'c', 'd', 'e'])],
        selectedAnswer: 'a',
        correctAnswer: firstOfficial.correctAnswer ?? 'b',
        externalId: String(firstOfficial.externalId ?? firstOfficial.id),
        prompt: 'Prompt completo da questão',
        supportTitle: 'Título de apoio',
        supportText: 'Texto de apoio longo',
        sourceCitation: 'Fonte oficial',
        errorCount: 2,
        lastAnsweredAt: '2026-06-26T10:00:00Z',
      } as never,
    ],
  }),
  '2026-06-28T00:00:00.000Z'
);
const leakedKey = payloadHasForbiddenKey(richMistakePayload);
check(
  '10. Banco de questões fora do payload (sem enunciado/alternativas/prompt/apoio)',
  leakedKey === null,
  leakedKey ? `campo vazado: ${leakedKey}` : undefined
);
check(
  '10b. Enunciado oficial não aparece serializado',
  officialPrompt.length === 0 ||
    !JSON.stringify(richMistakePayload).toLowerCase().includes(officialPrompt.toLowerCase())
);
check(
  '10c. Erro oficial sincroniza só o ID estável (sem gabarito)',
  richMistakePayload.mistakes.items[0].stableQuestionId ===
    String(firstOfficial.externalId ?? firstOfficial.id) &&
    richMistakePayload.mistakes.items[0].correctAnswer === undefined
);

// 11. deviceId persistido (partialize inclui deviceId, storage AsyncStorage).
check(
  '11. deviceId persistido',
  /deviceId/.test(syncStore) && /partialize/.test(syncStore) && /AsyncStorage/.test(syncStore)
);

// 12. ownerUserId protegido.
check(
  '12. ownerUserId protegido (resolveOwnership)',
  /localOwnerUserId/.test(syncStore) && /resolveOwnership/.test(orchestrator)
);

// 13. Progresso de uma conta não é enviado para outra.
check(
  '13. Conta diferente bloqueia envio',
  resolveOwnership('user-1', 'user-2') === 'conflict' &&
    /conflict/.test(coordinator) &&
    /ownership/.test(coordinator)
);

// 14. Convidado pode migrar para a primeira conta.
check('14. Convidado migra para a primeira conta', resolveOwnership(null, 'user-1') === 'claim');

// 15. Sincronização inicial idempotente (mesmo dado não duplica no merge).
const local = serializeSnapshot(
  emptyInput({
    xp: 80,
    history: [
      { id: 'A', subject: 'M', minutes: 10, totalQuestions: 5, correctAnswers: 3, earnedXp: 80, date: '2026-06-25' },
    ],
  }),
  '2026-06-28T00:00:00.000Z'
);
const mergedSelf = mergeProgressSnapshots(local, local).payload;
check(
  '15. Inicial idempotente (merge consigo mesmo)',
  mergedSelf.progress.history.length === 1 && mergedSelf.progress.xp === 80
);

// 16. Histórico deduplicado.
const dupA = serializeSnapshot(
  emptyInput({
    history: [
      { id: 'H1', subject: 'M', minutes: 5, totalQuestions: 5, correctAnswers: 5, earnedXp: 50, date: '2026-06-25' },
    ],
  })
);
const merged16 = mergeProgressSnapshots(dupA, dupA).payload;
check('16. Histórico deduplicado', merged16.progress.history.length === 1);

// 17. XP não duplicado.
check('17. XP não duplicado', merged16.progress.xp === 50);

// 18. Streak não incrementado por sync.
const streakA = serializeSnapshot(
  emptyInput({
    streak: 1,
    history: [
      { id: 'S1', subject: 'M', minutes: 5, totalQuestions: 5, correctAnswers: 5, earnedXp: 50, date: '2026-06-25' },
    ],
  })
);
check('18. Streak não incrementado por sync', mergeProgressSnapshots(streakA, streakA).payload.progress.streak === 1);

// 19. Erros deduplicados.
const mk = (count: number, at: string) =>
  serializeSnapshot(
    emptyInput({
      mistakes: [
        {
          id: `M-${at}`,
          subject: 'M',
          question: 'q?',
          options: ['a', 'b'],
          selectedAnswer: 'a',
          correctAnswer: 'b',
          errorCount: count,
          lastAnsweredAt: at,
        },
      ],
    })
  );
const mergedMistakes = mergeProgressSnapshots(
  mk(1, '2026-06-25T10:00:00Z'),
  mk(2, '2026-06-26T10:00:00Z')
).payload;
check(
  '19. Erros deduplicados',
  mergedMistakes.mistakes.items.length === 1 && mergedMistakes.mistakes.items[0].errorCount === 2
);

// 20. IDs recentes limitados a 30.
const manyIds = Array.from({ length: 60 }, (_, i) => `id-${i}`);
const recentPayload = serializeSnapshot(emptyInput({ recentQuestionIds: manyIds }));
check('20. IDs recentes limitados a 30', recentPayload.progress.recentQuestionIds.length === 30);

// 21. Update usa revision esperada.
check(
  '21. Update usa revision esperada',
  /expectedRevision/.test(repository) && /\.eq\('revision',\s*expectedRevision\)/.test(repository)
);

// 22. Retry limitado.
check(
  '22. Retry limitado (maxRetries)',
  /maxRetries/.test(orchestrator) && /attempt\s*>=\s*maxRetries/.test(orchestrator)
);

// 23. Modo offline preserva local (status offline, sem apagar stores).
check(
  '23. Offline preserva local',
  /'offline'/.test(coordinator) && !/resetProgress|clearMistakes/.test(coordinator)
);

// 24. Logout preserva progresso (handleLogout não toca stores de progresso).
const logoutBlock = coordinator.slice(
  coordinator.indexOf('export function handleLogout'),
  coordinator.indexOf('export async function syncNow')
);
check(
  '24. Logout preserva progresso',
  /resetTransient/.test(logoutBlock) &&
    !/resetProgress|clearMistakes|resetProfile/.test(logoutBlock)
);

// 25. 149 questões oficiais intactas.
check(
  '25. 149 questões oficiais intactas',
  officialQuestionBank.length === 149 && officialQuestionBank.every(isOfficialVerifiedQuestion)
);

// 26. Zero demos.
check('26. Zero demos', officialQuestionBank.every((q) => q.originType === 'official_exam'));

// 27. Zero anuladas.
check(
  '27. Zero anuladas',
  officialQuestionBank.every(
    (q) => (q.officialStatus ?? 'valid') === 'valid' && (q.eligibleForScoredSessions ?? true) === true
  )
);

// 28. Q177 fora.
check(
  '28. Q177 fora',
  !officialQuestionBank.some((q) => q.externalId === 'ENEM-2023-D2-C5-Q177')
);

// Extra: payload vazio é reconhecido (não sobrescreve dados válidos com vazio).
check(
  'Extra. Payload vazio reconhecido',
  isProgressPayloadEmpty(createEmptyPayload()) === true
);

// Relatório de tamanho aproximado (requisito 6).
const sizeSessions = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `S${i}`,
    subject: 'Matemática',
    minutes: 10,
    totalQuestions: 5,
    correctAnswers: 3,
    earnedXp: 80,
    date: `2026-05-${String((i % 28) + 1).padStart(2, '0')}`,
  }));
const sizeMistakes = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `m${i}`,
    subject: 'Matemática',
    question: `q-${i}`,
    options: ['a', 'b', 'c', 'd', 'e'],
    selectedAnswer: 'a',
    correctAnswer: 'b',
    externalId: `ENEM-2023-D2-C5-Q${100 + i}`,
    errorCount: 1,
    lastAnsweredAt: `2026-06-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`,
  }));
const sizeReport = {
  zeroSessoes: estimatePayloadSize(serializeSnapshot(emptyInput(), '2026-06-28T00:00:00.000Z')),
  dezSessoes: estimatePayloadSize(
    serializeSnapshot(emptyInput({ xp: 800, history: sizeSessions(10) as never }), '2026-06-28T00:00:00.000Z')
  ),
  cinquentaSessoes: estimatePayloadSize(
    serializeSnapshot(emptyInput({ xp: 4000, history: sizeSessions(50) as never }), '2026-06-28T00:00:00.000Z')
  ),
  cinquentaSessoesMais20Erros: estimatePayloadSize(
    serializeSnapshot(
      emptyInput({ xp: 4000, history: sizeSessions(50) as never, mistakes: sizeMistakes(20) as never }),
      '2026-06-28T00:00:00.000Z'
    )
  ),
};
console.log(`\n=== Tamanho aproximado do payload (bytes) ===`);
console.log(JSON.stringify(sizeReport, null, 2));

console.log('');
if (failures > 0) {
  console.error(`Auditoria falhou: ${failures} verificação(ões).`);
  process.exit(1);
}
console.log('Auditoria de sincronização de progresso concluída com sucesso.');
