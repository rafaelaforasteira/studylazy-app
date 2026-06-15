export type LevelInfo = {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
  remainingXp: number;
};

export function getLevelInfo(totalXp: number): LevelInfo {
  const xpPerLevel = 200;

  const level = Math.floor(totalXp / xpPerLevel) + 1;

  const currentLevelXp = totalXp % xpPerLevel;

  const nextLevelXp = xpPerLevel;

  const progress = Math.min((currentLevelXp / nextLevelXp) * 100, 100);

  const remainingXp = nextLevelXp - currentLevelXp;

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progress,
    remainingXp,
  };
}