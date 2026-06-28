import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import AppScreen from '../../components/ui/AppScreen';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { colors } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { useAuthPreferenceStore } from '../../store/authPreferenceStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const setChoseGuest = useAuthPreferenceStore((state) => state.setChoseGuest);

  function handleContinueAsGuest() {
    // Registra a escolha para não exibir esta tela a cada abertura.
    setChoseGuest(true);
    router.replace(ROUTES.tabsAtividade);
  }

  return (
    <AppScreen contentStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>SL</Text>
        </View>
        <Text style={styles.title}>Bem-vindo ao StudyLazy</Text>
        <Text style={styles.subtitle}>
          Crie sua conta para preparar a sincronização do seu progresso — ou
          continue estudando sem conta agora mesmo.
        </Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Criar conta"
          onPress={() => router.push(ROUTES.authRegister)}
        />
        <PrimaryButton
          label="Entrar"
          variant="secondary"
          onPress={() => router.push(ROUTES.authLogin)}
        />
        <PrimaryButton
          label="Continuar sem conta"
          variant="secondary"
          onPress={handleContinueAsGuest}
          style={styles.guestButton}
        />
      </View>

      <Text style={styles.disclaimer}>
        Você pode criar uma conta depois, em Você ou Configurações. Seu
        progresso local continua salvo neste dispositivo.
      </Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    gap: spacing.xl,
  },

  hero: {
    alignItems: 'center',
    gap: spacing.md,
  },

  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  logoText: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: '900',
  },

  title: {
    color: colors.text.primary,
    ...typography.title,
    textAlign: 'center',
  },

  subtitle: {
    color: colors.text.secondary,
    ...typography.body,
    textAlign: 'center',
  },

  actions: {
    gap: spacing.md,
  },

  guestButton: {
    backgroundColor: 'transparent',
    borderColor: colors.border.subtle,
  },

  disclaimer: {
    color: colors.text.muted,
    ...typography.bodySmall,
    textAlign: 'center',
  },
});
