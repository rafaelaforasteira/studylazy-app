import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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

function readRel(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf8');
}

console.log('=== Auditoria: Preparação do Beta Android com EAS (PASSO 2) ===\n');

// --- app.json ---
const appJsonRaw = readRel('app.json');
const appJson = JSON.parse(appJsonRaw) as {
  expo?: {
    scheme?: string;
    version?: string;
    android?: { package?: string; versionCode?: number };
    ios?: { bundleIdentifier?: string };
  };
};
const expo = appJson.expo ?? {};
const android = expo.android ?? {};

check('1. scheme === "studylazy"', expo.scheme === 'studylazy', `scheme=${expo.scheme}`);
check(
  '2. android.package definido (reverse-DNS)',
  typeof android.package === 'string' && /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/.test(android.package),
  android.package
);
check(
  '3. android.versionCode definido',
  typeof android.versionCode === 'number',
  String(android.versionCode)
);
check('4. expo.version definido', typeof expo.version === 'string', expo.version);
check(
  '5. ios.bundleIdentifier definido',
  typeof expo.ios?.bundleIdentifier === 'string',
  expo.ios?.bundleIdentifier
);

// --- eas.json ---
const easExists = existsSync(join(ROOT, 'eas.json'));
check('6. eas.json existe', easExists);
if (easExists) {
  const easRaw = readRel('eas.json');
  const eas = JSON.parse(easRaw) as {
    build?: Record<
      string,
      {
        distribution?: string;
        environment?: string;
        android?: { buildType?: string };
      }
    >;
  };
  const preview = eas.build?.preview;
  check('6b. Perfil preview existe', Boolean(preview));
  check(
    '6c. Perfil preview gera APK',
    preview?.android?.buildType === 'apk',
    preview?.android?.buildType
  );
  check(
    '6d. Perfil preview usa distribuição interna',
    preview?.distribution === 'internal',
    preview?.distribution
  );
  check(
    '6e. Perfil preview referencia ambiente EAS gerenciado',
    typeof preview?.environment === 'string',
    preview?.environment
  );
  check('6f. Perfil production existe', Boolean(eas.build?.production));

  // 7. Nenhum segredo embutido no eas.json.
  check(
    '7. eas.json sem chaves JWT/anon embutidas',
    !/eyJ[A-Za-z0-9_-]{10,}\./.test(easRaw)
  );
  check('7b. eas.json sem service_role', !/service_role|SERVICE_ROLE/.test(easRaw));
  check(
    '7c. eas.json sem URL Supabase literal',
    !/https:\/\/[a-z0-9]+\.supabase\.co/.test(easRaw)
  );
}

// --- Documentação ---
const guide = 'docs/android/EAS_BETA_GUIDE.md';
const checklist = 'docs/android/ANDROID_TEST_CHECKLIST.md';
check('8. Guia de beta EAS existe', existsSync(join(ROOT, guide)));
check('8b. Checklist de teste Android existe', existsSync(join(ROOT, checklist)));
if (existsSync(join(ROOT, guide))) {
  const guideText = readRel(guide);
  check(
    '8c. Guia documenta variáveis EXPO_PUBLIC do Supabase',
    /EXPO_PUBLIC_SUPABASE_URL/.test(guideText) &&
      /EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY/.test(guideText)
  );
  check('8d. Guia documenta eas env / ambientes', /eas env/.test(guideText));
  check(
    '8e. Guia referencia Redirect URLs',
    /REDIRECT_URLS|studylazy:\/\/auth\/reset-password/.test(guideText)
  );
}

// 9. Telas de diagnóstico existem.
check(
  '9. Tela /dev/android-beta-health existe',
  existsSync(join(ROOT, 'src/app/dev/android-beta-health.tsx'))
);
check(
  '9b. Tela /dev/account-security-health existe',
  existsSync(join(ROOT, 'src/app/dev/account-security-health.tsx'))
);

// 10. Guia NÃO contém valores reais de chave/host (apenas placeholders).
if (existsSync(join(ROOT, guide))) {
  const guideText = readRel(guide);
  check(
    '10. Guia não contém JWT real',
    !/eyJ[A-Za-z0-9_-]{10,}\./.test(guideText)
  );
}

console.log('');
if (failures === 0) {
  console.log('Auditoria de Beta Android: TODAS as verificações passaram.');
} else {
  console.error(`Auditoria de Beta Android: ${failures} verificação(ões) falharam.`);
  process.exitCode = 1;
}
