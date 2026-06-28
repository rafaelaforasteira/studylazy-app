import { Redirect, Stack } from 'expo-router';

import LoadingScreen from '../../components/LoadingScreen';
import { ROUTES } from '../../constants/routes';
import { useAuthStore } from '../../store/authStore';

export default function AuthLayout() {
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const session = useAuthStore((state) => state.session);

  // Não redireciona enquanto a sessão inicializa (evita piscar / loop).
  if (isInitializing) {
    return <LoadingScreen />;
  }

  // Usuário autenticado não deve ficar preso nas telas de auth.
  if (session) {
    return <Redirect href={ROUTES.tabsAtividade} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
