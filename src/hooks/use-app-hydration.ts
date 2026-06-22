import { useSyncExternalStore } from 'react';

import { useMistakeStore } from '../store/mistakeStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { useProfileStore } from '../store/profileStore';
import { useStudyProgressStore } from '../store/studyProgressStore';

const persistedStores = [
  useOnboardingStore,
  useProfileStore,
  useStudyProgressStore,
  useMistakeStore,
] as const;

function areStoresHydrated() {
  return persistedStores.every((store) => store.persist.hasHydrated());
}

function subscribe(onStoreChange: () => void) {
  const unsubscribers = persistedStores.map((store) =>
    store.persist.onFinishHydration(onStoreChange)
  );

  return () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  };
}

export function useAppHydration() {
  return useSyncExternalStore(
    subscribe,
    areStoresHydrated,
    () => false
  );
}
