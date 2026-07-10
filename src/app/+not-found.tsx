import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import AppScreen from '../components/ui/AppScreen';
import PrimaryButton from '../components/ui/PrimaryButton';
import { colors } from '../constants/colors';
import { ROUTES } from '../constants/routes';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <AppScreen contentStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.title}>Página não encontrada</Text>
        <Text style={styles.subtitle}>
          O endereço que você abriu não existe nesta versão do StudyLazy.
        </Text>
      </View>
      <PrimaryButton
        label="Ir para o início"
        onPress={() => router.replace(ROUTES.tabsAtividade)}
      />
      <PrimaryButton
        label="Voltar"
        variant="secondary"
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          router.replace(ROUTES.tabsAtividade);
        }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', gap: spacing.xl },
  hero: { gap: spacing.sm, alignItems: 'center' },
  title: { color: colors.text.primary, ...typography.title, textAlign: 'center' },
  subtitle: {
    color: colors.text.secondary,
    ...typography.body,
    textAlign: 'center',
  },
});
