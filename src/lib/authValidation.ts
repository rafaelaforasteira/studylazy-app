/**
 * Validação e normalização puras para os formulários de autenticação.
 *
 * Este módulo NÃO importa React Native nem o cliente Supabase, então pode ser
 * carregado em testes Node (tsx) e reutilizado pelas telas.
 */

export const MIN_PASSWORD_LENGTH = 8;
export const MIN_NAME_LENGTH = 2;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidationResult = { ok: true } | { ok: false; error: string };

/** Normaliza e-mail: remove espaços nas pontas e converte para minúsculas. */
export function normalizeEmail(email: string): string {
  return (email ?? '').trim().toLowerCase();
}

/** Normaliza o nome: remove espaços extras nas pontas e colapsa internos. */
export function normalizeName(name: string): string {
  return (name ?? '').trim().replace(/\s+/g, ' ');
}

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(normalizeEmail(email));
}

export function validateName(name: string): ValidationResult {
  if (normalizeName(name).length < MIN_NAME_LENGTH) {
    return { ok: false, error: 'Informe seu nome.' };
  }
  return { ok: true };
}

export function validatePassword(password: string): ValidationResult {
  if ((password ?? '').length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }
  return { ok: true };
}

export function validateLoginForm(
  email: string,
  password: string
): ValidationResult {
  if (!isValidEmail(email)) {
    return { ok: false, error: 'Informe um e-mail válido.' };
  }
  if ((password ?? '').length === 0) {
    return { ok: false, error: 'Informe sua senha.' };
  }
  return { ok: true };
}

export type RegisterFormFields = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function validateRegisterForm({
  name,
  email,
  password,
  confirmPassword,
}: RegisterFormFields): ValidationResult {
  const nameResult = validateName(name);
  if (!nameResult.ok) {
    return nameResult;
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: 'Informe um e-mail válido.' };
  }
  const passwordResult = validatePassword(password);
  if (!passwordResult.ok) {
    return passwordResult;
  }
  if (password !== confirmPassword) {
    return { ok: false, error: 'As senhas não coincidem.' };
  }
  return { ok: true };
}
