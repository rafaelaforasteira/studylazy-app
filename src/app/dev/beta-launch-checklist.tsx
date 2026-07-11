import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';

import PrimaryButton from '../../components/ui/PrimaryButton';
import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { ROUTES } from '../../constants/routes';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { isSupabaseConfigured } from '../../lib/supabase';

type CheckSection = {
  title: string;
  items: { id: string; label: string; hint?: string }[];
};

const SECTIONS: CheckSection[] = [
  {
    title: 'Abertura e conta',
    items: [
      { id: 'app-open', label: 'App abre sem tela branca' },
      { id: 'onboarding', label: 'Onboarding completo (9 telas + idioma)' },
      { id: 'guest', label: 'Modo convidado funciona offline' },
      { id: 'login', label: 'Login com e-mail e senha' },
      { id: 'register', label: 'Cadastro e confirmação de e-mail' },
      {
        id: 'reset-password',
        label: 'Recuperação de senha (deep link no mesmo aparelho)',
        hint: 'studylazy://auth/reset-password',
      },
    ],
  },
  {
    title: 'Sessões de estudo',
    items: [
      { id: 'session-math', label: 'Sessão Matemática (5 questões)' },
      { id: 'session-portuguese', label: 'Sessão Português (5 questões)' },
      { id: 'session-humanities', label: 'Sessão Ciências Humanas (5 questões)' },
      { id: 'session-nature', label: 'Sessão Ciências da Natureza (5 questões)' },
      {
        id: 'session-language',
        label: 'Sessão Inglês ou Espanhol (até 4 questões oficiais)',
      },
      { id: 'review', label: 'Revisão de erros' },
    ],
  },
  {
    title: 'Progresso',
    items: [
      { id: 'xp', label: 'XP persiste após sessão' },
      { id: 'streak', label: 'Sequência (streak) calculada corretamente' },
      { id: 'history', label: 'Histórico de lições visível' },
    ],
  },
  {
    title: 'Nuvem e conta',
    items: [
      { id: 'sync', label: 'Sincronização (usuário logado + Supabase)' },
      { id: 'offline', label: 'Uso offline após primeiro carregamento' },
      { id: 'logout-local', label: 'Logout local preserva progresso neste aparelho' },
      { id: 'logout-global', label: 'Logout global (todas as sessões)' },
      {
        id: 'delete-account',
        label: 'Exclusão de conta em ambiente de teste',
        hint: 'Edge Function delete-account',
      },
    ],
  },
  {
    title: 'Infraestrutura beta',
    items: [
      { id: 'apk', label: 'APK Android preview instalável' },
      { id: 'deeplink', label: 'Deep link abre rota correta' },
      { id: 'supabase', label: 'Supabase URL e chave publishable configurados' },
      { id: 'edge-function', label: 'Edge Function delete-account implantada' },
      { id: 'eas', label: 'EAS preview build concluído' },
    ],
  },
  {
    title: 'Próximos bloqueios (pós-beta gratuito)',
    items: [
      { id: 'block-payment', label: 'Sem pagamento real nesta versão' },
      { id: 'block-ios', label: 'iOS ainda não disponível' },
      { id: 'block-pro', label: 'StudyLazy Pro — assinatura futura' },
      { id: 'block-visual', label: 'Questões com imagem pendente de revisão visual' },
      { id: 'block-email', label: 'E-mail Supabase em modo produção (SPF/DKIM)' },
      { id: 'block-android-qa', label: 'Testes reais em dispositivos Android variados' },
    ],
  },
];

const ALL_ITEMS = SECTIONS.flatMap((section) => section.items);

export default function BetaLaunchChecklistScreen() {
  if (!__DEV__) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>
          Tela disponível apenas em desenvolvimento.
        </Text>
      </View>
    );
  }
  return <BetaLaunchChecklistContent />;
}

function BetaLaunchChecklistContent() {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const doneCount = ALL_ITEMS.filter((item) => checked[item.id]).length;
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
      <Text style={styles.title}>Beta Launch Checklist</Text>
      <Text style={styles.subtitle}>/dev/beta-launch-checklist</Text>
      <Text style={styles.lead}>
        Checklist manual para liberar o beta gratuito. Marque conforme validar em
        dispositivo real — sem expor tokens, chaves ou dados sensíveis.
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>
          {doneCount}/{ALL_ITEMS.length} itens marcados
        </Text>
        <Text style={styles.meta}>
          {config?.android?.package ?? '—'} • scheme {String(config?.scheme)}
        </Text>
        <Text style={styles.meta}>
          Supabase: {isSupabaseConfigured ? 'configurado' : 'ausente'}
        </Text>
        <Text style={styles.meta}>
          Versão {config?.version ?? '—'} (code{' '}
          {String(config?.android?.versionCode ?? '—')})
        </Text>
      </View>

      {SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.card}>
            {section.items.map((item, index) => {
              const isChecked = Boolean(checked[item.id]);
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isChecked }}
                  onPress={() => toggle(item.id)}
                  style={[
                    styles.row,
                    index === section.items.length - 1 && styles.rowLast,
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      isChecked && styles.checkboxChecked,
                    ]}
                  >
                    {isChecked ? (
                      <Text style={styles.checkmark}>✓</Text>
                    ) : null}
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
        </View>
      ))}

      <View style={styles.actions}>
        <PrimaryButton
          label="Tela Pro (sem cobrança)"
          variant="secondary"
          onPress={() => router.push(ROUTES.pro)}
        />
        <PrimaryButton
          label="Checklist beta (QA rápido)"
          variant="secondary"
          onPress={() => router.push('/dev/beta-checklist')}
        />
        <PrimaryButton
          label="Android beta health"
          variant="secondary"
          onPress={() => router.push('/dev/android-beta-health')}
        />
        <PrimaryButton
          label="Segurança da conta"
          variant="secondary"
          onPress={() => router.push('/dev/account-security-health')}
        />
      </View>

      <Text style={styles.note}>
        Beta gratuito: nenhuma cobrança, cartão ou loja nesta versão. Consulte
        docs/beta/free-beta-launch-checklist.md para critérios de liberação.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
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
  lead: { color: colors.text.secondary, ...typography.bodySmall },
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
  section: { gap: spacing.sm },
  sectionTitle: {
    color: colors.primarySoft,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
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
