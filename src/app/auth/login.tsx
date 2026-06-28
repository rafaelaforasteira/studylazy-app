import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppScreen from '../../components/ui/AppScreen';
import PrimaryButton from '../../components/ui/PrimaryButton';
import TextField from '../../components/ui/TextField';
import { colors } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { validateLoginForm } from '../../lib/authValidation';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const router = useRouter();

  const signIn = useAuthStore((state) => state.signIn);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const serverError = useAuthStore((state) => state.error);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  async function handleSubmit() {
    if (isSubmitting || submitLockRef.current) {
      return;
    }

    const validation = validateLoginForm(email, password);
    if (!validation.ok) {
      setLocalError(validation.error);
      return;
    }

    submitLockRef.current = true;
    setLocalError(null);
    clearAuthError();

    const success = await signIn(email, password);
    submitLockRef.current = false;

    if (success) {
      router.replace(ROUTES.tabsAtividade);
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
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.subtitle}>
          Acesse sua conta StudyLazy com e-mail e senha.
        </Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="E-mail"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (localError) setLocalError(null);
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
            if (localError) setLocalError(null);
          }}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          textContentType="password"
          placeholder="Sua senha"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        {errorText ? <Text style={styles.errorBanner}>{errorText}</Text> : null}

        <PrimaryButton
          label="Entrar"
          loading={isSubmitting}
          disabled={isSubmitting}
          onPress={handleSubmit}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Ainda não tem conta?</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Criar conta"
          onPress={() => router.replace(ROUTES.authRegister)}
        >
          <Text style={styles.footerLink}>Criar conta</Text>
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
