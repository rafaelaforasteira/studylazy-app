/**
 * Lógica PURA do RevenueCat — testável no Node sem SDK nativo.
 */
import { REVENUECAT_ENTITLEMENT_PRO } from './revenueCatProducts';
import type { EntitlementSource, UserPlan } from './types';

export type RevenueCatPlatform = 'ios' | 'android' | 'web' | 'unknown';

export type RevenueCatEnvKeys = {
  ios?: string | null;
  android?: string | null;
  web?: string | null;
};

export type CustomerInfoLike = {
  entitlements?: {
    active?: Record<string, unknown>;
  };
};

export type PackageLike = {
  identifier: string;
  packageType?: string;
  product?: { identifier?: string; title?: string; priceString?: string };
};

export type OfferingsLike = {
  current?: {
    availablePackages?: PackageLike[];
  } | null;
};

export type PurchaseErrorLike = {
  code?: string | number;
  message?: string;
  userCancelled?: boolean;
};

export type ProOfferingOption = {
  id: string;
  label: string;
  priceLabel: string;
  packageType: 'monthly' | 'annual' | 'unknown';
};

export function resolveRevenueCatPlatform(
  os: string | undefined
): RevenueCatPlatform {
  if (os === 'ios' || os === 'android' || os === 'web') {
    return os;
  }
  return 'unknown';
}

export function getRevenueCatApiKey(
  platform: RevenueCatPlatform,
  keys: RevenueCatEnvKeys
): string | null {
  const value =
    platform === 'ios'
      ? keys.ios
      : platform === 'android'
        ? keys.android
        : platform === 'web'
          ? keys.web
          : null;
  if (!value || !value.trim()) {
    return null;
  }
  return value.trim();
}

export function isRevenueCatConfigured(
  platform: RevenueCatPlatform,
  keys: RevenueCatEnvKeys
): boolean {
  return getRevenueCatApiKey(platform, keys) !== null;
}

export function isProEntitlementActive(
  customerInfo: CustomerInfoLike | null | undefined
): boolean {
  const active = customerInfo?.entitlements?.active ?? {};
  return Boolean(active[REVENUECAT_ENTITLEMENT_PRO]);
}

export function mapCustomerInfoToPlan(
  customerInfo: CustomerInfoLike | null | undefined,
  checkedAt = new Date().toISOString()
): { plan: UserPlan; source: EntitlementSource; entitlementCheckedAt: string } {
  const isPro = isProEntitlementActive(customerInfo);
  return {
    plan: isPro ? 'pro' : 'free',
    source: 'revenuecat',
    entitlementCheckedAt: checkedAt,
  };
}

export function shouldKeepLastKnownPlanOnSyncFailure(
  hadPreviousCheck: boolean
): boolean {
  return hadPreviousCheck;
}

export function requiresLoginForPurchase(
  isAuthenticated: boolean
): boolean {
  return !isAuthenticated;
}

export function mapPurchaseError(error: PurchaseErrorLike | null | undefined): string {
  if (!error) {
    return 'Não foi possível concluir a compra. Tente novamente.';
  }
  if (error.userCancelled) {
    return 'Compra cancelada.';
  }
  const code = String(error.code ?? '').toLowerCase();
  const message = (error.message ?? '').toLowerCase();
  if (
    code.includes('cancel') ||
    message.includes('cancel') ||
    message.includes('cancelled')
  ) {
    return 'Compra cancelada.';
  }
  if (
    message.includes('network') ||
    message.includes('offline') ||
    message.includes('internet')
  ) {
    return 'Sem conexão. Verifique sua internet e tente novamente.';
  }
  if (
    message.includes('not available') ||
    message.includes('unavailable') ||
    code.includes('product_not_available')
  ) {
    return 'Este plano ainda não está disponível na loja.';
  }
  return 'Não foi possível concluir a compra. Tente novamente.';
}

export function mapRestoreResult(
  customerInfo: CustomerInfoLike | null | undefined
): { restored: boolean; message: string } {
  if (isProEntitlementActive(customerInfo)) {
    return {
      restored: true,
      message: 'Assinatura Pro restaurada com sucesso.',
    };
  }
  return {
    restored: false,
    message: 'Nenhuma assinatura ativa encontrada para esta conta.',
  };
}

function inferPackageType(pkg: PackageLike): ProOfferingOption['packageType'] {
  const type = (pkg.packageType ?? '').toUpperCase();
  if (type.includes('MONTH')) {
    return 'monthly';
  }
  if (type.includes('ANNUAL') || type.includes('YEAR')) {
    return 'annual';
  }
  const id = `${pkg.identifier} ${pkg.product?.identifier ?? ''}`.toLowerCase();
  if (id.includes('month')) {
    return 'monthly';
  }
  if (id.includes('annual') || id.includes('year')) {
    return 'annual';
  }
  return 'unknown';
}

export function extractOfferingOptions(
  offerings: OfferingsLike | null | undefined
): ProOfferingOption[] {
  const packages = offerings?.current?.availablePackages ?? [];
  return packages.map((pkg) => {
    const packageType = inferPackageType(pkg);
    const label =
      packageType === 'monthly'
        ? 'Mensal'
        : packageType === 'annual'
          ? 'Anual'
          : pkg.product?.title ?? 'Plano Pro';
    return {
      id: pkg.identifier,
      label,
      priceLabel: pkg.product?.priceString ?? '—',
      packageType,
    };
  });
}

export function hasAvailableOfferings(
  offerings: OfferingsLike | null | undefined
): boolean {
  return (offerings?.current?.availablePackages?.length ?? 0) > 0;
}
