import { useState } from 'react';
import { useRouter } from 'expo-router';

import OnboardingLayout from './OnboardingLayout';
import OnboardingOption from './OnboardingOption';

import { useOnboardingStore } from '../store/onboardingStore';

// Tipo de cada opção
type Option = {
  label: string;
  value: string;
  description?: string;
};

// Props do componente
type QuestionScreenProps = {
  progress: number;
  title: string;
  subtitle: string;

  // Qual chave da store será salva
  storeKey:
    | 'journey'
    | 'goal'
    | 'studyTime'
    | 'preparationLevel'
    | 'acquisitionChannel'
    | 'dailyGoal'
    | 'notifications'
    | 'startPreference';

  // Próxima rota
  nextRoute: string;

  // Lista de opções
  options: Option[];
};

export default function QuestionScreen({
  progress,
  title,
  subtitle,
  storeKey,
  nextRoute,
  options,
}: QuestionScreenProps) {
  // Controle de navegação
  const router = useRouter();

  // Opção selecionada na tela
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Função que salva respostas na store
  const setAnswer = useOnboardingStore((state) => state.setAnswer);

  // Função chamada ao clicar em continuar
  function handleContinue() {
    if (!selectedOption) return;

    // Salvamos a resposta
    setAnswer(storeKey, selectedOption);

    // Navegamos para próxima tela
    router.push(nextRoute as any);
  }

  return (
    <OnboardingLayout
      progress={progress}
      title={title}
      subtitle={subtitle}
      onContinue={handleContinue}
      disabled={!selectedOption}
    >
      {/* Renderizamos todas as opções automaticamente */}
      {options.map((option) => (
        <OnboardingOption
          key={option.value}
          label={option.label}
          description={option.description}
          selected={selectedOption === option.value}
          onPress={() => setSelectedOption(option.value)}
        />
      ))}
    </OnboardingLayout>
  );
}