import { useMemo } from 'react';

import type { EntitlementState } from '../entitlements/types';
import { resolveEntitlementState } from '../entitlements/entitlementLogic';
import { useEntitlementStore } from '../entitlements/entitlementStore';

export function useEntitlements(): EntitlementState {
  const plan = useEntitlementStore((state) => state.plan);
  const source = useEntitlementStore((state) => state.source);
  const devProEnabled = useEntitlementStore((state) => state.devProEnabled);

  return useMemo(
    () =>
      resolveEntitlementState({
        plan,
        source,
        devProEnabled,
      }),
    [plan, source, devProEnabled]
  );
}
