import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import PrimaryButton from '../../components/ui/PrimaryButton';
import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { ROUTES } from '../../constants/routes';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { maskEmail, maskId } from '../../lib/authFlow';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export default function AccountSecurityHealthScreen() {
  if (!__DEV__) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>
          Tela disponível apenas em desenvolvimento.
        </Text>
      </View>
    );
  }
  return <AccountSecurityHealthContent />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function AccountSecurityHealthContent() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  const resetRedirect = Linking.createURL('/auth/reset-password');
  const hasFunctions = Boolean(supabase?.functions);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Account Security Health</Text>
      <Text style={styles.subtitle}>/dev/account-security-health</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sessão</Text>
        <Row label="Supabase configurado" value={isSupabaseConfigured ? 'sim' : 'não'} />
        <Row label="Inicializando" value={isInitializing ? 'sim' : 'não'} />
        <Row label="Autenticado" value={session ? 'sim' : 'não'} />
        <Row label="User ID" value={maskId(user?.id)} />
        <Row label="E-mail" value={maskEmail(user?.email)} />
        <Row
          label="E-mail confirmado"
          value={user?.email_confirmed_at ? 'sim' : '—'}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recuperação (PKCE)</Text>
        <Row label="Deep link reset" value={resetRedirect} />
        <Row label="flowType" value="pkce" />
        <Row label="detectSessionInUrl" value="false (manual)" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Exclusão de conta</Text>
        <Row label="Edge Function" value="delete-account" />
        <Row label="functions.invoke" value={hasFunctions ? 'disponível' : 'indisponível'} />
        <Row label="Service role no cliente" value="não (apenas servidor)" />
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Abrir 'Esqueci minha senha'"
          variant="secondary"
          onPress={() => router.push(ROUTES.authForgotPassword)}
        />
        <PrimaryButton
          label="Abrir 'Alterar senha'"
          variant="secondary"
          onPress={() => router.push(ROUTES.changePassword)}
        />
      </View>

      <Text style={styles.note}>
        Nunca exibe tokens, chaves, senha ou e-mail completo.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
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
  title: { color: colors.text.primary, ...typography.title },
  subtitle: { color: colors.text.muted, ...typography.bodySmall },
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
  rowLabel: { color: colors.text.secondary, ...typography.bodySmall, flexShrink: 1 },
  rowValue: {
    color: colors.text.primary,
    ...typography.bodySmall,
    fontWeight: '700',
    textAlign: 'right',
    flexShrink: 1,
  },
  actions: { gap: spacing.sm },
  note: { color: colors.text.muted, ...typography.bodySmall, textAlign: 'center' },
});
