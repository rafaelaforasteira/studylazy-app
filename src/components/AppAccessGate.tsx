import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import LoadingScreen from '../components/LoadingScreen';
import { ROUTES } from '../constants/routes';
import { useAppHydration } from '../hooks/use-app-hydration';
import { useAuthPreferenceStore } from '../store/authPreferenceStore';
import { useAuthStore } from '../store/authStore';
import { useOnboardingStore } from '../store/onboardingStore';

/**
 * Impede acesso direto às abas sem onboarding ou escolha de conta/convidado.
 * Corrige deep links que pulavam o fluxo inicial.
 */
export function AppAccessGate({ children }: { children: ReactNode }) {
  const hydrated = useAppHydration();
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const session = useAuthStore((state) => state.session);
  const hasCompletedOnboarding = useOnboardingStore(
    (state) => state.hasCompletedOnboarding
  );
  const hasChosenGuest = useAuthPreferenceStore(
    (state) => state.hasChosenGuest
  );

  if (!hydrated || isInitializing) {
    return <LoadingScreen />;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href={ROUTES.onboardingStart} />;
  }

  if (!session && !hasChosenGuest) {
    return <Redirect href={ROUTES.authWelcome} />;
  }

  return <>{children}</>;
}
