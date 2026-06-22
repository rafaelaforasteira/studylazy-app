import { Redirect } from 'expo-router';

import LoadingScreen from '../components/LoadingScreen';
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
    return <Redirect href="/dashboard" />;
  }

  return <Redirect href="/onboarding-1" />;
}
