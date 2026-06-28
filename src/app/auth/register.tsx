import { type Href, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppScreen from '../../components/ui/AppScreen';
import PrimaryButton from '../../components/ui/PrimaryButton';
import TextField from '../../components/ui/TextField';
import { colors } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { validateRegisterForm } from '../../lib/authValidation';
import { useAuthStore } from '../../store/authStore';

export default function RegisterScreen() {
  const router = useRouter();

  const signUp = useAuthStore((state) => state.signUp);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const serverError = useAuthStore((state) => state.error);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const submitLockRef = useRef(false);

  useEffect(() => {
    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(ROUTES.authWelcome);
    }
  }

  function clearErrors() {
    if (localError) setLocalError(null);
  }

  async function handleSubmit() {
    if (isSubmitting || submitLockRef.current) {
      return;
    }

    const validation = validateRegisterForm({
      name,
      email,
      password,
      confirmPassword,
    });
    if (!validation.ok) {
      setLocalError(validation.error);
      return;
    }

    submitLockRef.current = true;
    setLocalError(null);
    clearAuthError();

    const result = await signUp(name, email, password, confirmPassword);
    submitLockRef.current = false;

    if (result.status === 'authenticated') {
      router.replace(ROUTES.tabsAtividade);
    } else if (result.status === 'confirmation_required') {
      router.replace(
        `/auth/check-email?email=${encodeURIComponent(result.email)}` as Href
      );
    }
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
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>
          É rápido. Seu progresso local continua salvo neste dispositivo.
        </Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="Nome"
          value={name}
          onChangeText={(text) => {
            setName(text);
            clearErrors();
          }}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          placeholder="Como devemos te chamar?"
          returnKeyType="next"
        />

        <TextField
          label="E-mail"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            clearErrors();
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          textContentType="emailAddress"
          placeholder="voce@email.com"
          returnKeyType="next"
        />

        <TextField
          label="Senha"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            clearErrors();
          }}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password-new"
          textContentType="newPassword"
          placeholder="Mínimo de 8 caracteres"
          returnKeyType="next"
        />

        <TextField
          label="Confirmar senha"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            clearErrors();
          }}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password-new"
          textContentType="newPassword"
          placeholder="Repita a senha"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        {errorText ? <Text style={styles.errorBanner}>{errorText}</Text> : null}

        <PrimaryButton
          label="Criar conta"
          loading={isSubmitting}
          disabled={isSubmitting}
          onPress={handleSubmit}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Já tem conta?</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Entrar"
          onPress={() => router.replace(ROUTES.authLogin)}
        >
          <Text style={styles.footerLink}>Entrar</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
  },

  backButton: {
    alignSelf: 'flex-start',
  },

  backText: {
    color: colors.text.secondary,
    ...typography.body,
    fontWeight: '600',
  },

  header: {
    gap: spacing.sm,
  },

  title: {
    color: colors.text.primary,
    ...typography.title,
  },

  subtitle: {
    color: colors.text.secondary,
    ...typography.body,
  },

  form: {
    gap: spacing.lg,
  },

  errorBanner: {
    color: colors.error.main,
    ...typography.bodySmall,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },

  footerText: {
    color: colors.text.secondary,
    ...typography.body,
  },

  footerLink: {
    color: colors.primarySoft,
    ...typography.body,
    fontWeight: '700',
  },
});
