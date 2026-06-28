import { useRouter } from 'expo-router';

import OnboardingLayout from '../components/OnboardingLayout';

export default function OnboardingSevenScreen() {
  const router = useRouter();

  return (
    <OnboardingLayout
      progress={70}
      title="Em breve você vai conquistar a aprovação que tanto sonha"
      subtitle="Estamos aqui para te ajudar nessa jornada 💪"
      onContinue={() => router.push('/onboarding-8')}
    >
      <></>
    </OnboardingLayout>
  );
}