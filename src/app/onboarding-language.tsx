import { useState } from 'react';
import { useRouter } from 'expo-router';

import OnboardingLayout from '../components/OnboardingLayout';
import OnboardingOption from '../components/OnboardingOption';

import { useProfileStore } from '../store/profileStore';
import type { ForeignLanguagePreference } from '../data/questionTypes';

export default function OnboardingLanguageScreen() {
  const router = useRouter();

  const setForeignLanguage = useProfileStore(
    (state) => state.setForeignLanguage
  );

  const [selected, setSelected] =
    useState<ForeignLanguagePreference | null>(null);

  function handleContinue() {
    if (!selected) return;

    setForeignLanguage(selected);
    router.push('/onboarding-9');
  }

  return (
    <OnboardingLayout
      progress={90}
      title="Qual língua estrangeira você quer estudar?"
      subtitle="Você poderá trocar depois nas configurações"
      onContinue={handleContinue}
      disabled={!selected}
    >
      <OnboardingOption
        label="Inglês"
        selected={selected === 'english'}
        onPress={() => setSelected('english')}
      />

      <OnboardingOption
        label="Espanhol"
        selected={selected === 'spanish'}
        onPress={() => setSelected('spanish')}
      />
    </OnboardingLayout>
  );
}
