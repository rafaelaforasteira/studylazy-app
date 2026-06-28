import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AppScreen from '../../components/ui/AppScreen';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { colors } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { mapAuthError } from '../../lib/authErrors';
import { supabase } from '../../lib/supabase';

export default function CheckEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === 'string' ? params.email : '';

  const [status, setStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const canResend = Boolean(supabase && email);

  async function handleResend() {
    if (!supabase || !email || isResending) {
      return;
    }
    setIsResending(true);
    setStatus(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) {
        setStatus(mapAuthError(error));
      } else {
        setStatus('E-mail reenviado. Verifique sua caixa de entrada.');
      }
    } catch (error) {
      setStatus(mapAuthError(error as { message?: string }));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AppScreen contentStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.iconBadge}>
          <Text style={styles.iconText}>✉</Text>
        </View>
        <Text style={styles.title}>Confirme seu e-mail</Text>
        <Text style={styles.subtitle}>
          Enviamos um link de confirmação para:
        </Text>
        <Text style={styles.email}>{email || 'seu e-mail'}</Text>
        <Text style={styles.helper}>
          Abra o link para ativar sua conta. Se não encontrar, verifique a
          caixa de spam ou lixo eletrônico.
        </Text>
      </View>

      {status ? <Text style={styles.status}>{status}</Text> : null}

      <View style={styles.actions}>
        {canResend ? (
          <PrimaryButton
            label="Reenviar e-mail"
            variant="secondary"
            loading={isResending}
            disabled={isResending}
            onPress={handleResend}
          />
        ) : null}
        <PrimaryButton
          label="Voltar para o login"
          onPress={() => router.replace(ROUTES.authLogin)}
        />
      </View>
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
    gap: spacing.sm,
  },

  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  iconText: {
    fontSize: 32,
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

  email: {
    color: colors.text.primary,
    ...typography.body,
    fontWeight: '800',
    textAlign: 'center',
  },

  helper: {
    color: colors.text.muted,
    ...typography.bodySmall,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  status: {
    color: colors.primarySoft,
    ...typography.bodySmall,
    textAlign: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  actions: {
    gap: spacing.md,
  },
});
