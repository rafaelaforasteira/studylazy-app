import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppScreen from '../../components/ui/AppScreen';
import PrimaryButton from '../../components/ui/PrimaryButton';
import TextField from '../../components/ui/TextField';
import { colors } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { requestPasswordReset } from '../../lib/accountSecurity';
import { isValidEmail } from '../../lib/authValidation';
import { supabase } from '../../lib/supabase';

/** Deep link de recuperação: studylazy://auth/reset-password. */
export function getResetPasswordRedirectUrl(): string {
  return Linking.createURL('/auth/reset-password');
}

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const submitLockRef = useRef(false);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(ROUTES.authLogin);
    }
  }

  async function handleSubmit() {
    if (isSubmitting || submitLockRef.current) {
      return;
    }
    if (!isValidEmail(email)) {
      setLocalError('Informe um e-mail válido.');
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    setLocalError(null);
    setServerError(null);

    const result = await requestPasswordReset(
      supabase?.auth,
      email,
      getResetPasswordRedirectUrl()
    );

    submitLockRef.current = false;
    setIsSubmitting(false);

    if (result.status === 'error') {
      setServerError(result.error);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AppScreen contentStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconBadge}>
            <Text style={styles.iconText}>✉</Text>
          </View>
          <Text style={styles.title}>Verifique seu e-mail</Text>
          <Text style={styles.helper}>
            Se houver uma conta para {email || 'este e-mail'}, enviamos um link
            para redefinir a senha. Abra o link neste aparelho para continuar.
          </Text>
          <Text style={styles.helperMuted}>
            Não recebeu? Verifique a caixa de spam ou tente novamente em alguns
            minutos.
          </Text>
        </View>
        <View style={styles.actions}>
          <PrimaryButton
            label="Voltar para o login"
            onPress={() => router.replace(ROUTES.authLogin)}
          />
        </View>
      </AppScreen>
    );
  }

  const errorText = localError ?? serverError;

  return (
    <AppScreen keyboard contentStyle={styles.content}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={handleBack}
        hitSlop={8}
        style={styles.backButton}
      >
        <Text style={styles.backText}>‹ Voltar</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Esqueci minha senha</Text>
        <Text style={styles.subtitle}>
          Informe o e-mail da sua conta. Enviaremos um link seguro para você
          criar uma nova senha.
        </Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="E-mail"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (localError) setLocalError(null);
            if (serverError) setServerError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          textContentType="emailAddress"
          placeholder="voce@email.com"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        {errorText ? <Text style={styles.errorBanner}>{errorText}</Text> : null}

        <PrimaryButton
          label="Enviar link de recuperação"
          loading={isSubmitting}
          disabled={isSubmitting}
          onPress={handleSubmit}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, justifyContent: 'center' },
  backButton: { alignSelf: 'flex-start' },
  backText: { color: colors.text.secondary, ...typography.body, fontWeight: '600' },
  header: { gap: spacing.sm },
  title: { color: colors.text.primary, ...typography.title },
  subtitle: { color: colors.text.secondary, ...typography.body },
  form: { gap: spacing.lg },
  errorBanner: { color: colors.error.main, ...typography.bodySmall },
  hero: { alignItems: 'center', gap: spacing.sm },
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
  iconText: { fontSize: 32 },
  helper: {
    color: colors.text.secondary,
    ...typography.body,
    textAlign: 'center',
  },
  helperMuted: {
    color: colors.text.muted,
    ...typography.bodySmall,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  actions: { gap: spacing.md },
});
