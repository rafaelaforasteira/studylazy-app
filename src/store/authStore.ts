import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import {
  performScopedSignOut,
  requestAccountDeletion,
  type SignOutScope,
} from '../lib/accountSecurity';
import { logAuthErrorDev } from '../lib/authErrors';
import {
  createInitController,
  performSignIn,
  performSignUp,
  type SignUpResult,
} from '../lib/authFlow';
import { supabase } from '../lib/supabase';

type AuthState = {
  session: Session | null;
  user: User | null;
  isInitializing: boolean;
  isSubmitting: boolean;
  error: string | null;

  initializeAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<SignUpResult>;
  /** Logout com escopo: `local` (este aparelho) ou `global` (todos). */
  signOut: (scope?: SignOutScope) => Promise<void>;
  /** Exclusão segura via Edge Function; limpa a sessão local ao concluir. */
  deleteAccount: () => Promise<boolean>;
  clearAuthError: () => void;
};

// Estado de inicialização em escopo de módulo: garante idempotência e uma única
// subscription, independentemente de quantos componentes chamem initializeAuth.
const initController = createInitController();
let authSubscription: { unsubscribe: () => void } | null = null;

/** Quantidade de subscriptions ativas (usado apenas na tela de diagnóstico). */
export function getAuthSubscriptionCount(): number {
  return authSubscription ? 1 : 0;
}

/** Encerra a subscription (uso em testes/diagnóstico). */
export function disposeAuth(): void {
  if (authSubscription) {
    authSubscription.unsubscribe();
    authSubscription = null;
  }
  initController.reset();
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isInitializing: true,
  isSubmitting: false,
  error: null,

  initializeAuth: async () => {
    if (!initController.shouldRun()) {
      return;
    }

    if (!supabase) {
      set({ isInitializing: false });
      initController.finish();
      return;
    }

    try {
      const { data } = await supabase.auth.getSession();
      set({
        session: data.session ?? null,
        user: data.session?.user ?? null,
      });

      if (!authSubscription) {
        const { data: subscriptionData } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            // Supabase é a fonte da sessão: apenas refletimos o estado.
            set({
              session: session ?? null,
              user: session?.user ?? null,
            });
          }
        );
        authSubscription = subscriptionData.subscription;
      }
    } catch (error) {
      logAuthErrorDev('initializeAuth', error);
    } finally {
      set({ isInitializing: false });
      initController.finish();
    }
  },

  signIn: async (email, password) => {
    if (get().isSubmitting) {
      return false;
    }
    set({ isSubmitting: true, error: null });

    const result = await performSignIn(supabase?.auth, email, password);

    if (result.status === 'error') {
      set({ isSubmitting: false, error: result.error });
      return false;
    }

    // onAuthStateChange também atualizará; setamos aqui para resposta imediata.
    set({
      session: result.session,
      user: result.user,
      isSubmitting: false,
      error: null,
    });
    return true;
  },

  signUp: async (name, email, password, confirmPassword) => {
    if (get().isSubmitting) {
      return { status: 'error', error: 'Aguarde o envio anterior.' };
    }
    set({ isSubmitting: true, error: null });

    const result = await performSignUp(supabase?.auth, {
      name,
      email,
      password,
      confirmPassword,
    });

    if (result.status === 'error') {
      set({ isSubmitting: false, error: result.error });
      return result;
    }

    if (result.status === 'authenticated') {
      set({
        session: result.session,
        user: result.user,
        isSubmitting: false,
        error: null,
      });
      return result;
    }

    // confirmation_required: cadastro não conta como login.
    set({ isSubmitting: false, error: null });
    return result;
  },

  signOut: async (scope: SignOutScope = 'local') => {
    set({ isSubmitting: true });
    // Logout limpa APENAS a sessão de autenticação. XP, histórico, erros e
    // preferências locais permanecem intactos (outros stores não são tocados).
    await performScopedSignOut(supabase?.auth, scope);
    set({
      session: null,
      user: null,
      isSubmitting: false,
      error: null,
    });
  },

  deleteAccount: async () => {
    if (get().isSubmitting) {
      return false;
    }
    set({ isSubmitting: true, error: null });

    const client = supabase;
    const invoker = client
      ? () => client.functions.invoke('delete-account')
      : null;
    const result = await requestAccountDeletion(invoker);

    if (result.status === 'error') {
      set({ isSubmitting: false, error: result.error });
      return false;
    }

    // Conta removida no servidor → encerra a sessão local imediatamente.
    await performScopedSignOut(supabase?.auth, 'local');
    set({ session: null, user: null, isSubmitting: false, error: null });
    return true;
  },

  clearAuthError: () => set({ error: null }),
}));
