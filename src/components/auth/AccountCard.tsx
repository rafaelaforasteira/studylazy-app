import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { ROUTES } from '../../constants/routes';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { deriveDisplayName } from '../../lib/authFlow';
import { useAuthStore } from '../../store/authStore';
import PrimaryButton from '../ui/PrimaryButton';

type AccountCardProps = {
  /** Quando true, usa o estilo de "card" com fundo (tela Configurações). */
  framed?: boolean;
};

export default function AccountCard({ framed = false }: AccountCardProps) {
  const router = useRouter();

  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const signOut = useAuthStore((state) => state.signOut);

  function confirmSignOut() {
    Alert.alert(
      'Sair da conta?',
      'Você voltará ao modo convidado. Seu progresso, XP, sequência e erros continuam salvos neste dispositivo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            void signOut();
          },
        },
      ]
    );
  }

  const containerStyle = [styles.container, framed && styles.framed];

  if (session && user) {
    const displayName = deriveDisplayName(user, user.email);

    return (
      <View style={containerStyle}>
        <Text style={styles.eyebrow}>Conta</Text>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{user.email ?? '—'}</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>Conta ativa</Text>
        </View>
        <PrimaryButton
          label="Sair da conta"
          variant="secondary"
          loading={isSubmitting}
          disabled={isSubmitting}
          onPress={confirmSignOut}
          style={styles.action}
        />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Text style={styles.eyebrow}>Conta</Text>
      <Text style={styles.title}>
        Você está usando o StudyLazy como convidado
      </Text>
      <Text style={styles.description}>
        Crie uma conta para preparar a sincronização do seu progresso.
      </Text>
      <View style={styles.guestActions}>
        <PrimaryButton
          label="Criar conta"
          onPress={() => router.push(ROUTES.authRegister)}
        />
        <PrimaryButton
          label="Entrar"
          variant="secondary"
          onPress={() => router.push(ROUTES.authLogin)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  framed: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
  },

  eyebrow: {
    color: colors.primarySoft,
    ...typography.label,
    textTransform: 'uppercase',
  },

  title: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '800',
  },

  name: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '900',
  },

  email: {
    color: colors.text.secondary,
    ...typography.body,
  },

  description: {
    color: colors.text.secondary,
    ...typography.body,
  },

  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.successTone.background,
    borderColor: colors.successTone.border,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },

  statusText: {
    color: colors.successTone.main,
    ...typography.label,
  },

  guestActions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  action: {
    marginTop: spacing.sm,
  },
});
