import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import AppScreen from '../components/ui/AppScreen';
import PrimaryButton from '../components/ui/PrimaryButton';
import { colors } from '../constants/colors';
import { ROUTES } from '../constants/routes';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import type { PackageLike, ProOfferingOption } from '../entitlements/revenueCatLogic';
import { useEntitlements } from '../hooks/use-entitlements';
import {
  fetchRevenueCatOfferings,
  isRevenueCatAvailable,
  purchaseProPackage,
  restorePurchases,
} from '../lib/revenueCat';
import { useAuthStore } from '../store/authStore';

const PRO_BENEFITS = [
  'Estudo ilimitado, sem limite diário de sessões ou questões',
  'Revisão completa de erros pendentes',
  'Estatísticas avançadas do seu desempenho',
  'Sincronização em múltiplos dispositivos',
  'Futuras questões oficiais adicionadas ao banco',
  'Experiência sem anúncios',
] as const;

type LoadState = 'loading' | 'ready' | 'error';

export default function ProScreen() {
  const router = useRouter();
  const { isPro } = useEntitlements();
  const session = useAuthStore((state) => state.session);
  const isAuthenticated = Boolean(session);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [options, setOptions] = useState<ProOfferingOption[]>([]);
  const [packagesById, setPackagesById] = useState<Record<string, PackageLike>>(
    {}
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const configured = isRevenueCatAvailable();
  const submitLockRef = useRef(false);

  const [loadState, setLoadState] = useState<LoadState>(() =>
    configured ? 'loading' : 'ready'
  );

  const loadOfferings = useCallback(async () => {
    if (!configured) {
      setOptions([]);
      setLoadState('ready');
      return;
    }
    setLoadState('loading');
    setErrorMessage(null);
    try {
      const result = await fetchRevenueCatOfferings();
      setOptions(result.options);
      setPackagesById(result.packagesById);
      setSelectedId(result.options[0]?.id ?? null);
      setLoadState('ready');
    } catch {
      setLoadState('error');
      setErrorMessage(
        'Não foi possível carregar os planos. Tente novamente em instantes.'
      );
    }
  }, [configured]);

  useEffect(() => {
    if (!configured) {
      return;
    }
    const timer = setTimeout(() => {
      void loadOfferings();
    }, 0);
    return () => clearTimeout(timer);
  }, [configured, loadOfferings]);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.tabsVoce);
  }

  function handleWaitlist() {
    Alert.alert(
      'Em breve',
      'Os planos Pro ainda estão sendo configurados nas lojas. Você será avisado quando estiverem disponíveis.'
    );
  }

  async function handlePurchase() {
    if (!selectedId || isPurchasing || submitLockRef.current) {
      return;
    }
    if (!isAuthenticated) {
      Alert.alert(
        'Entre na sua conta',
        'Para assinar o StudyLazy Pro, faça login com sua conta.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Entrar',
            onPress: () => router.push(ROUTES.authLogin),
          },
        ]
      );
      return;
    }

    submitLockRef.current = true;
    setIsPurchasing(true);
    const result = await purchaseProPackage({
      packageId: selectedId,
      packagesById,
      isAuthenticated,
    });
    submitLockRef.current = false;
    setIsPurchasing(false);

    if (result.status === 'login_required') {
      Alert.alert('Entre na sua conta', result.message, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Entrar', onPress: () => router.push(ROUTES.authLogin) },
      ]);
      return;
    }
    if (result.status === 'cancelled') {
      return;
    }
    if (result.status === 'error') {
      Alert.alert('Não foi possível assinar', result.message);
      return;
    }
    Alert.alert('Bem-vindo ao Pro!', 'Seu acesso Pro foi ativado neste aparelho.');
  }

  async function handleRestore() {
    if (isRestoring || submitLockRef.current) {
      return;
    }
    submitLockRef.current = true;
    setIsRestoring(true);
    const result = await restorePurchases();
    submitLockRef.current = false;
    setIsRestoring(false);

    if (result.status === 'error') {
      Alert.alert('Restauração', result.message);
      return;
    }
    Alert.alert('Restauração', result.message);
  }

  const showFallback = !configured || (loadState === 'ready' && options.length === 0);

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
          Assinatura processada pela loja do seu dispositivo. O StudyLazy nunca
          coleta dados de cartão.
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
            Você já tem acesso Pro ativo neste aparelho.
          </Text>
        </View>
      ) : null}

      {loadState === 'loading' && configured ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primarySoft} />
          <Text style={styles.loadingText}>Carregando planos…</Text>
        </View>
      ) : null}

      {errorMessage ? (
        <>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <PrimaryButton
            label="Tentar novamente"
            variant="secondary"
            onPress={() => void loadOfferings()}
          />
        </>
      ) : null}

      {!showFallback && options.length > 0 ? (
        <View style={styles.plansCard}>
          <Text style={styles.plansTitle}>Escolha seu plano</Text>
          {options.map((option) => {
            const active = option.id === selectedId;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={`Plano ${option.label}`}
                onPress={() => setSelectedId(option.id)}
                style={[styles.planRow, active && styles.planRowActive]}
              >
                <View>
                  <Text style={styles.planLabel}>{option.label}</Text>
                  <Text style={styles.planPrice}>{option.priceLabel}</Text>
                </View>
                {active ? <Text style={styles.planCheck}>✓</Text> : null}
              </Pressable>
            );
          })}
          <PrimaryButton
            label="Assinar Pro"
            loading={isPurchasing}
            disabled={isPurchasing || isRestoring || !selectedId}
            onPress={() => void handlePurchase()}
          />
        </View>
      ) : null}

      {showFallback ? (
        <>
          <PrimaryButton label="Em breve" onPress={handleWaitlist} />
          <PrimaryButton
            label="Entrar na lista de espera"
            variant="secondary"
            onPress={handleWaitlist}
            style={styles.secondaryCta}
          />
        </>
      ) : null}

      {configured ? (
        <PrimaryButton
          label="Restaurar compra"
          variant="secondary"
          loading={isRestoring}
          disabled={isPurchasing || isRestoring}
          onPress={() => void handleRestore()}
        />
      ) : null}

      {!isAuthenticated ? (
        <Text style={styles.guestHint}>
          Convidados podem ver os planos. Para assinar, entre na sua conta.
        </Text>
      ) : null}

      <Text style={styles.disclaimer}>
        Pagamentos e renovações são gerenciados pela Google Play ou App Store.
        Cancele quando quiser nas configurações da loja.
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
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: { color: colors.text.secondary, ...typography.bodySmall },
  errorText: { color: colors.error.main, ...typography.bodySmall },
  plansCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.md,
  },
  plansTitle: {
    color: colors.text.primary,
    ...typography.label,
    textTransform: 'uppercase',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surfaceSecondary,
  },
  planRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.card.selected,
  },
  planLabel: { color: colors.text.primary, ...typography.body, fontWeight: '700' },
  planPrice: { color: colors.text.secondary, ...typography.bodySmall },
  planCheck: { color: colors.primarySoft, fontWeight: '800', fontSize: 18 },
  secondaryCta: { marginTop: spacing.xs },
  guestHint: {
    color: colors.text.muted,
    ...typography.bodySmall,
    textAlign: 'center',
  },
  disclaimer: {
    color: colors.text.muted,
    ...typography.bodySmall,
    textAlign: 'center',
  },
});
