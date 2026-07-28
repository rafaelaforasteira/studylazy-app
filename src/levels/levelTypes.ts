/** Tipos do sistema de níveis do aluno. */

export type LevelThreshold = {
  level: number;
  xpRequired: number;
  name: string;
};

export type StudentLevelInfo = {
  level: number;
  name: string;
  totalXp: number;
  /** XP acumulado dentro do nível atual (desde o limiar deste nível). */
  xpIntoLevel: number;
  /** XP necessário neste nível para chegar ao próximo (span). */
  xpSpanToNext: number;
  /** XP absoluto do próximo nível (ou do atual se máximo). */
  nextLevelXpRequired: number;
  /** XP que falta para o próximo nível. */
  xpRemaining: number;
  /** 0–100 */
  progressPercent: number;
  isMaxLevel: boolean;
};

export type LevelUpResult = {
  leveledUp: boolean;
  previousLevel: number;
  currentLevel: number;
};
