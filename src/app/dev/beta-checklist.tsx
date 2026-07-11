import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import PrimaryButton from '../../components/ui/PrimaryButton';
import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { ROUTES } from '../../constants/routes';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { isSupabaseConfigured } from '../../lib/supabase';

type CheckItem = {
  id: string;
  label: string;
  hint?: string;
};

const CHECKLIST: CheckItem[] = [
  { id: 'onboarding', label: 'Onboarding completo sem travar' },
  { id: 'guest', label: 'Modo convidado funciona offline' },
  { id: 'login', label: 'Login com e-mail e senha' },
  { id: 'register', label: 'Cadastro e confirmação de e-mail' },
  {
    id: 'reset',
    label: 'Recuperação de senha (deep link no mesmo aparelho)',
    hint: 'studylazy://auth/reset-password',
  },
  { id: 'study', label: 'Sessão de estudo (5 questões padrão)' },
  { id: 'language', label: 'Sessão de idioma com 4 questões' },
  { id: 'review', label: 'Revisão de erros' },
  { id: 'xp', label: 'XP e sequência persistem' },
  { id: 'history', label: 'Histórico de lições' },
  { id: 'sync', label: 'Sincronização (usuário logado)' },
  { id: 'offline', label: 'Uso offline após primeiro carregamento' },
  { id: 'logout', label: 'Logout local/global sem perder progresso local' },
  { id: 'delete', label: 'Exclusão de conta (ambiente de teste)' },
  { id: 'android', label: 'Build Android preview (APK)' },
  { id: 'deeplink', label: 'Deep links abrem a rota correta' },
  { id: 'invalid-route', label: 'Rota inválida mostra tela amigável' },
  { id: 'keyboard', label: 'Teclado não cobre formulários de auth' },
];

export default function BetaChecklistScreen() {
  if (!__DEV__) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>
          Tela disponível apenas em desenvolvimento.
        </Text>
      </View>
    );
  }
  return <BetaChecklistContent />;
}

function BetaChecklistContent() {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const doneCount = CHECKLIST.filter((item) => checked[item.id]).length;
  const config = Constants.expoConfig;

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Beta Checklist</Text>
      <Text style={styles.subtitle}>/dev/beta-checklist</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>
          {doneCount}/{CHECKLIST.length} itens marcados
        </Text>
        <Text style={styles.meta}>
          {config?.android?.package ?? '—'} • scheme {String(config?.scheme)}
        </Text>
        <Text style={styles.meta}>
          Supabase: {isSupabaseConfigured ? 'configurado' : 'ausente'}
        </Text>
      </View>

      <View style={styles.card}>
        {CHECKLIST.map((item, index) => {
          const isChecked = Boolean(checked[item.id]);
          return (
            <Pressable
              key={item.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isChecked }}
              onPress={() => toggle(item.id)}
              style={[
                styles.row,
                index === CHECKLIST.length - 1 && styles.rowLast,
              ]}
            >
              <View
                style={[styles.checkbox, isChecked && styles.checkboxChecked]}
              >
                {isChecked ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                {item.hint ? (
                  <Text style={styles.rowHint}>{item.hint}</Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Abrir tela Pro"
          variant="secondary"
          onPress={() => router.push(ROUTES.pro)}
        />
        <PrimaryButton
          label="Checklist de lançamento beta"
          variant="secondary"
          onPress={() => router.push('/dev/beta-launch-checklist')}
        />
        <PrimaryButton
          label="Segurança da conta"
          variant="secondary"
          onPress={() => router.push('/dev/account-security-health')}
        />
        <PrimaryButton
          label="Android beta health"
          variant="secondary"
          onPress={() => router.push('/dev/android-beta-health')}
        />
      </View>

      <Text style={styles.note}>
        Checklist local de QA — não exibe tokens, chaves ou payload de
        sincronização.
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
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  summaryText: {
    color: colors.text.primary,
    ...typography.body,
    fontWeight: '800',
  },
  meta: { color: colors.text.secondary, ...typography.bodySmall },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  rowLast: { borderBottomWidth: 0 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  checkmark: { color: colors.primarySoft, fontWeight: '800', fontSize: 14 },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { color: colors.text.primary, ...typography.body },
  rowHint: { color: colors.text.muted, ...typography.bodySmall },
  actions: { gap: spacing.sm },
  note: {
    color: colors.text.muted,
    ...typography.bodySmall,
    textAlign: 'center',
  },
});
