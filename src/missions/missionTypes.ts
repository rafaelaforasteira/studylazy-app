/** Tipos do sistema de missões diárias. */

export type MissionType =
  | 'complete_lesson'
  | 'answer_questions'
  | 'correct_answers'
  | 'review_mistakes';

export type MissionStatus = 'active' | 'completed' | 'claimed';

export type DailyMission = {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  target: number;
  progress: number;
  xpReward: number;
  status: MissionStatus;
  dateKey: string;
  completedAt: string | null;
  claimedAt: string | null;
};

export type DailyMissionsSnapshot = {
  dateKey: string;
  missions: DailyMission[];
  /** Bônus por completar todas as missões (fragmento de vida). */
  dailyBonusClaimed: boolean;
  dailyBonusClaimedAt: string | null;
};

export type MissionProgressEvent =
  | { type: 'complete_lesson'; amount?: number }
  | { type: 'answer_questions'; amount: number }
  | { type: 'correct_answers'; amount: number }
  | { type: 'review_mistakes'; amount?: number };

export type ClaimMissionResult = {
  applied: boolean;
  xpAwarded: number;
  reason: 'ok' | 'not_found' | 'not_completed' | 'already_claimed' | 'wrong_day';
};

export type ClaimDailyBonusResult = {
  applied: boolean;
  shouldGrantFragment: boolean;
  reason:
    | 'ok'
    | 'incomplete'
    | 'already_claimed'
    | 'wrong_day';
};

export const MISSION_XP_REWARD = 10 as const;
