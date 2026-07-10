import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function AndroidBetaHealthScreen() {
  if (!__DEV__) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>
          Tela disponível apenas em desenvolvimento.
        </Text>
      </View>
    );
  }
  return <AndroidBetaHealthContent />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

/** Indica apenas SE a variável existe — nunca expõe o valor. */
function presence(value: string | undefined | null): string {
  return value && value.trim().length > 0 ? 'definida' : 'ausente';
}

function maskUrlHost(value: string | undefined | null): string {
  if (!value) return '—';
  try {
    const host = new URL(value).host;
    const visible = host.slice(0, 6);
    return `${visible}…`;
  } catch {
    return 'inválida';
  }
}

function AndroidBetaHealthContent() {
  const config = Constants.expoConfig;
  const androidConfig = config?.android;
  const resetRedirect = Linking.createURL('/auth/reset-password');

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Android Beta Health</Text>
      <Text style={styles.subtitle}>/dev/android-beta-health</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Identificação</Text>
        <Row label="Nome" value={config?.name ?? '—'} />
        <Row label="Slug" value={config?.slug ?? '—'} />
        <Row label="Android package" value={androidConfig?.package ?? '—'} />
        <Row label="versionCode" value={String(androidConfig?.versionCode ?? '—')} />
        <Row label="version" value={config?.version ?? '—'} />
        <Row label="scheme" value={String(config?.scheme ?? '—')} />
        <Row label="Plataforma atual" value={Platform.OS} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Deep link / Redirect</Text>
        <Row label="Reset URL" value={resetRedirect} />
        <Row
          label="Esperado (standalone)"
          value="studylazy://auth/reset-password"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Variáveis de ambiente</Text>
        <Row label="Supabase configurado" value={isSupabaseConfigured ? 'sim' : 'não'} />
        <Row label="EXPO_PUBLIC_SUPABASE_URL" value={presence(supabaseUrl)} />
        <Row label="URL (host)" value={maskUrlHost(supabaseUrl)} />
        <Row
          label="EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
          value={presence(publishableKey)}
        />
      </View>

      <Text style={styles.note}>
        Mostra apenas presença das variáveis e o host. Nunca exibe chaves,
        tokens ou valores completos.
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
  note: { color: colors.text.muted, ...typography.bodySmall, textAlign: 'center' },
});
