import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';

type OnboardingOptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  description?: string;
};

export default function OnboardingOption({
  label,
  selected,
  onPress,
  description,
}: OnboardingOptionProps) {
  return (
    <TouchableOpacity
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>

      {description && <Text style={styles.description}>{description}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: {
    backgroundColor: colors.card.background,
    borderWidth: 2,
    borderColor: colors.border.default,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginBottom: 16,
  },
  optionSelected: {
    borderColor: colors.border.selected,
    backgroundColor: colors.card.selected,
  },
  label: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '700',
  },
  labelSelected: {
    color: colors.primary,
  },
  description: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: 4,
  },
});