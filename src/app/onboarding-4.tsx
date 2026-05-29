import QuestionScreen from '../components/QuestionScreen';

export default function OnboardingFourScreen() {
  return (
    <QuestionScreen
      progress={44}
      title="Hoje, você se sente:"
      subtitle="Seja honesto, isso ajuda a calibrar seu plano"
      storeKey="preparationLevel"
      nextRoute="/onboarding-5"
      options={[
        {
          label: '😬 Nada preparado',
          value: 'nada-preparado',
        },
        {
          label: '🙂 Um pouco! Estudo em casa',
          value: 'estudo-casa',
        },
        {
          label: '😎 Bastante! Faço cursinho',
          value: 'cursinho',
        },
      ]}
    />
  );
}