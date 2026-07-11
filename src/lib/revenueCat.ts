/**
 * Cliente central do RevenueCat.
 *
 * - Inicialização idempotente por plataforma
 * - Identificação segura com Supabase user id
 * - Web/nativo com fallback quando chave ausente
 * - Nunca loga chaves de API
 */
import { Platform } from 'react-native';

import {
  createPurchaseGuard,
  purchaseProPackage as runPurchase,
  restorePurchases as runRestore,
  type PurchaseClientLike,
  type PurchaseResult,
  type RestoreResult,
} from '../entitlements/purchaseFlow';
import { useEntitlementStore } from '../entitlements/entitlementStore';
import {
  extractOfferingOptions,
  getRevenueCatApiKey,
  hasAvailableOfferings,
  isRevenueCatConfigured,
  mapCustomerInfoToPlan,
  resolveRevenueCatPlatform,
  shouldKeepLastKnownPlanOnSyncFailure,
  type CustomerInfoLike,
  type OfferingsLike,
  type PackageLike,
  type ProOfferingOption,
  type RevenueCatEnvKeys,
} from '../entitlements/revenueCatLogic';

type PurchasesModule = typeof import('react-native-purchases');
type PurchasesDefault = PurchasesModule['default'];

let purchasesModule: PurchasesModule | null = null;
let initState: 'idle' | 'initializing' | 'ready' | 'unavailable' = 'idle';
let initPromise: Promise<void> | null = null;
let configuredUserId: string | null | undefined = undefined;
const purchaseGuard = createPurchaseGuard();

function warnDev(message: string) {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(`[revenuecat] ${message}`);
  }
}

function getEnvKeys(): RevenueCatEnvKeys {
  return {
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    web: process.env.EXPO_PUBLIC_REVENUECAT_WEB_API_KEY,
  };
}

export function getCurrentRevenueCatPlatform() {
  return resolveRevenueCatPlatform(Platform.OS);
}

export function isRevenueCatAvailable(): boolean {
  return isRevenueCatConfigured(getCurrentRevenueCatPlatform(), getEnvKeys());
}

