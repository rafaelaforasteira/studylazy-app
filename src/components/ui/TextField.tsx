import { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type TextFieldProps = TextInputProps & {
  label: string;
  errorText?: string;
};

const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, errorText, style, ...inputProps },
  ref
) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.text.muted}
        style={[styles.input, errorText ? styles.inputError : null, style]}
        {...inputProps}
      />
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </View>
  );
});

export default TextField;

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },

  label: {
    color: colors.text.secondary,
    ...typography.label,
  },

  input: {
    minHeight: spacing.touchTarget,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    ...typography.body,
  },

  inputError: {
    borderColor: colors.error.border,
  },

  errorText: {
    color: colors.error.main,
    ...typography.bodySmall,
  },
});
