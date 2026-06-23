/**
 * Semantic color tokens for StudyLazy.
 * Legacy aliases (card, error, xp, etc.) keep older screens working.
 */
export const colors = {
  background: '#07080D',
  backgroundElevated: '#11131B',

  surface: '#11131B',
  surfaceSecondary: '#171A24',
  surfaceTertiary: '#1D2130',

  primary: '#8B5CF6',
  primarySoft: '#D3C6FF',
  primaryMuted: '#6D28D9',

  progress: '#2DD4FF',
  success: '#B6FF4A',
  streak: '#FF5D3B',
  warning: '#FFB84D',
  danger: '#FF5678',

  text: {
    primary: '#F7F8FC',
    secondary: '#9297A8',
    muted: '#6B7080',
  },

  border: {
    default: 'rgba(255,255,255,0.08)',
    selected: '#8B5CF6',
    subtle: 'rgba(255,255,255,0.05)',
  },

  card: {
    background: '#11131B',
    elevated: '#171A24',
    selected: '#1D2130',
  },

  successTone: {
    main: '#B6FF4A',
    background: 'rgba(182, 255, 74, 0.12)',
    border: 'rgba(182, 255, 74, 0.35)',
  },

  error: {
    main: '#FF5678',
    background: 'rgba(255, 86, 120, 0.12)',
    border: 'rgba(255, 86, 120, 0.35)',
  },

  warningTone: {
    main: '#FFB84D',
    background: 'rgba(255, 184, 77, 0.12)',
    border: 'rgba(255, 184, 77, 0.35)',
  },

  xp: '#FFB84D',

  button: {
    disabled: '#1D2130',
    danger: '#FF5678',
    dangerText: '#FFFFFF',
  },

  overlay: 'rgba(7, 8, 13, 0.72)',

  tabBar: {
    background: '#11131B',
    active: '#8B5CF6',
    inactive: '#9297A8',
    centerGlow: 'rgba(139, 92, 246, 0.45)',
  },
};
