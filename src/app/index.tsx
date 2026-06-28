import { Redirect } from 'expo-router';

import LoadingScreen from '../components/LoadingScreen';
import { ROUTES } from '../constants/routes';
import { useAppHydration } from '../hooks/use-app-hydration';
import { resolveStartRoute } from '../lib/authFlow';
import { useAuthPreferenceStore } from '../store/authPreferenceStore';
import { useAuthStore } from '../store/authStore';
import { useOnboardingStore } from '../store/onboardingStore';

export default function Index() {
  const hydrated = useAppHydration();

  const isInitializing = useAuthStore((state) => state.isInitializing);
  const session = useAuthStore((state) => state.session);

  const hasCompletedOnboarding = useOnboardingStore(
    (state) => state.hasCompletedOnboarding
  );
  const hasChosenGuest = useAuthPreferenceStore(
    (state) => state.hasChosenGuest
  );

  const route = resolveStartRoute({
    hydrated,
    isInitializing,
    hasCompletedOnboarding,
    hasSession: Boolean(session),
    hasChosenGuest,
  });

  switch (route) {
    case 'loading':
      return <LoadingScreen />;
    case 'onboarding':
      return <Redirect href={ROUTES.onboardingStart} />;
    case 'app':
      return <Redirect href={ROUTES.tabsAtividade} />;
    case 'welcome':
    default:
      return <Redirect href={ROUTES.authWelcome} />;
  }
}
