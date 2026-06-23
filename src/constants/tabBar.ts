import { spacing } from './spacing';

export const TAB_BAR_HEIGHT = 64;
export const TAB_BAR_CENTER_BUTTON_SIZE = 56;
export const TAB_BAR_CENTER_ELEVATION = 12;

export const tabBarMetrics = {
  height: TAB_BAR_HEIGHT,
  centerButtonSize: TAB_BAR_CENTER_BUTTON_SIZE,
  centerButtonOffset: -20,
  bottomPadding: spacing.sm,
  labelSize: 11,
};

export type TabRouteName =
  | 'atividade'
  | 'plano'
  | 'estudar'
  | 'revisar'
  | 'voce';

export const TAB_CONFIG: Record<
  TabRouteName,
  { label: string; accessibilityLabel: string }
> = {
  atividade: {
    label: 'Atividade',
    accessibilityLabel: 'Aba Atividade',
  },
  plano: {
    label: 'Plano',
    accessibilityLabel: 'Aba Plano',
  },
  estudar: {
    label: 'Estudar',
    accessibilityLabel: 'Aba Estudar',
  },
  revisar: {
    label: 'Revisar',
    accessibilityLabel: 'Aba Revisar',
  },
  voce: {
    label: 'Você',
    accessibilityLabel: 'Aba Você',
  },
};
