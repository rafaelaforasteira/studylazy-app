import { Redirect, Stack, useSegments } from 'expo-router';

import LoadingScreen from '../../components/LoadingScreen';
import { ROUTES } from '../../constants/routes';
import { useAuthStore } from '../../store/authStore';

export default function AuthLayout() {
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const session = useAuthStore((state) => state.session);
  const segments = useSegments();

  // A redefinição de senha cria uma sessão de recuperação: o usuário PRECISA
  // permanecer nesta tela para definir a nova senha (não redirecionar).
  const isResetPassword = (segments as string[]).includes('reset-password');

  // Não redireciona enquanto a sessão inicializa (evita piscar / loop).
  if (isInitializing) {
    return <LoadingScreen />;
  }

  // Usuário autenticado não deve ficar preso nas telas de auth (exceto reset).
  if (session && !isResetPassword) {
    return <Redirect href={ROUTES.tabsAtividade} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
