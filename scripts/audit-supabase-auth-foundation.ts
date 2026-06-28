import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  getQuestionBankStats,
  getStableQuestionId,
  officialQuestionBank,
} from '../src/data/questionBank';
import { selectSmartQuestions } from '../src/data/questionSelection';
import { isOfficialVerifiedQuestion } from '../src/data/questionTypes';
import { createInitController } from '../src/lib/authFlow';

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

const srcFiles = walk(SRC);
const srcContents = srcFiles.map((file) => ({
  file,
  text: readFileSync(file, 'utf8'),
}));

console.log('=== Auditoria da Fundação de Autenticação Supabase ===\n');

// 1. Nenhuma chave Supabase hardcoded (JWT/anon/publishable embutidos).
const jwtLike = srcContents.filter(({ text }) =>
  /eyJ[A-Za-z0-9_-]{10,}\./.test(text)
);
check(
  '1. Nenhuma chave Supabase hardcoded',
  jwtLike.length === 0,
  jwtLike.map((c) => c.file).join(', ')
);

// 2. Nenhuma service_role no código.
const serviceRole = srcContents.filter(({ text }) =>
  /service_role|serviceRole|SERVICE_ROLE/.test(text)
);
check(
  '2. Nenhuma service_role no código',
  serviceRole.length === 0,
  serviceRole.map((c) => c.file).join(', ')
);

// 3. .env ignorado pelo Git.
const gitignore = readFile('.gitignore');
check(
  '3. .env ignorado no .gitignore',
  /^\.env$/m.test(gitignore) || /\n\.env(\s|$)/.test(`\n${gitignore}`)
);

// 4. .env.example sem valores secretos.
const envExample = readFile('.env.example');
const envLines = envExample
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.length > 0 && !line.startsWith('#'));
const envHasValues = envLines.some((line) => {
  const [, value = ''] = line.split('=');
  return value.trim().length > 0;
});
check('4. .env.example sem valores secretos', !envHasValues);

// 5. Cliente central único (apenas um createClient, em src/lib/supabase.ts).
const createClientFiles = srcContents.filter(({ text }) =>
  /createClient\s*\(/.test(text)
);
check(
  '5. Cliente Supabase central único',
  createClientFiles.length === 1 &&
    createClientFiles[0].file.replace(/\\/g, '/').endsWith('src/lib/supabase.ts'),
  createClientFiles.map((c) => c.file).join(', ')
);

const supabaseLib = readFile('src/lib/supabase.ts');

// 6. persistSession habilitado.
check('6. persistSession habilitado', /persistSession:\s*true/.test(supabaseLib));

// 7. autoRefreshToken habilitado.
check(
  '7. autoRefreshToken habilitado',
  /autoRefreshToken:\s*true/.test(supabaseLib)
);

const authStore = readFile('src/store/authStore.ts');
const authFlow = readFile('src/lib/authFlow.ts');

// 8. Login implementado.
check(
  '8. Login implementado',
  /signIn:/.test(authStore) && /performSignIn/.test(authFlow)
);

// 9. Cadastro implementado.
check(
  '9. Cadastro implementado',
  /signUp:/.test(authStore) && /performSignUp/.test(authFlow)
);

// 10. Logout implementado.
check(
  '10. Logout implementado',
  /signOut:/.test(authStore) && /performSignOut/.test(authFlow)
);

// 11. Modo convidado existente.
const authPreference = readFile('src/store/authPreferenceStore.ts');
const welcome = readFile('src/app/auth/welcome.tsx');
check(
  '11. Modo convidado existente',
  /hasChosenGuest/.test(authPreference) &&
    /Continuar sem conta/.test(welcome)
);

// 12. Logout não apaga progresso (authStore não referencia resets de progresso).
check(
  '12. Logout não apaga progresso local',
  !/resetProgress|clearMistakes|resetProfile|resetAnswers/.test(authStore)
);

// 13. Inicialização idempotente.
const controller = createInitController();
const firstRun = controller.shouldRun();
const secondRun = controller.shouldRun();
controller.finish();
check(
  '13. Inicialização idempotente',
  firstRun === true && secondRun === false && controller.isInitialized === true
);

// 14. Exatamente uma subscription (onAuthStateChange único e guardado).
const onAuthChangeCount = (authStore.match(/onAuthStateChange\s*\(/g) ?? [])
  .length;
check(
  '14. Exatamente uma subscription',
  onAuthChangeCount === 1 && /if\s*\(!authSubscription\)/.test(authStore)
);

// 15. Formulários protegidos contra envio duplicado.
const login = readFile('src/app/auth/login.tsx');
const register = readFile('src/app/auth/register.tsx');
check(
  '15. Formulários protegidos contra envio duplicado',
  /submitLockRef/.test(login) &&
    /isSubmitting/.test(login) &&
    /submitLockRef/.test(register) &&
    /isSubmitting/.test(register)
);

// 16. 149 questões oficiais intactas.
const stats = getQuestionBankStats();
check(
  '16. 149 questões oficiais intactas',
  stats.totalOfficialQuestions === 149 &&
    officialQuestionBank.length === 149 &&
    officialQuestionBank.every(isOfficialVerifiedQuestion)
);

// 17. Zero demos.
check(
  '17. Zero demos no banco',
  officialQuestionBank.every((q) => q.originType === 'official_exam')
);

// 18. Zero anuladas pontuáveis.
check(
  '18. Zero anuladas no banco pontuado',
  officialQuestionBank.every(
    (q) =>
      (q.officialStatus ?? 'valid') === 'valid' &&
      (q.eligibleForScoredSessions ?? true) === true
  )
);

// 19. Q177 fora.
check(
  '19. Q177 fora do banco pontuado',
  !officialQuestionBank.some((q) => q.externalId === 'ENEM-2023-D2-C5-Q177')
);

// 20. Motor inteligente preservado.
const selection = selectSmartQuestions({
  questions: officialQuestionBank,
  requestedCount: 5,
  subject: 'Matemática',
  shuffleSeed: 7,
  now: Date.UTC(2026, 5, 27),
});
check(
  '20. Motor inteligente preservado',
  typeof selection.diagnostics.eligibleCount === 'number' &&
    selection.questions.length > 0 &&
    new Set(selection.questions.map(getStableQuestionId)).size ===
      selection.questions.length
);

console.log('');
if (failures > 0) {
  console.error(`Auditoria falhou: ${failures} verificação(ões).`);
  process.exit(1);
}
console.log('Auditoria da fundação de autenticação concluída com sucesso.');
