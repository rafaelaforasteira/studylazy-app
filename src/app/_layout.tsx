import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoadingScreen from '../components/LoadingScreen';
import { useAppHydration } from '../hooks/use-app-hydration';

function RootNavigator() {
  const hydrated = useAppHydration();

  if (!hydrated) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
