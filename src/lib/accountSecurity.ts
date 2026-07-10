/**
 * Orquestração PURA dos fluxos de Recuperação e Segurança da Conta.
 *
 * Recebe um cliente (subconjunto de `supabase.auth`) e o invocador da Edge
 * Function por injeção, então é testável no Node com mocks — sem rede, sem
 * Supabase real e sem React Native. Nunca expõe tokens/senha ao usuário.
 */
import type { Session, User } from '@supabase/supabase-js';

import { logAuthErrorDev, mapAuthError } from './authErrors';
import {
  isValidEmail,
  normalizeEmail,
  validatePassword,
} from './authValidation';

/** Subconjunto de `supabase.auth` usado pelos fluxos de conta. */
export interface AccountClientLike {
  resetPasswordForEmail: (
    email: string,
    options?: { redirectTo?: string }
  ) => Promise<{ data: unknown; error: unknown }>;
  exchangeCodeForSession: (
    code: string
  ) => Promise<{ data: { session: Session | null }; error: unknown }>;
  updateUser: (attrs: {
    password?: string;
  }) => Promise<{ data: { user: User | null }; error: unknown }>;
  signOut: (options?: {
    scope?: 'global' | 'local' | 'others';
  }) => Promise<{ error: unknown }>;
}

export type SignOutScope = 'local' | 'global';

function asErrorLike(error: unknown) {
  if (error && typeof error === 'object') {
    return error as { message?: string; status?: number; name?: string };
  }
  return error == null ? null : { message: String(error) };
}

export type SimpleResult =
  | { status: 'success' }
  | { status: 'error'; error: string };

export type ResetRequestResult =
  | { status: 'sent' }
  | { status: 'error'; error: string };

/**
 * Solicita o e-mail de recuperação. `redirectTo` deve apontar para o deep link
 * `studylazy://auth/reset-password` (ou a URL web equivalente).
 */
export async function requestPasswordReset(
  client: AccountClientLike | null | undefined,
  rawEmail: string,
  redirectTo: string
): Promise<ResetRequestResult> {
  if (!isValidEmail(rawEmail)) {
    return { status: 'error', error: 'Informe um e-mail válido.' };
  }
  if (!client) {
    return {
      status: 'error',
      error: 'Serviço de conta indisponível no momento.',
    };
  }
  const email = normalizeEmail(rawEmail);
  try {
    const { error } = await client.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      return { status: 'error', error: mapAuthError(asErrorLike(error)) };
    }
    return { status: 'sent' };
  } catch (error) {
    logAuthErrorDev('requestPasswordReset', error);
    return { status: 'error', error: mapAuthError(asErrorLike(error)) };
  }
}

/** Troca o `code` do deep link por uma sessão (PKCE). */
export async function exchangeRecoveryCode(
  client: AccountClientLike | null | undefined,
  code: string | null | undefined
): Promise<SimpleResult> {
  if (!code) {
    return { status: 'error', error: 'Link inválido ou expirado.' };
  }
  if (!client) {
    return {
      status: 'error',
      error: 'Serviço de conta indisponível no momento.',
    };
  }
  try {
    const { error } = await client.exchangeCodeForSession(code);
    if (error) {
      return { status: 'error', error: mapAuthError(asErrorLike(error)) };
    }
    return { status: 'success' };
  } catch (error) {
    logAuthErrorDev('exchangeRecoveryCode', error);
    return { status: 'error', error: mapAuthError(asErrorLike(error)) };
  }
}

/** Define uma nova senha (recuperação ou alteração autenticada). */
export async function completePasswordUpdate(
  client: AccountClientLike | null | undefined,
  password: string,
  confirmPassword: string
): Promise<SimpleResult> {
  const validation = validatePassword(password);
  if (!validation.ok) {
    return { status: 'error', error: validation.error };
  }
  if (password !== confirmPassword) {
    return { status: 'error', error: 'As senhas não coincidem.' };
  }
  if (!client) {
    return {
      status: 'error',
      error: 'Serviço de conta indisponível no momento.',
    };
  }
  try {
    const { error } = await client.updateUser({ password });
    if (error) {
      return { status: 'error', error: mapAuthError(asErrorLike(error)) };
    }
    return { status: 'success' };
  } catch (error) {
    logAuthErrorDev('completePasswordUpdate', error);
    return { status: 'error', error: mapAuthError(asErrorLike(error)) };
  }
}

/**
 * Logout com escopo:
 * - `local`: encerra apenas a sessão deste aparelho;
 * - `global`: encerra a sessão em todos os dispositivos.
 */
export async function performScopedSignOut(
  client: AccountClientLike | null | undefined,
  scope: SignOutScope
): Promise<SimpleResult> {
  if (!client) {
    // Sem cliente, consideramos o logout local concluído (modo convidado).
    return { status: 'success' };
  }
  try {
    const { error } = await client.signOut({ scope });
    if (error) {
      return { status: 'error', error: mapAuthError(asErrorLike(error)) };
    }
    return { status: 'success' };
  } catch (error) {
    logAuthErrorDev('performScopedSignOut', error);
    return { status: 'error', error: mapAuthError(asErrorLike(error)) };
  }
}

export type DeletionInvoker = () => Promise<{ data?: unknown; error: unknown }>;

/**
 * Solicita a exclusão segura da conta via Edge Function (service role no
 * servidor). O cliente NUNCA executa a exclusão diretamente.
 */
export async function requestAccountDeletion(
  invoke: DeletionInvoker | null | undefined
): Promise<SimpleResult> {
  if (!invoke) {
    return {
      status: 'error',
      error: 'Serviço de conta indisponível no momento.',
    };
  }
  try {
    const { error } = await invoke();
    if (error) {
      return { status: 'error', error: mapAuthError(asErrorLike(error)) };
    }
    return { status: 'success' };
  } catch (error) {
    logAuthErrorDev('requestAccountDeletion', error);
    return { status: 'error', error: mapAuthError(asErrorLike(error)) };
  }
}

export type RecoveryParams = {
  code: string | null;
  error: string | null;
  errorDescription: string | null;
};

/**
 * Extrai `code` (PKCE) e parâmetros de erro de um deep link de recuperação.
 * Aceita query (`?code=`) e fragmento (`#...`). Puro e testável.
 */
export function parseRecoveryParamsFromUrl(
  url: string | null | undefined
): RecoveryParams {
  const empty: RecoveryParams = {
    code: null,
    error: null,
    errorDescription: null,
  };
  if (!url || typeof url !== 'string') {
    return empty;
  }

  const queryStart = url.search(/[?#]/);
  if (queryStart < 0) {
    return empty;
  }
  // Junta query e fragmento em um único conjunto de pares chave=valor.
  const raw = url.slice(queryStart + 1).replace(/#/g, '&');
  const params = new URLSearchParams(raw);

  return {
    code: params.get('code'),
    error: params.get('error') ?? params.get('error_code'),
    errorDescription: params.get('error_description'),
  };
}
