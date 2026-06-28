/**
 * Mapeamento de erros de autenticação para mensagens amigáveis em português.
 *
 * Puro (sem React Native / Supabase em runtime) para ser testável no Node.
 * Nunca expõe stack traces, códigos internos, tokens ou senha ao usuário.
 */

export type AuthErrorLike =
  | {
      message?: string;
      status?: number;
      code?: string;
      name?: string;
    }
  | null
  | undefined;

const GENERIC_ERROR = 'Ocorreu um erro inesperado. Tente novamente.';
const NETWORK_ERROR = 'Sem conexão. Verifique sua internet e tente novamente.';

export function isNetworkError(error: AuthErrorLike): boolean {
  if (!error) return false;
  const message = (error.message ?? '').toLowerCase();
  return (
    message.includes('failed to fetch') ||
    message.includes('network request failed') ||
    message.includes('networkerror') ||
    message.includes('network error') ||
    message.includes('timeout') ||
    error.name === 'AuthRetryableFetchError'
  );
}

export function mapAuthError(error: AuthErrorLike): string {
  if (!error) {
    return GENERIC_ERROR;
  }

  const message = (error.message ?? '').toLowerCase();
  const status = error.status;

  if (isNetworkError(error)) {
    return NETWORK_ERROR;
  }

  if (
    status === 429 ||
    message.includes('rate limit') ||
    message.includes('for security purposes') ||
    message.includes('too many requests')
  ) {
    return 'Muitas tentativas. Aguarde alguns instantes e tente novamente.';
  }

  if (message.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }

  if (message.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar.';
  }

  if (
    message.includes('already registered') ||
    message.includes('already been registered') ||
    message.includes('user already exists')
  ) {
    return 'Este e-mail já está cadastrado.';
  }

  if (
    message.includes('password should be at least') ||
    message.includes('weak password') ||
    message.includes('password is too short')
  ) {
    return 'A senha deve ter pelo menos 8 caracteres.';
  }

  return GENERIC_ERROR;
}

/**
 * Log seguro apenas em desenvolvimento. Nunca imprime tokens, sessão completa
 * ou senha — somente o contexto e a mensagem do erro.
 */
export function logAuthErrorDev(context: string, error: unknown): void {
  const isDev = typeof __DEV__ !== 'undefined' && __DEV__;
  if (!isDev) {
    return;
  }
  const message =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message?: unknown }).message)
      : String(error);
  console.warn(`[auth] ${context}: ${message}`);
}
