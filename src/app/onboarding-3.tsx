import QuestionScreen from '../components/QuestionScreen';

export default function OnboardingThreeScreen() {
  return (
    <QuestionScreen
      progress={30}
      title="Quanto tempo você pode estudar por dia?"
      subtitle="Isso nos ajuda a montar seu plano ideal"
      storeKey="studyTime"
      nextRoute="/onboarding-4"
      options={[
        {
          label: 'Até 30 minutos',
          value: '30min',
        },
        {
          label: '1 hora',
          value: '1hora',
        },
        {
          label: '2 horas',
          value: '2horas',
        },
        {
          label: '3 horas ou mais',
          value: '3horas+',
        },
      ]}
    />
  );
}