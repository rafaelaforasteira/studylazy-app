import QuestionScreen from '../components/QuestionScreen';

export default function OnboardingNineScreen() {
  return (
    <QuestionScreen
      progress={100}
      title="O que você prefere fazer?"
      subtitle="Escolha como quer começar sua jornada"
      storeKey="startPreference"
      nextRoute="/generating-plan"
      options={[
        {
          label: 'Plano de estudos personalizado',
          description: 'Em breve',
          value: 'personalized-plan',
        },
        {
          label: 'Começar a estudar do zero',
          description: 'Recomendado',
          value: 'start-now',
        },
      ]}
    />
  );
}