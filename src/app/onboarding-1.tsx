import { useState } from 'react';
import { useRouter } from 'expo-router';

import OnboardingLayout from '../components/OnboardingLayout';
import OnboardingOption from '../components/OnboardingOption';

import { useOnboardingStore } from '../store/onboardingStore';

export default function OnboardingOneScreen() {
  const router = useRouter();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Pegamos a função que salva respostas
  const setAnswer = useOnboardingStore((state) => state.setAnswer);

  function handleContinue() {
    if (!selectedOption) return;

    // Salvamos a resposta do usuário
    setAnswer('journey', selectedOption);

    // Vamos para a próxima tela
    router.push('/onboarding-2');
  }

  return (
    <OnboardingLayout
      progress={10}
      title="Eu quero estudar para..."
      subtitle="Isso nos ajuda a entender sua jornada"
      onContinue={handleContinue}
      disabled={!selectedOption}
    >
      <OnboardingOption
        label="Meu primeiro ENEM"
        selected={selectedOption === 'primeiro-enem'}
        onPress={() => setSelectedOption('primeiro-enem')}
      />

      <OnboardingOption
        label="Já tentei antes"
        selected={selectedOption === 'ja-tentei'}
        onPress={() => setSelectedOption('ja-tentei')}
      />
    </OnboardingLayout>
  );
}