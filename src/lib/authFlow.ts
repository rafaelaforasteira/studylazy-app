/**
 * Orquestração pura dos fluxos de autenticação.
 *
 * As funções recebem um `AuthClientLike` (subconjunto de `supabase.auth`) por
 * injeção, então podem ser exercitadas em testes com mocks — sem rede, sem
 * Supabase real e sem React Native. O store de autenticação injeta o cliente
 * real; os testes injetam mocks determinísticos.
 */
import type { Session, User } from '@supabase/supabase-js';

import { mapAuthError, logAuthErrorDev } from './authErrors';
import {
  normalizeEmail,
  normalizeName,
  validateLoginForm,
  validateRegisterForm,
} from './authValidation';

/** Subconjunto de `supabase.auth` usado pelos fluxos (facilita mocks). */
export interface AuthClientLike {
  getSession: () => Promise<{
    data: { session: Session | null };
    error: unknown;
  }>;
  signInWithPassword: (params: {
    email: string;
    password: string;
  }) => Promise<{ data: { session: Session | null; user: User | null }; error: unknown }>;
  signUp: (params: {
    email: string;
    password: string;
    options?: { data?: Record<string, unknown> };
  }) => Promise<{ data: { session: Session | null; user: User | null }; error: unknown }>;
  signOut: () => Promise<{ error: unknown }>;
  onAuthStateChange: (
    callback: (event: string, session: Session | null) => void
  ) => { data: { subscription: { unsubscribe: () => void } } };
}

export type SignInResult =
  | { status: 'success'; session: Session | null; user: User | null }
  | { status: 'error'; error: string };

export type SignUpResult =
  | { status: 'authenticated'; session: Session | null; user: User | null }
  | { status: 'confirmation_required'; email: string }
  | { status: 'error'; error: string };

export type SignOutResult =
  | { status: 'success' }
  | { status: 'error'; error: string };

function asErrorLike(error: unknown) {
  if (error && typeof error === 'object') {
    return error as { message?: string; status?: number; name?: string };
  }
  return error == null ? null : { message: String(error) };
}

export async function performSignIn(
  client: AuthClientLike | null | undefined,
  rawEmail: string,
  password: string
): Promise<SignInResult> {
  const validation = validateLoginForm(rawEmail, password);
  if (!validation.ok) {
    return { status: 'error', error: validation.error };
  }

  if (!client) {
    return {
      status: 'error',
      error: 'Serviço de conta indisponível no momento.',
    };
  }

  const email = normalizeEmail(rawEmail);

  try {
    const { data, error } = await client.signInWithPassword({ email, password });
    if (error) {
      return { status: 'error', error: mapAuthError(asErrorLike(error)) };
    }
    return { status: 'success', session: data.session, user: data.user };
  } catch (error) {
    logAuthErrorDev('signIn', error);
    return { status: 'error', error: mapAuthError(asErrorLike(error)) };
  }
}

export type SignUpFields = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export async function performSignUp(
  client: AuthClientLike | null | undefined,
  fields: SignUpFields
): Promise<SignUpResult> {
  const validation = validateRegisterForm(fields);
  if (!validation.ok) {
    return { status: 'error', error: validation.error };
  }

  if (!client) {
    return {
      status: 'error',
      error: 'Serviço de conta indisponível no momento.',
    };
  }

  const email = normalizeEmail(fields.email);
  const displayName = normalizeName(fields.name);

  try {
    const { data, error } = await client.signUp({
      email,
      password: fields.password,
      options: { data: { display_name: displayName } },
    });
    if (error) {
      return { status: 'error', error: mapAuthError(asErrorLike(error)) };
    }
    // Quando a confirmação de e-mail é obrigatória, o Supabase não devolve
    // sessão imediata: o cadastro NÃO conta como login.
    if (data.session) {
      return { status: 'authenticated', session: data.session, user: data.user };
    }
    return { status: 'confirmation_required', email };
  } catch (error) {
    logAuthErrorDev('signUp', error);
    return { status: 'error', error: mapAuthError(asErrorLike(error)) };
  }
}

export async function performSignOut(
  client: AuthClientLike | null | undefined
): Promise<SignOutResult> {
  if (!client) {
    return { status: 'success' };
  }
  try {
    const { error } = await client.signOut();
    if (error) {
      return { status: 'error', error: mapAuthError(asErrorLike(error)) };
    }
    return { status: 'success' };
  } catch (error) {
    logAuthErrorDev('signOut', error);
    return { status: 'error', error: mapAuthError(asErrorLike(error)) };
  }
}

/**
 * Deriva o nome de exibição a partir dos metadados do usuário, com fallback
 * seguro para o início do e-mail.
 */
export function deriveDisplayName(
  user: Pick<User, 'email' | 'user_metadata'> | null | undefined,
  fallbackEmail?: string | null
): string {
  const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const candidate = metadata.display_name ?? metadata.name ?? metadata.full_name;
  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate.trim();
  }

  const email = user?.email ?? fallbackEmail ?? '';
  if (email.includes('@')) {
    const localPart = email.split('@')[0]?.trim();
    if (localPart) {
      return localPart;
    }
  }

  return 'Estudante';
}

/** Mascara um e-mail para exibição em telas de diagnóstico. */
export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes('@')) {
    return '—';
  }
  const [local, domain] = email.split('@');
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(local.length - 2, 1))}@${domain}`;
}

/** Mascara um identificador (ex.: user id) para exibição em diagnósticos. */
export function maskId(id: string | null | undefined): string {
  if (!id) {
    return '—';
  }
  if (id.length <= 8) {
    return `${id.slice(0, 2)}…`;
  }
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

/**
 * Controlador de inicialização idempotente: garante que `initializeAuth` só
 * rode uma vez, mesmo com chamadas concorrentes.
 */
export function createInitController() {
  let initialized = false;
  let inFlight = false;
  return {
    /** Retorna true apenas para a primeira chamada efetiva. */
    shouldRun(): boolean {
      if (initialized || inFlight) {
        return false;
      }
      inFlight = true;
      return true;
    },
    finish(): void {
      inFlight = false;
      initialized = true;
    },
    reset(): void {
      initialized = false;
      inFlight = false;
    },
    get isInitialized() {
      return initialized;
    },
  };
}

export type StartRoute = 'loading' | 'onboarding' | 'app' | 'welcome';

/**
 * Resolve para onde o `index` deve direcionar, de forma pura e testável.
 * Evita loops entre index / onboarding / auth.
 */
export function resolveStartRoute(params: {
  hydrated: boolean;
  isInitializing: boolean;
  hasCompletedOnboarding: boolean;
  hasSession: boolean;
  hasChosenGuest: boolean;
}): StartRoute {
  if (!params.hydrated || params.isInitializing) {
    return 'loading';
  }
  if (!params.hasCompletedOnboarding) {
    return 'onboarding';
  }
  if (params.hasSession || params.hasChosenGuest) {
    return 'app';
  }
  return 'welcome';
}

/** Guarda contra envio duplicado de formulários (toque duplo). */
export function createSubmitGuard() {
  let busy = false;
  return {
    begin(): boolean {
      if (busy) {
        return false;
      }
      busy = true;
      return true;
    },
    end(): void {
      busy = false;
    },
    get isBusy() {
      return busy;
    },
  };
}
