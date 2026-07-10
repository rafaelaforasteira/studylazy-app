import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AppScreen from '../../components/ui/AppScreen';
import LoadingScreen from '../../components/LoadingScreen';
import PrimaryButton from '../../components/ui/PrimaryButton';
import TextField from '../../components/ui/TextField';
import { colors } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import {
  completePasswordUpdate,
  exchangeRecoveryCode,
  parseRecoveryParamsFromUrl,
} from '../../lib/accountSecurity';
import { MIN_PASSWORD_LENGTH } from '../../lib/authValidation';
import { supabase } from '../../lib/supabase';

type Phase = 'exchanging' | 'ready' | 'invalid' | 'done';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();
  const incomingUrl = Linking.useURL();

  const [phase, setPhase] = useState<Phase>('exchanging');
  const [invalidReason, setInvalidReason] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const exchangedRef = useRef(false);
  const submitLockRef = useRef(false);
  const waitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (exchangedRef.current) {
      return;
    }

    const fromParam = typeof params.code === 'string' ? params.code : null;
    const fromUrl = parseRecoveryParamsFromUrl(incomingUrl);
    const code = fromParam ?? fromUrl.code;

    // Sem código e sem erro: aguarda o deep link (cold start) com timeout.
    if (!code && !fromUrl.error) {
      if (!waitTimeoutRef.current) {
        waitTimeoutRef.current = setTimeout(() => {
          if (exchangedRef.current) {
            return;
          }
          exchangedRef.current = true;
          setInvalidReason(
            'Não recebemos um link válido. Abra o link no mesmo aparelho em que solicitou a recuperação ou peça um novo e-mail.'
          );
          setPhase('invalid');
        }, 8000);
      }
      return;
    }

    if (waitTimeoutRef.current) {
      clearTimeout(waitTimeoutRef.current);
      waitTimeoutRef.current = null;
    }

    exchangedRef.current = true;

    // Toda atualização de estado acontece dentro do callback assíncrono,
    // evitando setState síncrono no corpo do efeito.
    void (async () => {
      if (!code) {
        setInvalidReason(
          'Este link expirou ou já foi usado. Solicite um novo e-mail de recuperação.'
        );
        setPhase('invalid');
        return;
      }
      const result = await exchangeRecoveryCode(supabase?.auth, code);
      if (result.status === 'error') {
        setInvalidReason(result.error);
        setPhase('invalid');
        return;
      }
      setPhase('ready');
    })();
  }, [params.code, incomingUrl]);

  useEffect(() => {
    return () => {
      if (waitTimeoutRef.current) {
        clearTimeout(waitTimeoutRef.current);
      }
    };
  }, []);

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
    setPhase('done');
  }

  if (phase === 'exchanging') {
    return <LoadingScreen />;
  }

  if (phase === 'invalid') {
    return (
      <AppScreen contentStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Link inválido</Text>
          <Text style={styles.subtitle}>
            {invalidReason ??
              'Não foi possível validar o link de recuperação.'}
          </Text>
        </View>
        <PrimaryButton
          label="Solicitar novo link"
          onPress={() => router.replace(ROUTES.authForgotPassword)}
        />
        <PrimaryButton
          label="Voltar para o login"
          variant="secondary"
          onPress={() => router.replace(ROUTES.authLogin)}
        />
      </AppScreen>
    );
  }

  if (phase === 'done') {
    return (
      <AppScreen contentStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Senha redefinida</Text>
          <Text style={styles.subtitle}>
            Sua senha foi atualizada com sucesso. Você já está conectado.
          </Text>
        </View>
        <PrimaryButton
          label="Continuar"
          onPress={() => router.replace(ROUTES.tabsAtividade)}
        />
      </AppScreen>
    );
  }

  const errorText = localError ?? serverError;

  return (
    <AppScreen keyboard contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Criar nova senha</Text>
        <Text style={styles.subtitle}>
          Escolha uma nova senha para a sua conta. Use pelo menos{' '}
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
  content: { gap: spacing.xl, justifyContent: 'center' },
  header: { gap: spacing.sm },
  title: { color: colors.text.primary, ...typography.title },
  subtitle: { color: colors.text.secondary, ...typography.body },
  form: { gap: spacing.lg },
  errorBanner: { color: colors.error.main, ...typography.bodySmall },
});
