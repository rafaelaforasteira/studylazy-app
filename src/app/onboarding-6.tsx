import QuestionScreen from '../components/QuestionScreen';

export default function OnboardingSixScreen() {
  return (
    <QuestionScreen
      progress={66}
      title="Qual será sua meta diária?"
      subtitle="Poucos minutos por dia vencem horas sem constância"
      storeKey="dailyGoal"
      nextRoute="/onboarding-7"
      options={[
        {
          label: '5 min/dia',
          description: 'Casual',
          value: '5min',
        },
        {
          label: '10 min/dia',
          description: 'Regular',
          value: '10min',
        },
        {
          label: '15 min/dia',
          description: 'Intensa',
          value: '15min',
        },
        {
          label: '20 min/dia',
          description: 'Puxada',
          value: '20min',
        },
      ]}
    />
  );
}