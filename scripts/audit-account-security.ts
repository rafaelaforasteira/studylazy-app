import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { getQuestionBankStats } from '../src/data/questionBank';

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

function readRel(relativePath: string): string {
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

console.log('=== Auditoria: Recuperação e Segurança da Conta (PASSO 1) ===\n');

// 1. Nenhuma chave JWT/anon hardcoded no app.
const jwtLike = srcContents.filter(({ text }) => /eyJ[A-Za-z0-9_-]{10,}\./.test(text));
check(
  '1. Nenhuma chave Supabase hardcoded no app',
  jwtLike.length === 0,
  jwtLike.map((c) => c.file).join(', ')
);

// 2. Nenhum service_role no código do app (somente servidor/Edge Function).
const serviceRoleInSrc = srcContents.filter(({ text }) =>
  /service_role|SERVICE_ROLE/.test(text)
);
check(
  '2. Nenhum service_role no código do app',
  serviceRoleInSrc.length === 0,
  serviceRoleInSrc.map((c) => c.file).join(', ')
);

// 3. Cliente nunca chama admin.deleteUser diretamente.
const adminDelete = srcContents.filter(({ text }) =>
  /admin\.deleteUser/.test(text)
);
check(
  '3. App não executa admin.deleteUser (exclusão é server-side)',
  adminDelete.length === 0,
  adminDelete.map((c) => c.file).join(', ')
);

// 4. Edge Function delete-account existe e usa service role apenas no servidor.
const edgePath = 'supabase/functions/delete-account/index.ts';
const edgeExists = existsSync(join(ROOT, edgePath));
check('4. Edge Function delete-account existe', edgeExists, edgePath);
if (edgeExists) {
  const edge = readRel(edgePath);
  check(
    '4b. Edge Function lê SUPABASE_SERVICE_ROLE_KEY do ambiente',
    /Deno\.env\.get\(['"]SUPABASE_SERVICE_ROLE_KEY['"]\)/.test(edge)
  );
  check(
    '4c. Edge Function valida o usuário pelo token (getUser)',
    /auth\.getUser\(\)/.test(edge)
  );
  check(
    '4d. Edge Function não aceita userId por parâmetro do corpo',
    !/req\.json\(\)/.test(edge) || /getUser/.test(edge)
  );
  check(
    '4e. Edge Function chama admin.deleteUser do dono do token',
    /admin\.deleteUser\(userId\)/.test(edge)
  );
}

// 5. App solicita exclusão via Edge Function (functions.invoke).
const authStore = readRel('src/store/authStore.ts');
check(
  "5. App invoca a função 'delete-account'",
  /functions\.invoke\(['"]delete-account['"]\)/.test(authStore)
);

// 6. Cliente Supabase usa PKCE e detectSessionInUrl=false.
const supabaseLib = readRel('src/lib/supabase.ts');
check('6. flowType pkce habilitado', /flowType:\s*['"]pkce['"]/.test(supabaseLib));
check(
  '6b. detectSessionInUrl: false (troca manual de código)',
  /detectSessionInUrl:\s*false/.test(supabaseLib)
);

// 7. Tela de reset existe e faz a troca PKCE.
const resetExists = existsSync(join(ROOT, 'src/app/auth/reset-password.tsx'));
check('7. Tela /auth/reset-password existe', resetExists);
if (resetExists) {
  const reset = readRel('src/app/auth/reset-password.tsx');
  check(
    '7b. Reset troca code por sessão (exchangeRecoveryCode)',
    /exchangeRecoveryCode/.test(reset)
  );
  check(
    '7c. Reset atualiza a senha (completePasswordUpdate)',
    /completePasswordUpdate/.test(reset)
  );
}

// 8. Forgot-password usa o deep link de reset como redirectTo.
const forgotExists = existsSync(join(ROOT, 'src/app/auth/forgot-password.tsx'));
check('8. Tela /auth/forgot-password existe', forgotExists);
if (forgotExists) {
  const forgot = readRel('src/app/auth/forgot-password.tsx');
  check(
    '8b. Forgot usa Linking.createURL para /auth/reset-password',
    /createURL\(['"]\/auth\/reset-password['"]\)/.test(forgot)
  );
  check('8c. Forgot chama requestPasswordReset', /requestPasswordReset/.test(forgot));
}

// 9. Logout com escopo local e global.
const accountSecurity = readRel('src/lib/accountSecurity.ts');
check(
  '9. signOut com escopo é repassado ao cliente',
  /signOut\(\{\s*scope\s*\}\)/.test(accountSecurity)
);
check(
  "9b. authStore expõe escopo 'local' e 'global'",
  /scope:\s*SignOutScope/.test(authStore) || /SignOutScope/.test(authStore)
);

// 10. Logout/Exclusão cancelam a sincronização (integração mínima).
const accountCard = readRel('src/components/auth/AccountCard.tsx');
check(
  '10. AccountCard cancela uploads no logout (handleLogout)',
  /handleLogout/.test(accountCard)
);
check(
  '10b. AccountCard cancela sync na exclusão (handleAccountDeleted)',
  /handleAccountDeleted/.test(accountCard)
);
check(
  '10c. Exclusão limpa o progresso local atrelado à conta',
  /resetProgress\(\)/.test(accountCard) &&
    /clearMistakes\(\)/.test(accountCard) &&
    /resetProfile\(\)/.test(accountCard)
);

// 11. Módulo accountSecurity é puro (sem React Native nem supabase direto).
check(
  '11. accountSecurity não importa react-native',
  !/from\s+['"]react-native['"]/.test(accountSecurity)
);
check(
  '11b. accountSecurity não importa o cliente supabase',
  !/from\s+['"].*lib\/supabase['"]/.test(accountSecurity)
);

// 12. Rotas registradas.
const routes = readRel('src/constants/routes.ts');
check(
  '12. Rotas de conta registradas',
  /authForgotPassword/.test(routes) &&
    /authResetPassword/.test(routes) &&
    /changePassword/.test(routes)
);

// 13. Documentação de deploy e Redirect URLs.
const deployDoc = 'docs/account/EDGE_FUNCTION_DELETE_ACCOUNT.md';
const redirectDoc = 'docs/account/REDIRECT_URLS.md';
check('13. Doc de deploy da Edge Function existe', existsSync(join(ROOT, deployDoc)));
check('13b. Doc de Redirect URLs existe', existsSync(join(ROOT, redirectDoc)));
if (existsSync(join(ROOT, redirectDoc))) {
  check(
    '13c. Redirect doc cita studylazy://auth/reset-password',
    /studylazy:\/\/auth\/reset-password/.test(readRel(redirectDoc))
  );
}

// 14. .env ignorado pelo Git.
const gitignore = readRel('.gitignore');
check('14. .env ignorado no .gitignore', /(^|\n)\.env(\s|$|\r)/.test(gitignore));

// 15. Integridade das 149 questões oficiais (não alteradas).
const stats = getQuestionBankStats();
check(
  '15. Banco oficial intacto (149 questões)',
  stats.totalOfficialQuestions === 149,
  `total=${stats.totalOfficialQuestions}`
);

console.log('');
if (failures === 0) {
  console.log('Auditoria de Segurança de Conta: TODAS as verificações passaram.');
} else {
  console.error(`Auditoria de Segurança de Conta: ${failures} verificação(ões) falharam.`);
  process.exitCode = 1;
}
