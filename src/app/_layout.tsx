import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoadingScreen from '../components/LoadingScreen';
import { useAppHydration } from '../hooks/use-app-hydration';
import { useFeedbackSync } from '../hooks/use-feedback-sync';
import { useProgressSync } from '../hooks/use-progress-sync';
import { useAuthStore } from '../store/authStore';

function RootNavigator() {
  const hydrated = useAppHydration();

  useEffect(() => {
    // Restaura/inicializa a sessão Supabase ao abrir o app. Idempotente:
    // chamadas repetidas são ignoradas pelo controlador de inicialização.
    void useAuthStore.getState().initializeAuth();
  }, []);

  // Liga a sincronização de progresso offline-first (não bloqueia a UI).
  useProgressSync();
  // Feedback/NPS em canal separado — nunca mistura com sync de progresso.
  useFeedbackSync();

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
