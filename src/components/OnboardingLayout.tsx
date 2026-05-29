import { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

type OnboardingLayoutProps = {
  progress: number;
  title: string;
  subtitle: string;
  children: ReactNode;
  buttonText?: string;
  onContinue: () => void;
  disabled?: boolean;
};

export default function OnboardingLayout({
  progress,
  title,
  subtitle,
  children,
  buttonText = 'Continuar',
  onContinue,
  disabled = false,
}: OnboardingLayoutProps) {
  return (
    <View style={styles.container}>
      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {children}
      </View>

      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onContinue}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.screenTop,
    paddingBottom: spacing.screenBottom,
    justifyContent: 'space-between',
  },
  progressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: colors.card.background,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  content: {
    flex: 1,
    marginTop: spacing.xxl,
  },
  title: {
    color: colors.text.primary,
    ...typography.title,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.text.secondary,
    ...typography.subtitle,
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.button.disabled,
  },
  buttonText: {
    color: colors.background,
    ...typography.button,
  },
});