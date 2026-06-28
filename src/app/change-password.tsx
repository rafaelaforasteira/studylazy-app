import { Redirect, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppScreen from '../components/ui/AppScreen';
import LoadingScreen from '../components/LoadingScreen';
import PrimaryButton from '../components/ui/PrimaryButton';
import TextField from '../components/ui/TextField';
import { colors } from '../constants/colors';
import { ROUTES } from '../constants/routes';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { completePasswordUpdate } from '../lib/accountSecurity';
import { MIN_PASSWORD_LENGTH } from '../lib/authValidation';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const session = useAuthStore((state) => state.session);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const submitLockRef = useRef(false);

  if (isInitializing) {
    return <LoadingScreen />;
  }

  // Recurso exclusivo de usuário autenticado.
  if (!session) {
    return <Redirect href={ROUTES.authLogin} />;
  }

  async function handleSubmit() {
    if (isSubmitting || submitLockRef.current) {
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setLocalError(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('As senhas não coincidem.');
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    setLocalError(null);
    setServerError(null);

    const result = await completePasswordUpdate(
      supabase?.auth,
      password,
      confirmPassword
    );

    submitLockRef.current = false;
    setIsSubmitting(false);

    if (result.status === 'error') {
      setServerError(result.error);
      return;
    }
    setPassword('');
    setConfirmPassword('');
    setDone(true);
  }

  const errorText = localError ?? serverError;

  return (
    <AppScreen keyboard contentStyle={styles.content}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.settings))}
        hitSlop={8}
        style={styles.backButton}
      >
        <Text style={styles.backText}>‹ Voltar</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Alterar senha</Text>
        <Text style={styles.subtitle}>
          Defina uma nova senha para a sua conta. Use pelo menos{' '}
          {MIN_PASSWORD_LENGTH} caracteres.
        </Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="Nova senha"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (localError) setLocalError(null);
            if (serverError) setServerError(null);
            if (done) setDone(false);
          }}
          secureTextEntry
          autoCapitalize="none"
          textContentType="newPassword"
          placeholder="Nova senha"
          returnKeyType="next"
        />

        <TextField
          label="Confirmar nova senha"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (localError) setLocalError(null);
          }}
          secureTextEntry
          autoCapitalize="none"
          textContentType="newPassword"
          placeholder="Repita a nova senha"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        {errorText ? <Text style={styles.errorBanner}>{errorText}</Text> : null}
        {done ? (
          <Text style={styles.successBanner}>Senha alterada com sucesso.</Text>
        ) : null}

        <PrimaryButton
          label="Salvar nova senha"
          loading={isSubmitting}
          disabled={isSubmitting}
          onPress={handleSubmit}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl },
  backButton: { alignSelf: 'flex-start' },
  backText: { color: colors.text.secondary, ...typography.body, fontWeight: '600' },
  header: { gap: spacing.sm },
  title: { color: colors.text.primary, ...typography.title },
  subtitle: { color: colors.text.secondary, ...typography.body },
  form: { gap: spacing.lg },
  errorBanner: { color: colors.error.main, ...typography.bodySmall },
  successBanner: { color: colors.successTone.main, ...typography.bodySmall },
});
