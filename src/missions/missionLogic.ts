/**
 * Lógica PURA de missões diárias — testável no Node sem React Native.
 */
import { getLocalDateKey } from '../utils/date';
import {
  MISSION_XP_REWARD,
  type ClaimDailyBonusResult,
  type ClaimMissionResult,
  type DailyMission,
  type DailyMissionsSnapshot,
  type MissionProgressEvent,
  type MissionType,
} from './missionTypes';

type MissionTemplate = {
  type: MissionType;
  title: string;
  description: string;
  target: number;
};

export const DAILY_MISSION_TEMPLATES: readonly MissionTemplate[] = [
  {
    type: 'complete_lesson',
    title: 'Complete 1 lição',
    description: 'Finalize uma sessão de estudo.',
    target: 1,
  },
  {
    type: 'answer_questions',
    title: 'Responda 10 questões',
    description: 'Responda questões em sessões de estudo.',
    target: 10,
  },
  {
    type: 'correct_answers',
    title: 'Acerte 7 questões',
    description: 'Acertos em sessões de estudo contam aqui.',
    target: 7,
  },
  {
    type: 'review_mistakes',
    title: 'Revise 3 erros',
    description: 'Responda questões na revisão de erros.',
    target: 3,
  },
] as const;

export function getMissionDateKey(date = new Date()): string {
  return getLocalDateKey(date);
}

export function createMissionId(type: MissionType, dateKey: string): string {
  return `${dateKey}:${type}`;
}

export function createDailyMissions(dateKey: string): DailyMission[] {
  return DAILY_MISSION_TEMPLATES.map((template) => ({
    id: createMissionId(template.type, dateKey),
    type: template.type,
    title: template.title,
    description: template.description,
    target: template.target,
    progress: 0,
    xpReward: MISSION_XP_REWARD,
    status: 'active',
    dateKey,
    completedAt: null,
    claimedAt: null,
  }));
}

export function createEmptyMissionsSnapshot(
  dateKey = getMissionDateKey()
): DailyMissionsSnapshot {
  return {
    dateKey,
    missions: createDailyMissions(dateKey),
    dailyBonusClaimed: false,
    dailyBonusClaimedAt: null,
  };
}

export function ensureMissionsForDate(
  snapshot: DailyMissionsSnapshot | null | undefined,
  dateKey: string
): DailyMissionsSnapshot {
  if (!snapshot || snapshot.dateKey !== dateKey) {
    return createEmptyMissionsSnapshot(dateKey);
  }

  const byType = new Map(
    (snapshot.missions ?? []).map((mission) => [mission.type, mission])
  );

  const missions: DailyMission[] = DAILY_MISSION_TEMPLATES.map((template) => {
    const existing = byType.get(template.type);
    if (!existing) {
      return createDailyMissions(dateKey).find((m) => m.type === template.type)!;
    }
    const progress = Math.min(
      template.target,
      Math.max(0, Math.floor(existing.progress ?? 0))
    );
    let status: DailyMission['status'] = 'active';
    if (existing.status === 'claimed') {
      status = 'claimed';
    } else if (existing.status === 'completed' || progress >= template.target) {
      status = 'completed';
    }
    return {
      ...existing,
      id: createMissionId(template.type, dateKey),
      title: template.title,
      description: template.description,
      target: template.target,
      xpReward: MISSION_XP_REWARD,
      dateKey,
      progress,
      status,
    };
  });

  return {
    dateKey,
    missions,
    dailyBonusClaimed: Boolean(snapshot.dailyBonusClaimed),
    dailyBonusClaimedAt: snapshot.dailyBonusClaimedAt ?? null,
  };
}

function withCompletedIfReady(
  mission: DailyMission,
  nowIso: string
): DailyMission {
  if (mission.status === 'claimed') {
    return mission;
  }
  if (mission.progress >= mission.target) {
    return {
      ...mission,
      progress: mission.target,
      status: 'completed',
      completedAt: mission.completedAt ?? nowIso,
    };
  }
  return {
    ...mission,
    status: 'active',
  };
}

