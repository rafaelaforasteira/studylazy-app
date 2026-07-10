import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import AppScreen from '../components/ui/AppScreen';
import PrimaryButton from '../components/ui/PrimaryButton';
import { colors } from '../constants/colors';
import { ROUTES } from '../constants/routes';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { useEntitlements } from '../hooks/use-entitlements';

const PRO_BENEFITS = [
  'Estudo ilimitado, sem limite diário de sessões ou questões',
  'Revisão completa de erros pendentes',
  'Estatísticas avançadas do seu desempenho',
  'Sincronização em múltiplos dispositivos',
  'Futuras questões oficiais adicionadas ao banco',
  'Experiência sem anúncios',
] as const;

export default function ProScreen() {
  const router = useRouter();
  const { isPro } = useEntitlements();

  function handleWaitlist() {
    Alert.alert(
      'Em breve',
      'O StudyLazy Pro ainda está em desenvolvimento. Entraremos em contato quando estiver disponível — sem cobrança nesta versão.'
    );
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.tabsVoce);
  }

  return (
    <AppScreen contentStyle={styles.content}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={handleBack}
        hitSlop={8}
        style={styles.backButton}
      >
        <Text style={styles.backText}>‹ Voltar</Text>
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>StudyLazy Pro</Text>
        <Text style={styles.title}>Estude sem limites</Text>
        <Text style={styles.subtitle}>
          Uma experiência completa para quem quer ir além do plano gratuito.
          Pagamentos e assinaturas ainda não estão disponíveis nesta versão.
        </Text>
      </View>

      <View style={styles.benefitsCard}>
        {PRO_BENEFITS.map((benefit) => (
          <View key={benefit} style={styles.benefitRow}>
            <Text style={styles.bullet}>✓</Text>
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      {isPro ? (
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>
            Você está com acesso Pro ativo neste aparelho.
          </Text>
        </View>
      ) : null}

      <PrimaryButton
        label="Entrar na lista de espera"
        onPress={handleWaitlist}
      />
      <PrimaryButton
        label="Em breve"
        variant="secondary"
        onPress={handleWaitlist}
        style={styles.secondaryCta}
      />

      <Text style={styles.disclaimer}>
        Não há valor de assinatura nem cobrança nesta versão beta. Seu progresso,
        XP e sequência continuam funcionando normalmente no plano gratuito.
      </Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  backButton: { alignSelf: 'flex-start' },
  backText: {
    color: colors.text.secondary,
    ...typography.body,
    fontWeight: '600',
  },
  hero: { gap: spacing.sm },
  eyebrow: {
    color: colors.primarySoft,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: { color: colors.text.primary, ...typography.title },
  subtitle: { color: colors.text.secondary, ...typography.body },
  benefitsCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  benefitRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  bullet: { color: colors.primarySoft, fontWeight: '800', marginTop: 2 },
  benefitText: { flex: 1, color: colors.text.secondary, ...typography.body },
  proBadge: {
    backgroundColor: 'rgba(182, 255, 74, 0.12)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(182, 255, 74, 0.35)',
    padding: spacing.md,
  },
  proBadgeText: {
    color: colors.successTone.main,
    ...typography.bodySmall,
    textAlign: 'center',
  },
  secondaryCta: { marginTop: spacing.xs },
  disclaimer: {
    color: colors.text.muted,
    ...typography.bodySmall,
    textAlign: 'center',
  },
});
