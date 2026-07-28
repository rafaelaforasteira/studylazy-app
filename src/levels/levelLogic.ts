/**
 * Lógica PURA de níveis por XP — testável no Node.
 */
import type {
  LevelThreshold,
  LevelUpResult,
  StudentLevelInfo,
} from './levelTypes';

export const LEVEL_THRESHOLDS: readonly LevelThreshold[] = [
  { level: 1, xpRequired: 0, name: 'Iniciante' },
  { level: 2, xpRequired: 100, name: 'Focado' },
  { level: 3, xpRequired: 250, name: 'Persistente' },
  { level: 4, xpRequired: 500, name: 'Treinando Forte' },
  { level: 5, xpRequired: 900, name: 'Estrategista' },
  { level: 6, xpRequired: 1400, name: 'Dominando a Base' },
  { level: 7, xpRequired: 2000, name: 'Rumo ao ENEM' },
  { level: 8, xpRequired: 2800, name: 'Alta Performance' },
  { level: 9, xpRequired: 3700, name: 'Quase Imparável' },
  { level: 10, xpRequired: 5000, name: 'Lenda StudyLazy' },
] as const;

function safeXp(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

export function getLevelName(level: number): string {
  const found = LEVEL_THRESHOLDS.find((item) => item.level === level);
  if (found) {
    return found.name;
  }
  if (level > 10) {
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].name;
  }
  return LEVEL_THRESHOLDS[0].name;
}

export function getLevelForXp(totalXp: number): number {
  const xp = safeXp(totalXp);
  let level = 1;
  for (const threshold of LEVEL_THRESHOLDS) {
    if (xp >= threshold.xpRequired) {
      level = threshold.level;
    } else {
      break;
    }
  }
  return level;
}

export function computeStudentLevel(totalXp: number): StudentLevelInfo {
  const xp = safeXp(totalXp);
  const level = getLevelForXp(xp);
  const current = LEVEL_THRESHOLDS.find((item) => item.level === level)!;
  const next = LEVEL_THRESHOLDS.find((item) => item.level === level + 1);
  const isMaxLevel = !next;

  if (isMaxLevel) {
    return {
      level,
      name: current.name,
      totalXp: xp,
      xpIntoLevel: Math.max(0, xp - current.xpRequired),
      xpSpanToNext: 0,
      nextLevelXpRequired: current.xpRequired,
      xpRemaining: 0,
      progressPercent: 100,
      isMaxLevel: true,
    };
  }

  const span = next.xpRequired - current.xpRequired;
  const into = Math.min(span, Math.max(0, xp - current.xpRequired));
  const remaining = Math.max(0, next.xpRequired - xp);
  const progressPercent =
    span > 0 ? Math.min(100, Math.round((into / span) * 100)) : 100;

  return {
    level,
    name: current.name,
    totalXp: xp,
    xpIntoLevel: into,
    xpSpanToNext: span,
    nextLevelXpRequired: next.xpRequired,
    xpRemaining: remaining,
    progressPercent,
    isMaxLevel: false,
  };
}

export function detectLevelUp(
  previousXp: number,
  nextXp: number
): LevelUpResult {
  const previousLevel = getLevelForXp(previousXp);
  const currentLevel = getLevelForXp(nextXp);
  return {
    leveledUp: currentLevel > previousLevel,
    previousLevel,
    currentLevel,
  };
}

export function getMotivationalMessage(info: StudentLevelInfo): string {
  if (info.isMaxLevel) {
    return 'Você alcançou o topo do StudyLazy. Continue brilhando!';
  }
  if (info.progressPercent >= 80) {
    return 'Quase lá — o próximo nível está perto!';
  }
  if (info.progressPercent >= 40) {
    return 'Bom ritmo. Cada sessão conta.';
  }
  return 'Continue estudando para subir de nível.';
}