async function loadPurchasesModule(): Promise<PurchasesModule | null> {
  if (purchasesModule) {
    return purchasesModule;
  }
  try {
    purchasesModule = await import('react-native-purchases');
    return purchasesModule;
  } catch (error) {
    warnDev(
      `SDK indisponível: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

function applyCustomerInfo(customerInfo: CustomerInfoLike | null | undefined) {
  const mapped = mapCustomerInfoToPlan(customerInfo);
  useEntitlementStore.getState().applySubscriptionState(mapped);
  return mapped;
}

async function getPurchasesClient(): Promise<PurchasesDefault | null> {
  const mod = await loadPurchasesModule();
  return mod?.default ?? null;
}

function buildRuntimeClient(
  purchases: PurchasesDefault
): PurchaseClientLike {
  return {
    purchasePackage: async (pkg) => {
      try {
        const result = await purchases.purchasePackage(
          pkg as Parameters<PurchasesDefault['purchasePackage']>[0]
        );
        return { customerInfo: result.customerInfo as CustomerInfoLike };
      } catch (error) {
        const err = error as {
          userCancelled?: boolean;
          code?: string;
          message?: string;
        };
        return {
          customerInfo: {},
          error: {
            userCancelled: err.userCancelled,
            code: err.code,
            message: err.message,
          },
        };
      }
    },
    restorePurchases: async () => {
      try {
        const customerInfo = await purchases.restorePurchases();
        return { customerInfo: customerInfo as CustomerInfoLike };
      } catch (error) {
        const err = error as { code?: string; message?: string };
        return {
          customerInfo: {},
          error: { code: err.code, message: err.message },
        };
      }
    },
  };
}

/** Para testes: expõe estado de inicialização sem expor o SDK. */
export function getRevenueCatInitState() {
  return initState;
}

export async function initializeRevenueCat(
  appUserId?: string | null
): Promise<void> {
  if (initState === 'ready') {
    if (configuredUserId !== appUserId) {
      await identifyRevenueCatUser(appUserId);
    }
    return;
  }
  if (initState === 'unavailable') {
    return;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    initState = 'initializing';
    const platform = getCurrentRevenueCatPlatform();
    const apiKey = getRevenueCatApiKey(platform, getEnvKeys());
    if (!apiKey) {
      warnDev('Chave pública ausente — pagamentos desabilitados.');
      initState = 'unavailable';
      return;
    }

    const mod = await loadPurchasesModule();
    const Purchases = mod?.default;
    if (!Purchases) {
      initState = 'unavailable';
      return;
    }

    try {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        Purchases.setLogLevel(mod.LOG_LEVEL.WARN);
      }
      Purchases.configure({
        apiKey,
        appUserID: appUserId ?? undefined,
      });
      configuredUserId = appUserId ?? null;
      initState = 'ready';
      await syncEntitlementsFromRevenueCat();
    } catch (error) {
      warnDev(
        `Falha ao configurar: ${error instanceof Error ? error.message : String(error)}`
      );
      initState = 'unavailable';
    }
  })();

  try {
    await initPromise;
  } finally {
    initPromise = null;
  }
}

export async function identifyRevenueCatUser(
  appUserId?: string | null
): Promise<void> {
  if (initState !== 'ready') {
    await initializeRevenueCat(appUserId);
    return;
  }
  const Purchases = await getPurchasesClient();
  if (!Purchases) {
    return;
  }

  try {
    if (appUserId) {
      await Purchases.logIn(appUserId);
      configuredUserId = appUserId;
    } else if (configuredUserId) {
      await Purchases.logOut();
      configuredUserId = null;
    }
    await syncEntitlementsFromRevenueCat();
  } catch (error) {
    warnDev(
      `Falha ao identificar usuário: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function logoutRevenueCatUser(): Promise<void> {
  if (initState !== 'ready') {
    configuredUserId = null;
    return;
  }
  const Purchases = await getPurchasesClient();
  if (!Purchases) {
    configuredUserId = null;
    return;
  }
  try {
    await Purchases.logOut();
    configuredUserId = null;
    await syncEntitlementsFromRevenueCat();
  } catch (error) {
    warnDev(
      `Falha no logout RevenueCat: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function syncEntitlementsFromRevenueCat(): Promise<boolean> {
  if (initState !== 'ready') {
    return false;
  }
  const Purchases = await getPurchasesClient();
  if (!Purchases) {
    return false;
  }

  const hadPreviousCheck = Boolean(
    useEntitlementStore.getState().entitlementCheckedAt
  );

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    applyCustomerInfo(customerInfo as CustomerInfoLike);
    return true;
  } catch (error) {
    warnDev(
      `Falha ao sincronizar entitlements: ${error instanceof Error ? error.message : String(error)}`
    );
    if (shouldKeepLastKnownPlanOnSyncFailure(hadPreviousCheck)) {
      return false;
    }
    return false;
  }
}

export async function fetchRevenueCatOfferings(): Promise<{
  configured: boolean;
  options: ProOfferingOption[];
  packagesById: Record<string, PackageLike>;
}> {
  if (!isRevenueCatAvailable() || initState !== 'ready') {
    return { configured: isRevenueCatAvailable(), options: [], packagesById: {} };
  }
  const Purchases = await getPurchasesClient();
  if (!Purchases) {
    return { configured: false, options: [], packagesById: {} };
  }

  try {
    const offerings = (await Purchases.getOfferings()) as OfferingsLike;
    if (!hasAvailableOfferings(offerings)) {
      return { configured: true, options: [], packagesById: {} };
    }
    const packages = offerings.current?.availablePackages ?? [];
    const packagesById: Record<string, PackageLike> = {};
    packages.forEach((pkg) => {
      packagesById[pkg.identifier] = pkg;
    });
    return {
      configured: true,
      options: extractOfferingOptions(offerings),
      packagesById,
    };
  } catch (error) {
    warnDev(
      `Falha ao buscar offerings: ${error instanceof Error ? error.message : String(error)}`
    );
    return { configured: true, options: [], packagesById: {} };
  }
}

export async function purchaseProPackage(params: {
  packageId: string;
  packagesById: Record<string, PackageLike>;
  isAuthenticated: boolean;
}): Promise<PurchaseResult> {
  const Purchases = await getPurchasesClient();
  const client = Purchases ? buildRuntimeClient(Purchases) : null;
  const pkg = params.packagesById[params.packageId] ?? null;
  const result = await runPurchase({
    client,
    pkg,
    isAuthenticated: params.isAuthenticated,
    guard: purchaseGuard,
  });

  if (result.status === 'success') {
    useEntitlementStore.getState().applySubscriptionState({
      plan: result.plan,
      source: 'revenuecat',
      entitlementCheckedAt: result.checkedAt,
    });
  }

  return result;
}

export async function restorePurchases(): Promise<RestoreResult> {
  const Purchases = await getPurchasesClient();
  const client = Purchases ? buildRuntimeClient(Purchases) : null;
  const result = await runRestore({ client, guard: purchaseGuard });

  if (result.status === 'restored') {
    await syncEntitlementsFromRevenueCat();
  } else if (result.status === 'none') {
    useEntitlementStore.getState().applySubscriptionState({
      plan: 'free',
      source: 'revenuecat',
      entitlementCheckedAt: result.checkedAt,
    });
  }

  return result;
}
