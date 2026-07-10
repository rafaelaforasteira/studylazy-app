import assert from 'node:assert';

import {
  completePasswordUpdate,
  exchangeRecoveryCode,
  parseRecoveryParamsFromUrl,
  performScopedSignOut,
  requestAccountDeletion,
  requestPasswordReset,
  type AccountClientLike,
} from '../src/lib/accountSecurity';

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

function buildClient(
  overrides: Partial<AccountClientLike> = {}
): AccountClientLike {
  return {
    resetPasswordForEmail: async () => ({ data: {}, error: null }),
    exchangeCodeForSession: async () => ({
      data: { session: null },
      error: null,
    }),
    updateUser: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
    ...overrides,
  } as AccountClientLike;
}

async function run() {
  // --- requestPasswordReset ---
  await test('reset: e-mail inválido falha sem chamar cliente', async () => {
    let called = false;
    const client = buildClient({
      resetPasswordForEmail: async () => {
        called = true;
        return { data: {}, error: null };
      },
    });
    const result = await requestPasswordReset(client, 'invalido', 'redir');
    assert.equal(result.status, 'error');
    assert.equal(called, false);
  });

  await test('reset: cliente null retorna erro amigável', async () => {
    const result = await requestPasswordReset(null, 'a@b.com', 'redir');
    assert.equal(result.status, 'error');
  });

  await test('reset: sucesso envia com redirectTo correto', async () => {
    let captured: { email?: string; redirectTo?: string } = {};
    const client = buildClient({
      resetPasswordForEmail: async (email, options) => {
        captured = { email, redirectTo: options?.redirectTo };
        return { data: {}, error: null };
      },
    });
    const result = await requestPasswordReset(
      client,
      '  Ana@Email.com ',
      'studylazy://auth/reset-password'
    );
    assert.equal(result.status, 'sent');
    assert.equal(captured.email, 'ana@email.com');
    assert.equal(captured.redirectTo, 'studylazy://auth/reset-password');
  });

  await test('reset: erro do servidor é mapeado', async () => {
    const client = buildClient({
      resetPasswordForEmail: async () => ({
        data: {},
        error: { message: 'rate limit exceeded', status: 429 },
      }),
    });
    const result = await requestPasswordReset(client, 'a@b.com', 'redir');
    assert.equal(result.status, 'error');
    if (result.status === 'error') {
      assert.match(result.error, /Muitas tentativas/);
    }
  });

  // --- exchangeRecoveryCode ---
  await test('exchange: sem code retorna erro', async () => {
    const result = await exchangeRecoveryCode(buildClient(), null);
    assert.equal(result.status, 'error');
  });

  await test('exchange: sucesso troca code por sessão', async () => {
    let captured = '';
    const client = buildClient({
      exchangeCodeForSession: async (code) => {
        captured = code;
        return { data: { session: null }, error: null };
      },
    });
    const result = await exchangeRecoveryCode(client, 'abc123');
    assert.equal(result.status, 'success');
    assert.equal(captured, 'abc123');
  });

  await test('exchange: erro mapeado', async () => {
    const client = buildClient({
      exchangeCodeForSession: async () => ({
        data: { session: null },
        error: { message: 'invalid request' },
      }),
    });
    const result = await exchangeRecoveryCode(client, 'abc');
    assert.equal(result.status, 'error');
  });

  // --- completePasswordUpdate ---
  await test('update: senha curta falha', async () => {
    const result = await completePasswordUpdate(buildClient(), '123', '123');
    assert.equal(result.status, 'error');
  });

  await test('update: senhas diferentes falham', async () => {
    const result = await completePasswordUpdate(
      buildClient(),
      '12345678',
      '87654321'
    );
    assert.equal(result.status, 'error');
  });

  await test('update: cliente null falha mesmo com senha válida', async () => {
    const result = await completePasswordUpdate(null, '12345678', '12345678');
    assert.equal(result.status, 'error');
  });

  await test('update: sucesso envia nova senha', async () => {
    let captured: { password?: string } = {};
    const client = buildClient({
      updateUser: async (attrs) => {
        captured = attrs;
        return { data: { user: null }, error: null };
      },
    });
    const result = await completePasswordUpdate(
      client,
      'senhaforte1',
      'senhaforte1'
    );
    assert.equal(result.status, 'success');
    assert.equal(captured.password, 'senhaforte1');
  });

  // --- performScopedSignOut ---
  await test('signOut: cliente null é sucesso (modo convidado)', async () => {
    const result = await performScopedSignOut(null, 'local');
    assert.equal(result.status, 'success');
  });

  await test('signOut: escopo local é repassado', async () => {
    let scope = '';
    const client = buildClient({
      signOut: async (options) => {
        scope = options?.scope ?? '';
        return { error: null };
      },
    });
    const result = await performScopedSignOut(client, 'local');
    assert.equal(result.status, 'success');
    assert.equal(scope, 'local');
  });

  await test('signOut: escopo global é repassado', async () => {
    let scope = '';
    const client = buildClient({
      signOut: async (options) => {
        scope = options?.scope ?? '';
        return { error: null };
      },
    });
    await performScopedSignOut(client, 'global');
    assert.equal(scope, 'global');
  });

  await test('signOut: erro mapeado', async () => {
    const client = buildClient({
      signOut: async () => ({ error: { message: 'network request failed' } }),
    });
    const result = await performScopedSignOut(client, 'local');
    assert.equal(result.status, 'error');
  });

  // --- requestAccountDeletion ---
  await test('delete: invoker null retorna erro', async () => {
    const result = await requestAccountDeletion(null);
    assert.equal(result.status, 'error');
  });

  await test('delete: sucesso quando função não retorna erro', async () => {
    const result = await requestAccountDeletion(async () => ({
      data: { status: 'deleted' },
      error: null,
    }));
    assert.equal(result.status, 'success');
  });

  await test('delete: erro da função é mapeado', async () => {
    const result = await requestAccountDeletion(async () => ({
      data: null,
      error: { message: 'Failed to delete account' },
    }));
    assert.equal(result.status, 'error');
  });

  await test('delete: exceção da função é tratada', async () => {
    const result = await requestAccountDeletion(async () => {
      throw new Error('network request failed');
    });
    assert.equal(result.status, 'error');
  });

  // --- parseRecoveryParamsFromUrl ---
  await test('parse: deep link com code', () => {
    const parsed = parseRecoveryParamsFromUrl(
      'studylazy://auth/reset-password?code=abc123'
    );
    assert.equal(parsed.code, 'abc123');
    assert.equal(parsed.error, null);
  });

  await test('parse: exp dev link com code', () => {
    const parsed = parseRecoveryParamsFromUrl(
      'exp://192.168.0.2:8081/--/auth/reset-password?code=xyz'
    );
    assert.equal(parsed.code, 'xyz');
  });

  await test('parse: fragmento (#) é considerado', () => {
    const parsed = parseRecoveryParamsFromUrl(
      'studylazy://auth/reset-password#error=access_denied&error_description=expired'
    );
    assert.equal(parsed.error, 'access_denied');
    assert.equal(parsed.errorDescription, 'expired');
  });

  await test('parse: url vazia/sem query retorna nulos', () => {
    assert.equal(parseRecoveryParamsFromUrl('').code, null);
    assert.equal(
      parseRecoveryParamsFromUrl('studylazy://auth/reset-password').code,
      null
    );
    assert.equal(parseRecoveryParamsFromUrl(null).code, null);
  });
}

run().then(() => {
  console.log(`\n${passed} teste(s) de segurança de conta passaram.`);
  if (process.exitCode === 1) {
    console.error('Alguns testes falharam.');
  }
});
