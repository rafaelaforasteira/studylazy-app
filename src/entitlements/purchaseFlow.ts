/**
 * Orquestração PURA de compra/restauração — injeta cliente mockável.
 */
import {
  isProEntitlementActive,
  mapCustomerInfoToPlan,
  mapPurchaseError,
  mapRestoreResult,
  requiresLoginForPurchase,
  type CustomerInfoLike,
  type PackageLike,
  type PurchaseErrorLike,
} from './revenueCatLogic';

export type PurchaseClientLike = {
  purchasePackage: (
    pkg: PackageLike
  ) => Promise<{ customerInfo: CustomerInfoLike; error?: PurchaseErrorLike }>;
  restorePurchases: () => Promise<{
    customerInfo: CustomerInfoLike;
    error?: PurchaseErrorLike;
  }>;
};

export type PurchaseResult =
  | { status: 'success'; plan: 'pro' | 'free'; checkedAt: string }
  | { status: 'cancelled'; message: string }
  | { status: 'login_required'; message: string }
  | { status: 'error'; message: string };

export type RestoreResult =
  | { status: 'restored'; message: string; checkedAt: string }
  | { status: 'none'; message: string; checkedAt: string }
  | { status: 'error'; message: string };

export function createPurchaseGuard() {
  let busy = false;
  return {
    tryBegin(): boolean {
      if (busy) {
        return false;
      }
      busy = true;
      return true;
    },
    end(): void {
      busy = false;
    },
    get isBusy() {
      return busy;
    },
  };
}

export async function purchaseProPackage(params: {
  client: PurchaseClientLike | null | undefined;
  pkg: PackageLike | null | undefined;
  isAuthenticated: boolean;
  guard?: ReturnType<typeof createPurchaseGuard>;
}): Promise<PurchaseResult> {
  if (requiresLoginForPurchase(params.isAuthenticated)) {
    return {
      status: 'login_required',
      message: 'Entre na sua conta antes de assinar o StudyLazy Pro.',
    };
  }
  if (!params.client) {
    return {
      status: 'error',
      message: 'Pagamentos indisponíveis neste ambiente.',
    };
  }
  if (!params.pkg) {
    return {
      status: 'error',
      message: 'Nenhum plano disponível no momento.',
    };
  }
  if (params.guard && !params.guard.tryBegin()) {
    return {
      status: 'error',
      message: 'Aguarde a compra anterior.',
    };
  }

  try {
    const { customerInfo, error } = await params.client.purchasePackage(
      params.pkg
    );
    if (error) {
      const message = mapPurchaseError(error);
      if (message === 'Compra cancelada.') {
        return { status: 'cancelled', message };
      }
      return { status: 'error', message };
    }
    const mapped = mapCustomerInfoToPlan(customerInfo);
    if (!isProEntitlementActive(customerInfo)) {
      return {
        status: 'error',
        message: 'Compra concluída, mas o acesso Pro não foi confirmado.',
      };
    }
    return {
      status: 'success',
      plan: mapped.plan,
      checkedAt: mapped.entitlementCheckedAt,
    };
  } catch (error) {
    const message = mapPurchaseError(error as PurchaseErrorLike);
    if (message === 'Compra cancelada.') {
      return { status: 'cancelled', message };
    }
    return { status: 'error', message };
  } finally {
    params.guard?.end();
  }
}

export async function restorePurchases(params: {
  client: PurchaseClientLike | null | undefined;
  guard?: ReturnType<typeof createPurchaseGuard>;
}): Promise<RestoreResult> {
  if (!params.client) {
    return {
      status: 'error',
      message: 'Restauração indisponível neste ambiente.',
    };
  }
  if (params.guard && !params.guard.tryBegin()) {
    return {
      status: 'error',
      message: 'Aguarde a operação anterior.',
    };
  }

  try {
    const { customerInfo, error } = await params.client.restorePurchases();
    if (error) {
      return { status: 'error', message: mapPurchaseError(error) };
    }
    const checkedAt = new Date().toISOString();
    const result = mapRestoreResult(customerInfo);
    if (result.restored) {
      return { status: 'restored', message: result.message, checkedAt };
    }
    return { status: 'none', message: result.message, checkedAt };
  } catch (error) {
    return {
      status: 'error',
      message: mapPurchaseError(error as PurchaseErrorLike),
    };
  } finally {
    params.guard?.end();
  }
}
