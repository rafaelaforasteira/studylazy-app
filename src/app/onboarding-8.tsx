import QuestionScreen from '../components/QuestionScreen';

export default function OnboardingEightScreen() {
  return (
    <QuestionScreen
      progress={80}
      title="Posso te lembrar de estudar?"
      subtitle="Notificações ajudam a manter a constância"
      storeKey="notifications"
      nextRoute="/onboarding-language"
      options={[
        {
          label: 'Permitir',
          value: 'allow',
        },
        {
          label: 'Bloquear',
          value: 'deny',
        },
      ]}
    />
  );
}