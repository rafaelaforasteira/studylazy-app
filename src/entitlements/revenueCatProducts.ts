/** Entitlement configurado no RevenueCat Dashboard. */
export const REVENUECAT_ENTITLEMENT_PRO = 'pro' as const;

/**
 * IDs de produto esperados (Google Play / App Store / RevenueCat).
 * Devem ser criados manualmente nas lojas antes de testar compra real.
 */
export const EXPECTED_PRODUCT_IDS = {
  monthly: 'studylazy_pro_monthly',
  annual: 'studylazy_pro_annual',
} as const;

export type ExpectedProductId =
  (typeof EXPECTED_PRODUCT_IDS)[keyof typeof EXPECTED_PRODUCT_IDS];
