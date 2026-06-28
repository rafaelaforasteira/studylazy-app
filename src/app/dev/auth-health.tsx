import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import PrimaryButton from '../../components/ui/PrimaryButton';
import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { maskEmail, maskId } from '../../lib/authFlow';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import {
  getAuthSubscriptionCount,
  useAuthStore,
} from '../../store/authStore';

export default function AuthHealthScreen() {
  if (!__DEV__) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>
          Tela disponível apenas em desenvolvimento.
        </Text>
      </View>
    );
  }
  return <AuthHealthContent />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function AuthHealthContent() {
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const signOut = useAuthStore((state) => state.signOut);

  const [idempotentResult, setIdempotentResult] = useState<string>('—');
  const [refreshResult, setRefreshResult] = useState<string>('—');

  async function handleIdempotentTest() {
    // Chamar várias vezes não deve criar novas subscriptions nem reinicializar.
    const before = getAuthSubscriptionCount();
    await Promise.all([
      initializeAuth(),
      initializeAuth(),
      initializeAuth(),
    ]);
    const after = getAuthSubscriptionCount();
    setIdempotentResult(
      `subscriptions: ${before} → ${after} (esperado ≤ 1)`
    );
  }

  async function handleRefresh() {
    if (!supabase) {
      setRefreshResult('cliente indisponível');
      return;
    }
    const { error } = await supabase.auth.refreshSession();
    setRefreshResult(error ? 'falha ao atualizar' : 'sessão atualizada');
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Auth Health</Text>
      <Text style={styles.subtitle}>/dev/auth-health</Text>

      <View style={styles.card}>
        <Row
          label="Variáveis configuradas"
          value={isSupabaseConfigured ? 'sim' : 'não'}
        />
        <Row
          label="Cliente inicializado"
          value={supabase ? 'sim' : 'não'}
        />
        <Row
          label="Auth inicializado"
          value={isInitializing ? 'não' : 'sim'}
        />
        <Row label="Sessão presente" value={session ? 'sim' : 'não'} />
        <Row label="User ID (mascarado)" value={maskId(user?.id)} />
        <Row label="E-mail (mascarado)" value={maskEmail(user?.email)} />
        <Row
          label="Status"
          value={session ? 'autenticado' : 'convidado'}
        />
        <Row
          label="Subscriptions"
          value={String(getAuthSubscriptionCount())}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Testes</Text>
        <Row label="Inicialização idempotente" value={idempotentResult} />
        <Row label="Refresh de sessão" value={refreshResult} />
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Testar inicialização idempotente"
          variant="secondary"
          onPress={handleIdempotentTest}
        />
        <PrimaryButton
          label="Refresh de sessão"
          variant="secondary"
          onPress={handleRefresh}
        />
        <PrimaryButton
          label="Logout de teste"
          variant="danger"
          onPress={() => void signOut()}
        />
      </View>

      <Text style={styles.note}>
        Esta tela nunca exibe access token ou refresh token.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },

  blocked: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },

  blockedText: {
    color: colors.text.secondary,
    ...typography.body,
    textAlign: 'center',
  },

  title: {
    color: colors.text.primary,
    ...typography.title,
  },

  subtitle: {
    color: colors.text.muted,
    ...typography.bodySmall,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.sm,
  },

  cardTitle: {
    color: colors.text.primary,
    ...typography.label,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },

  rowLabel: {
    color: colors.text.secondary,
    ...typography.bodySmall,
    flexShrink: 1,
  },

  rowValue: {
    color: colors.text.primary,
    ...typography.bodySmall,
    fontWeight: '700',
    textAlign: 'right',
  },

  actions: {
    gap: spacing.sm,
  },

  note: {
    color: colors.text.muted,
    ...typography.bodySmall,
    textAlign: 'center',
  },
});
