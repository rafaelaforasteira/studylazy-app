import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createClient,
  processLock,
  type SupabaseClient,
} from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Indica se as variáveis públicas necessárias estão configuradas. */
export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey
);

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function warnDev(message: string) {
  if (__DEV__) {
    // Mensagem clara em desenvolvimento — sem expor valores de chaves.
    console.warn(`[supabase] ${message}`);
  }
}

function createSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabasePublishableKey) {
    warnDev(
      'Variáveis ausentes. Defina EXPO_PUBLIC_SUPABASE_URL e ' +
        'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY no arquivo .env. O app segue ' +
        'funcionando em modo convidado, mas login e cadastro ficam indisponíveis.'
    );
    return null;
  }

  if (!isValidHttpUrl(supabaseUrl)) {
    warnDev(
      'EXPO_PUBLIC_SUPABASE_URL não é uma URL http(s) válida. O app segue em ' +
        'modo convidado; login e cadastro ficam indisponíveis até a correção.'
    );
    return null;
  }

  try {
    return createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        // Na web o Supabase usa localStorage por padrão; no nativo usamos AsyncStorage.
        storage: Platform.OS === 'web' ? undefined : AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // O deep link de recuperação é processado manualmente em /auth/reset-password.
        detectSessionInUrl: false,
        // PKCE: necessário para o fluxo seguro de redefinição de senha por e-mail.
        flowType: 'pkce',
        lock: processLock,
      },
    });
  } catch {
    warnDev(
      'Falha ao inicializar o cliente Supabase. O app segue em modo convidado.'
    );
    return null;
  }
}

/**
 * Cliente Supabase central e único. `null` quando as variáveis de ambiente
 * não estão configuradas — nesse caso o app continua em modo convidado.
 */
export const supabase: SupabaseClient | null = createSupabaseClient();

// Gerencia o auto refresh por AppState somente no nativo. Registrado uma única
// vez (módulo singleton) e nunca na web.
if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
