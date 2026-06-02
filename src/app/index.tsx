import { Redirect } from 'expo-router';

import { useOnboardingStore } from '../store/onboardingStore';

export default function Index() {
  const hasCompletedOnboarding = useOnboardingStore(
    (state) => state.hasCompletedOnboarding
  );

  if (hasCompletedOnboarding) {
    return <Redirect href="/dashboard" />;
  }

  return <Redirect href="/onboarding-1" />;
}