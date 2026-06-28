import QuestionScreen from '../components/QuestionScreen';

export default function OnboardingTwoScreen() {
  return (
    <QuestionScreen
      progress={20}
      title="Você quer estudar para..."
      subtitle="Seu objetivo nos ajuda a personalizar"
      storeKey="goal"
      nextRoute="/onboarding-3"
      options={[
        {
          label: 'Treinar',
          value: 'treinar',
        },
        {
          label: 'Entrar na faculdade',
          value: 'faculdade',
        },
        {
          label: 'Diversão',
          value: 'diversao',
        },
      ]}
    />
  );
}