export function applyMissionProgress(
  snapshot: DailyMissionsSnapshot,
  event: MissionProgressEvent,
  nowMs = Date.now()
): DailyMissionsSnapshot {
  const dateKey = getMissionDateKey(new Date(nowMs));
  const base = ensureMissionsForDate(snapshot, dateKey);
  const nowIso = new Date(nowMs).toISOString();
  const amount = Math.max(
    0,
    Math.floor(
      'amount' in event && typeof event.amount === 'number'
        ? event.amount
        : 1
    )
  );

  if (amount <= 0) {
    return base;
  }

  const missions = base.missions.map((mission) => {
    if (mission.type !== event.type) {
      return mission;
    }
    if (mission.status === 'claimed') {
      return mission;
    }
    const nextProgress = Math.min(mission.target, mission.progress + amount);
    return withCompletedIfReady(
      {
        ...mission,
        progress: nextProgress,
      },
      nowIso
    );
  });

  return { ...base, missions };
}

export function countCompletedMissions(
  snapshot: DailyMissionsSnapshot
): number {
  return snapshot.missions.filter(
    (m) => m.status === 'completed' || m.status === 'claimed'
  ).length;
}

export function areAllMissionsCompleted(
  snapshot: DailyMissionsSnapshot
): boolean {
  return (
    snapshot.missions.length > 0 &&
    snapshot.missions.every(
      (m) => m.status === 'completed' || m.status === 'claimed'
    )
  );
}

export function areAllMissionsClaimed(
  snapshot: DailyMissionsSnapshot
): boolean {
  return (
    snapshot.missions.length > 0 &&
    snapshot.missions.every((m) => m.status === 'claimed')
  );
}

export function claimMissionReward(
  snapshot: DailyMissionsSnapshot,
  missionId: string,
  nowMs = Date.now()
): { snapshot: DailyMissionsSnapshot; result: ClaimMissionResult } {
  const dateKey = getMissionDateKey(new Date(nowMs));
  const base = ensureMissionsForDate(snapshot, dateKey);
  const nowIso = new Date(nowMs).toISOString();
  const index = base.missions.findIndex((m) => m.id === missionId);

  if (index < 0) {
    return {
      snapshot: base,
      result: {
        applied: false,
        xpAwarded: 0,
        reason: 'not_found',
      },
    };
  }

  const mission = base.missions[index];
  if (mission.dateKey !== dateKey) {
    return {
      snapshot: base,
      result: {
        applied: false,
        xpAwarded: 0,
        reason: 'wrong_day',
      },
    };
  }
  if (mission.status === 'claimed') {
    return {
      snapshot: base,
      result: {
        applied: false,
        xpAwarded: 0,
        reason: 'already_claimed',
      },
    };
  }
  if (mission.status !== 'completed' && mission.progress < mission.target) {
    return {
      snapshot: base,
      result: {
        applied: false,
        xpAwarded: 0,
        reason: 'not_completed',
      },
    };
  }

  const xpAwarded = Math.max(0, mission.xpReward || MISSION_XP_REWARD);
  const nextMissions = [...base.missions];
  nextMissions[index] = {
    ...mission,
    progress: mission.target,
    status: 'claimed',
    completedAt: mission.completedAt ?? nowIso,
    claimedAt: nowIso,
  };

  return {
    snapshot: { ...base, missions: nextMissions },
    result: {
      applied: true,
      xpAwarded,
      reason: 'ok',
    },
  };
}

export function claimDailyBonus(
  snapshot: DailyMissionsSnapshot,
  nowMs = Date.now()
): { snapshot: DailyMissionsSnapshot; result: ClaimDailyBonusResult } {
  const dateKey = getMissionDateKey(new Date(nowMs));
  const base = ensureMissionsForDate(snapshot, dateKey);
  const nowIso = new Date(nowMs).toISOString();

  if (base.dailyBonusClaimed) {
    return {
      snapshot: base,
      result: {
        applied: false,
        shouldGrantFragment: false,
        reason: 'already_claimed',
      },
    };
  }

  if (!areAllMissionsCompleted(base)) {
    return {
      snapshot: base,
      result: {
        applied: false,
        shouldGrantFragment: false,
        reason: 'incomplete',
      },
    };
  }

  return {
    snapshot: {
      ...base,
      dailyBonusClaimed: true,
      dailyBonusClaimedAt: nowIso,
    },
    result: {
      applied: true,
      shouldGrantFragment: true,
      reason: 'ok',
    },
  };
}

/** Dev: força snapshot para um dateKey (simula novo dia). */
export function forceMissionsDate(
  _snapshot: DailyMissionsSnapshot | null | undefined,
  dateKey: string
): DailyMissionsSnapshot {
  return createEmptyMissionsSnapshot(dateKey);
}
