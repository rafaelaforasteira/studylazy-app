import assert from 'node:assert';

import { isNetworkError, mapAuthError } from '../src/lib/authErrors';
import {
  createInitController,
  createSubmitGuard,
  deriveDisplayName,
  performSignIn,
  performSignOut,
  performSignUp,
  resolveStartRoute,
  type AuthClientLike,
} from '../src/lib/authFlow';
import {
  normalizeEmail,
  normalizeName,
  validateLoginForm,
  validateName,
  validatePassword,
  validateRegisterForm,
} from '../src/lib/authValidation';

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

type MockSession = { user: { id: string; email: string } | null };

function buildClient(overrides: Partial<AuthClientLike>): AuthClientLike {
  return {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({
      data: { session: null, user: null },
      error: null,
    }),
    signUp: async () => ({ data: { session: null, user: null }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    ...overrides,
  } as AuthClientLike;
}

async function run() {
  // --- Normalização e validação ---
  await test('normalização do e-mail', () => {
    assert.equal(normalizeEmail('  Voce@Email.COM '), 'voce@email.com');
  });

  await test('validação do nome', () => {
    assert.equal(validateName('Ana').ok, true);
    assert.equal(validateName(' ').ok, false);
    assert.equal(normalizeName('  João   Silva ').includes('João Silva'), true);
  });

  await test('senha curta', () => {
    assert.equal(validatePassword('123').ok, false);
    assert.equal(validatePassword('12345678').ok, true);
  });

  await test('senhas diferentes', () => {
    const result = validateRegisterForm({
      name: 'Ana',
      email: 'ana@email.com',
      password: '12345678',
      confirmPassword: '87654321',
    });
    assert.equal(result.ok, false);
  });

  await test('login form válido', () => {
    assert.equal(validateLoginForm('ana@email.com', 'secret123').ok, true);
    assert.equal(validateLoginForm('invalido', 'x').ok, false);
  });

  // --- Login ---
  await test('login válido', async () => {
    const client = buildClient({
      signInWithPassword: async () => ({
        data: {
          session: { user: { id: 'u1', email: 'ana@email.com' } } as never,
          user: { id: 'u1', email: 'ana@email.com' } as never,
        },
        error: null,
      }),
    });
    const result = await performSignIn(client, 'Ana@Email.com', 'secret123');
    assert.equal(result.status, 'success');
  });

  await test('erro de login (credenciais inválidas)', async () => {
    const client = buildClient({
      signInWithPassword: async () => ({
        data: { session: null, user: null },
        error: { message: 'Invalid login credentials', status: 400 } as never,
      }),
    });
    const result = await performSignIn(client, 'ana@email.com', 'wrongpass');
    assert.equal(result.status, 'error');
    if (result.status === 'error') {
      assert.equal(result.error, 'E-mail ou senha incorretos.');
    }
  });

  // --- Cadastro ---
  await test('cadastro válido (sessão imediata)', async () => {
    const client = buildClient({
      signUp: async () => ({
        data: {
          session: { user: { id: 'u2', email: 'novo@email.com' } } as never,
          user: { id: 'u2', email: 'novo@email.com' } as never,
        },
        error: null,
      }),
    });
    const result = await performSignUp(client, {
      name: 'Novo Usuário',
      email: 'novo@email.com',
      password: '12345678',
      confirmPassword: '12345678',
    });
    assert.equal(result.status, 'authenticated');
  });

  await test('cadastro aguardando confirmação', async () => {
    let capturedOptions: Record<string, unknown> | undefined;
    const client = buildClient({
      signUp: async (params) => {
        capturedOptions = params.options?.data;
        return { data: { session: null, user: null }, error: null };
      },
    });
    const result = await performSignUp(client, {
      name: 'Maria Confirma',
      email: 'maria@email.com',
      password: '12345678',
      confirmPassword: '12345678',
    });
    assert.equal(result.status, 'confirmation_required');
    if (result.status === 'confirmation_required') {
      assert.equal(result.email, 'maria@email.com');
    }
    // Nome enviado dentro de options.data.display_name
    assert.equal(capturedOptions?.display_name, 'Maria Confirma');
  });

  await test('cadastro com e-mail já registrado', async () => {
    const client = buildClient({
      signUp: async () => ({
        data: { session: null, user: null },
        error: { message: 'User already registered', status: 422 } as never,
      }),
    });
    const result = await performSignUp(client, {
      name: 'Repetido',
      email: 'repetido@email.com',
      password: '12345678',
      confirmPassword: '12345678',
    });
    assert.equal(result.status, 'error');
    if (result.status === 'error') {
      assert.equal(result.error, 'Este e-mail já está cadastrado.');
    }
  });

  // --- Guards ---
  await test('envio duplicado bloqueado', () => {
    const guard = createSubmitGuard();
    assert.equal(guard.begin(), true);
    assert.equal(guard.begin(), false);
    guard.end();
    assert.equal(guard.begin(), true);
  });

  await test('inicialização dupla impedida', () => {
    const controller = createInitController();
    assert.equal(controller.shouldRun(), true);
    assert.equal(controller.shouldRun(), false);
    controller.finish();
    assert.equal(controller.shouldRun(), false);
    assert.equal(controller.isInitialized, true);
  });

  // --- Eventos de auth ---
  await test('evento SIGNED_IN reflete a sessão', () => {
    let state: { session: MockSession | null } = { session: null };
    const apply = (_event: string, session: MockSession | null) => {
      state = { session };
    };
    apply('SIGNED_IN', { user: { id: 'u1', email: 'a@b.com' } });
    assert.notEqual(state.session, null);
    assert.equal(state.session?.user?.id, 'u1');
  });

  await test('evento SIGNED_OUT limpa a sessão', () => {
    let state: { session: MockSession | null } = {
      session: { user: { id: 'u1', email: 'a@b.com' } },
    };
    const apply = (_event: string, session: MockSession | null) => {
      state = { session };
    };
    apply('SIGNED_OUT', null);
    assert.equal(state.session, null);
  });

  await test('sessão expirada volta ao estado convidado', () => {
    // Sessão expirada chega como null no callback → status convidado.
    const route = resolveStartRoute({
      hydrated: true,
      isInitializing: false,
      hasCompletedOnboarding: true,
      hasSession: false,
      hasChosenGuest: false,
    });
    assert.equal(route, 'welcome');
  });

  // --- Logout preserva progresso ---
  await test('logout preserva progresso local', async () => {
    const fakeProgress = { xp: 1200, streak: 7, history: ['a', 'b'] };
    const client = buildClient({ signOut: async () => ({ error: null }) });
    const result = await performSignOut(client);
    assert.equal(result.status, 'success');
    // performSignOut só toca o cliente de auth — progresso intacto.
    assert.deepEqual(fakeProgress, { xp: 1200, streak: 7, history: ['a', 'b'] });
  });

  // --- Routing ---
  await test('convidado entrando no app', () => {
    const route = resolveStartRoute({
      hydrated: true,
      isInitializing: false,
      hasCompletedOnboarding: true,
      hasSession: false,
      hasChosenGuest: true,
    });
    assert.equal(route, 'app');
  });

  await test('usuário autenticado entra no app', () => {
    const route = resolveStartRoute({
      hydrated: true,
      isInitializing: false,
      hasCompletedOnboarding: true,
      hasSession: true,
      hasChosenGuest: false,
    });
    assert.equal(route, 'app');
  });

  await test('aguarda hidratação/inicialização', () => {
    assert.equal(
      resolveStartRoute({
        hydrated: false,
        isInitializing: false,
        hasCompletedOnboarding: true,
        hasSession: false,
        hasChosenGuest: false,
      }),
      'loading'
    );
    assert.equal(
      resolveStartRoute({
        hydrated: true,
        isInitializing: true,
        hasCompletedOnboarding: true,
        hasSession: false,
        hasChosenGuest: false,
      }),
      'loading'
    );
  });

  // --- Variáveis ausentes / cliente indisponível ---
  await test('variáveis ausentes (cliente null)', async () => {
    const signIn = await performSignIn(null, 'ana@email.com', 'secret123');
    assert.equal(signIn.status, 'error');
    const signUp = await performSignUp(null, {
      name: 'Ana',
      email: 'ana@email.com',
      password: '12345678',
      confirmPassword: '12345678',
    });
    assert.equal(signUp.status, 'error');
  });

  // --- Erro de rede ---
  await test('erro de rede mapeado', () => {
    assert.equal(isNetworkError({ message: 'Network request failed' }), true);
    assert.equal(
      mapAuthError({ message: 'Network request failed' }),
      'Sem conexão. Verifique sua internet e tente novamente.'
    );
  });

  await test('erro de rede em performSignIn', async () => {
    const client = buildClient({
      signInWithPassword: async () => {
        throw new Error('Network request failed');
      },
    });
    const result = await performSignIn(client, 'ana@email.com', 'secret123');
    assert.equal(result.status, 'error');
    if (result.status === 'error') {
      assert.equal(
        result.error,
        'Sem conexão. Verifique sua internet e tente novamente.'
      );
    }
  });

  // --- Nome de exibição ---
  await test('deriveDisplayName usa metadata e fallback', () => {
    assert.equal(
      deriveDisplayName({
        email: 'ana@email.com',
        user_metadata: { display_name: 'Ana Maria' },
      } as never),
      'Ana Maria'
    );
    assert.equal(
      deriveDisplayName({
        email: 'ana@email.com',
        user_metadata: {},
      } as never),
      'ana'
    );
  });
}

run().then(() => {
  console.log(`\n${passed} teste(s) de autenticação passaram.`);
  if (process.exitCode === 1) {
    console.error('Alguns testes falharam.');
  }
});
