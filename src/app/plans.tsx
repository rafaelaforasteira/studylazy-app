import { Alert, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

import AppCard from '../components/ui/AppCard';
import AppScreen from '../components/ui/AppScreen';
import PrimaryButton from '../components/ui/PrimaryButton';

import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

const FREE_FEATURES = [
  'Plano diário personalizado',
  'Sessões de estudo com questões',
  'XP, níveis e sequência',
  'Revisão de erros',
  'Histórico local de lições',
];

const PRO_FEATURES = [
  'Estatísticas avançadas',
  'Plano adaptativo',
  'Mais personalização',
  'Sincronização em nuvem',
  'Relatórios completos',
  'Banco ampliado de questões',
];

export default function PlansScreen() {
  const router = useRouter();

  function handleNotify() {
    Alert.alert(
      'Em breve',
      'O StudyLazy Pro ainda está em desenvolvimento. Avisaremos quando estiver disponível.'
    );
  }

  return (
    <AppScreen>
      <Text style={styles.title}>StudyLazy Pro</Text>
      <Text style={styles.subtitle}>
        Conheça o que está disponível hoje e o que virá na próxima fase.
      </Text>

      <AppCard title="Versão gratuita atual">
        {FREE_FEATURES.map((feature) => (
          <Text key={feature} style={styles.item}>
            • {feature}
          </Text>
        ))}
      </AppCard>

      <AppCard title="Proposta StudyLazy Pro">
        <Text style={styles.notice}>
          Recurso em desenvolvimento. Não há pagamento nem assinatura ativa
          nesta versão.
        </Text>

        {PRO_FEATURES.map((feature) => (
          <Text key={feature} style={styles.item}>
            • {feature}
          </Text>
        ))}
      </AppCard>

      <PrimaryButton label="Em breve" onPress={handleNotify} />

      <PrimaryButton
        label="Voltar"
        variant="secondary"
        onPress={() => router.back()}
        style={styles.back}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text.primary,
    ...typography.title,
    marginBottom: spacing.sm,
  },

  subtitle: {
    color: colors.text.secondary,
    ...typography.body,
    marginBottom: spacing.lg,
  },

  item: {
    color: colors.text.secondary,
    ...typography.body,
    marginBottom: spacing.xs,
  },

  notice: {
    color: colors.warning,
    ...typography.bodySmall,
    marginBottom: spacing.md,
  },

  back: {
    marginTop: spacing.sm,
  },
});
