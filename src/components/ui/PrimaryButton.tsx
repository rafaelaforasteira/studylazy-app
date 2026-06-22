import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { colors } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type PrimaryButtonProps = {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function PrimaryButton({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  onPress,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => {
        const baseStyles: StyleProp<ViewStyle> = [
          styles.base,
          styles[variant],
          isDisabled ? styles.disabled : null,
          pressed && !isDisabled ? styles.pressed : null,
          style,
        ];

        return baseStyles;
      }}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'secondary'
              ? colors.primary
              : colors.text.primary
          }
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'secondary' && styles.secondaryLabel,
            variant === 'danger' && styles.dangerLabel,
            isDisabled && styles.disabledLabel,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: spacing.touchTarget,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  primary: {
    backgroundColor: colors.primary,
  },

  secondary: {
    backgroundColor: colors.card.background,
    borderWidth: 1,
    borderColor: colors.border.default,
  },

  danger: {
    backgroundColor: colors.button.danger,
  },

  disabled: {
    backgroundColor: colors.button.disabled,
    borderColor: colors.button.disabled,
  },

  pressed: {
    opacity: 0.88,
  },

  label: {
    color: colors.background,
    ...typography.button,
  },

  secondaryLabel: {
    color: colors.primary,
  },

  dangerLabel: {
    color: colors.button.dangerText,
  },

  disabledLabel: {
    color: colors.text.muted,
  },
});
