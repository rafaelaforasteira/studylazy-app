import {
  computeStudentLevel,
  getLevelName,
} from '../levels/levelLogic';

export type LevelInfo = {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
  remainingXp: number;
};

/**
 * Níveis do aluno por XP (faixas fixas em `src/levels/levelLogic.ts`).
 * Mantém o formato legado `LevelInfo` usado pelo dashboard.
 */
export function getLevelInfo(totalXp: number): LevelInfo {
  const info = computeStudentLevel(totalXp);

  return {
    level: info.level,
    currentLevelXp: info.xpIntoLevel,
    nextLevelXp: info.isMaxLevel
      ? info.xpIntoLevel || 1
      : info.xpSpanToNext,
    progress: info.progressPercent,
    remainingXp: info.xpRemaining,
  };
}

export function getStudentLevelTitle(level: number): string {
  return getLevelName(level);
}
