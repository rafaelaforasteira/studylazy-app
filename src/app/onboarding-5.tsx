import QuestionScreen from '../components/QuestionScreen';

export default function OnboardingFiveScreen() {
  return (
    <QuestionScreen
      progress={50}
      title="Como você conheceu o StudyLazy?"
      subtitle="Queremos saber como você chegou até aqui"
      storeKey="acquisitionChannel"
      nextRoute="/onboarding-6"
      options={[
        { label: 'Youtube', value: 'youtube' },
        { label: 'Google', value: 'google' },
        { label: 'TikTok', value: 'tiktok' },
        { label: 'Anúncios', value: 'ads' },
        { label: 'Influenciadores', value: 'influencers' },
        { label: 'Amigos ou Família', value: 'friends-family' },
      ]}
    />
  );
}