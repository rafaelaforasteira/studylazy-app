import { Redirect } from 'expo-router';

import LoadingScreen from '../components/LoadingScreen';
import { ROUTES } from '../constants/routes';
import { useAppHydration } from '../hooks/use-app-hydration';
import { useOnboardingStore } from '../store/onboardingStore';

export default function Index() {
  const hydrated = useAppHydration();

  const hasCompletedOnboarding = useOnboardingStore(
    (state) => state.hasCompletedOnboarding
  );

  if (!hydrated) {
    return <LoadingScreen />;
  }

  if (hasCompletedOnboarding) {
    return <Redirect href={ROUTES.tabsAtividade} />;
  }

  return <Redirect href={ROUTES.onboardingStart} />;
}
