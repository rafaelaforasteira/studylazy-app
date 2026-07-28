/**
 * Lógica PURA de vidas — testável no Node sem React Native.
 */
import {
  FRAGMENTS_PER_LIFE,
  LIFE_REGEN_MS,
  MAX_LIVES,
  MAX_REVIEW_REWARD_HISTORY,
  type CanStudyResult,
  type LoseLifeResult,
  type LivesSnapshot,
  type RegenResult,
  type ReviewRewardRecord,
  type ReviewRewardResult,
} from './livesTypes';

export function clampLives(value: number, maxLives: number = MAX_LIVES): number {
  if (!Number.isFinite(value)) {
    return maxLives;
  }
  return Math.max(0, Math.min(maxLives, Math.floor(value)));
}

export function clampLifeFragments(value: number): 0 | 1 {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return 1;
}

export function createInitialLivesSnapshot(
  overrides?: Partial<LivesSnapshot>
): LivesSnapshot {
  return {
    currentLives: MAX_LIVES,
    maxLives: MAX_LIVES,
    lastLifeRegeneratedAt: null,
    lastLifeLostAt: null,
    totalLivesLost: 0,
    isUnlimited: false,
    lifeFragments: 0,
    totalLivesRecoveredFromReview: 0,
    lastLifeRecoveredFromReviewAt: null,
    reviewRewardHistory: [],
    ...overrides,
  };
}

/**
 * Regenera vidas com base no tempo decorrido desde lastLifeRegeneratedAt.
 * Nunca ultrapassa maxLives. Se já está no máximo, não avança o timestamp.
 */
export function regenerateLives(
  snapshot: LivesSnapshot,
  nowMs = Date.now()
): RegenResult {
  if (snapshot.isUnlimited) {
    return {
      lives: snapshot.maxLives,
      regenerated: 0,
      lastLifeRegeneratedAt: snapshot.lastLifeRegeneratedAt,
    };
  }

  const maxLives = snapshot.maxLives > 0 ? snapshot.maxLives : MAX_LIVES;
  let lives = clampLives(snapshot.currentLives, maxLives);

  if (lives >= maxLives) {
    return {
      lives: maxLives,
      regenerated: 0,
      lastLifeRegeneratedAt: snapshot.lastLifeRegeneratedAt,
    };
  }

  const anchorIso = snapshot.lastLifeRegeneratedAt ?? snapshot.lastLifeLostAt;
  if (!anchorIso) {
    return {
      lives,
      regenerated: 0,
      lastLifeRegeneratedAt: snapshot.lastLifeRegeneratedAt,
    };
  }

  const anchorMs = Date.parse(anchorIso);
  if (Number.isNaN(anchorMs) || nowMs < anchorMs) {
    return {
      lives,
      regenerated: 0,
      lastLifeRegeneratedAt: snapshot.lastLifeRegeneratedAt,
    };
  }

  const elapsed = nowMs - anchorMs;
  const regenerated = Math.floor(elapsed / LIFE_REGEN_MS);
  if (regenerated <= 0) {
    return {
      lives,
      regenerated: 0,
      lastLifeRegeneratedAt: snapshot.lastLifeRegeneratedAt,
    };
  }

  const nextLives = clampLives(lives + regenerated, maxLives);
  const applied = nextLives - lives;
  const nextAnchorMs = anchorMs + applied * LIFE_REGEN_MS;

  return {
    lives: nextLives,
    regenerated: applied,
    lastLifeRegeneratedAt: new Date(nextAnchorMs).toISOString(),
  };
}

export function msUntilNextLife(
  snapshot: LivesSnapshot,
  nowMs = Date.now()
): number | null {
  if (snapshot.isUnlimited) {
    return null;
  }

  const regenerated = regenerateLives(snapshot, nowMs);
  if (regenerated.lives >= snapshot.maxLives) {
    return null;
  }

  const anchorIso =
    regenerated.lastLifeRegeneratedAt ??
    snapshot.lastLifeRegeneratedAt ??
    snapshot.lastLifeLostAt;

  if (!anchorIso) {
    return LIFE_REGEN_MS;
  }

  const anchorMs = Date.parse(anchorIso);
  if (Number.isNaN(anchorMs)) {
    return LIFE_REGEN_MS;
  }

  const nextAt = anchorMs + LIFE_REGEN_MS;
  return Math.max(0, nextAt - nowMs);
}

export function formatMsUntilNextLife(ms: number | null): string | null {
  if (ms === null) {
    return null;
  }
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) {
    return `${seconds}s`;
  }
  return `${minutes}min ${String(seconds).padStart(2, '0')}s`;
}

/**
 * Perde 1 vida. Proteção contra perda duplicada via `alreadyLostForKey`
 * (ex.: stableQuestionId da resposta atual).
 */
export function loseLife(params: {
  snapshot: LivesSnapshot;
  alreadyLostForKey?: string | null;
  lossKey?: string | null;
  nowMs?: number;
}): { snapshot: LivesSnapshot; result: LoseLifeResult } {
  const nowMs = params.nowMs ?? Date.now();
  const regenerated = regenerateLives(params.snapshot, nowMs);
  const base: LivesSnapshot = {
    ...params.snapshot,
    currentLives: regenerated.lives,
    lastLifeRegeneratedAt: regenerated.lastLifeRegeneratedAt,
  };

  if (base.isUnlimited) {
    return {
      snapshot: base,
      result: { applied: false, lives: base.currentLives, reason: 'unlimited' },
    };
  }

  if (
    params.lossKey &&
    params.alreadyLostForKey &&
    params.lossKey === params.alreadyLostForKey
  ) {
    return {
      snapshot: base,
      result: {
        applied: false,
        lives: base.currentLives,
        reason: 'duplicate_guard',
      },
    };
  }

  if (base.currentLives <= 0) {
    return {
      snapshot: base,
      result: {
        applied: false,
        lives: 0,
        reason: 'already_zero',
      },
    };
  }

  const nextLives = clampLives(base.currentLives - 1, base.maxLives);
  const nowIso = new Date(nowMs).toISOString();

  return {
    snapshot: {
      ...base,
      currentLives: nextLives,
      lastLifeLostAt: nowIso,
      lastLifeRegeneratedAt:
        base.currentLives >= base.maxLives
          ? nowIso
          : (base.lastLifeRegeneratedAt ?? nowIso),
      totalLivesLost: Math.max(0, (base.totalLivesLost ?? 0) + 1),
    },
    result: { applied: true, lives: nextLives, reason: 'ok' },
  };
}

export function canStartStudy(
  snapshot: LivesSnapshot,
  nowMs = Date.now()
): CanStudyResult {
  const regenerated = regenerateLives(snapshot, nowMs);
  const lives = regenerated.lives;

  if (snapshot.isUnlimited) {
    return {
      allowed: true,
      lives,
      isUnlimited: true,
      msUntilNextLife: null,
    };
  }

  if (lives > 0) {
    return {
      allowed: true,
      lives,
      isUnlimited: false,
      msUntilNextLife: msUntilNextLife(
        {
          ...snapshot,
          currentLives: lives,
          lastLifeRegeneratedAt: regenerated.lastLifeRegeneratedAt,
        },
        nowMs
      ),
    };
  }

  const waitMs = msUntilNextLife(
    {
      ...snapshot,
      currentLives: 0,
      lastLifeRegeneratedAt: regenerated.lastLifeRegeneratedAt,
    },
    nowMs
  );

  return {
    allowed: false,
    lives: 0,
    isUnlimited: false,
    msUntilNextLife: waitMs,
    message:
      'Suas vidas acabaram por agora.\n\nVocê recupera 1 vida a cada 30 minutos.\nVolte em breve para continuar estudando.',
  };
}

export function applyUnlimitedFlag(
  snapshot: LivesSnapshot,
  isUnlimited: boolean
): LivesSnapshot {
  if (isUnlimited) {
    return {
      ...snapshot,
      isUnlimited: true,
      currentLives: snapshot.maxLives,
      lifeFragments: 0,
    };
  }
  return { ...snapshot, isUnlimited: false };
}

export function restoreOneLife(
  snapshot: LivesSnapshot,
  nowMs = Date.now()
): LivesSnapshot {
  if (snapshot.isUnlimited) {
    return snapshot;
  }
  const regenerated = regenerateLives(snapshot, nowMs);
  return {
    ...snapshot,
    currentLives: clampLives(regenerated.lives + 1, snapshot.maxLives),
    lastLifeRegeneratedAt: regenerated.lastLifeRegeneratedAt,
  };
}

export function hasReviewReward(
  history: ReviewRewardRecord[],
  stableQuestionId: string
): boolean {
  const id = stableQuestionId.trim();
  if (!id) {
    return false;
  }
  return history.some((item) => item.stableQuestionId === id);
}

export function trimReviewRewardHistory(
  history: ReviewRewardRecord[],
  max = MAX_REVIEW_REWARD_HISTORY
): ReviewRewardRecord[] {
  if (history.length <= max) {
    return history;
  }
  return history.slice(0, max);
}

/**
 * Acerto na revisão: +1 fragmento; 2 fragmentos → +1 vida.
 * Não consome vidas. Anti-abuso por stableQuestionId.
 */
export function rewardReviewCorrect(params: {
  snapshot: LivesSnapshot;
  stableQuestionId: string;
  isEligibleOfficial: boolean;
  nowMs?: number;
}): { snapshot: LivesSnapshot; result: ReviewRewardResult } {
  const nowMs = params.nowMs ?? Date.now();
  const regenerated = regenerateLives(params.snapshot, nowMs);
  const base: LivesSnapshot = {
    ...params.snapshot,
    currentLives: regenerated.lives,
    lastLifeRegeneratedAt: regenerated.lastLifeRegeneratedAt,
    lifeFragments: clampLifeFragments(params.snapshot.lifeFragments ?? 0),
    reviewRewardHistory: Array.isArray(params.snapshot.reviewRewardHistory)
      ? params.snapshot.reviewRewardHistory
      : [],
    totalLivesRecoveredFromReview:
      params.snapshot.totalLivesRecoveredFromReview ?? 0,
    lastLifeRecoveredFromReviewAt:
      params.snapshot.lastLifeRecoveredFromReviewAt ?? null,
  };

  const stableId = params.stableQuestionId?.trim() ?? '';

  if (base.isUnlimited) {
    return {
      snapshot: base,
      result: {
        applied: false,
        recoveredLife: false,
        lifeFragments: base.lifeFragments,
        currentLives: base.currentLives,
        reason: 'unlimited',
        message: null,
      },
    };
  }

  if (!stableId) {
    return {
      snapshot: base,
      result: {
        applied: false,
        recoveredLife: false,
        lifeFragments: base.lifeFragments,
        currentLives: base.currentLives,
        reason: 'invalid_id',
        message: null,
      },
    };
  }

  if (!params.isEligibleOfficial) {
    return {
      snapshot: base,
      result: {
        applied: false,
        recoveredLife: false,
        lifeFragments: base.lifeFragments,
        currentLives: base.currentLives,
        reason: 'ineligible',
        message: null,
      },
    };
  }

  if (hasReviewReward(base.reviewRewardHistory, stableId)) {
    return {
      snapshot: base,
      result: {
        applied: false,
        recoveredLife: false,
        lifeFragments: base.lifeFragments,
        currentLives: base.currentLives,
        reason: 'already_rewarded',
        message: null,
      },
    };
  }

  const maxLives = base.maxLives > 0 ? base.maxLives : MAX_LIVES;
  if (base.currentLives >= maxLives) {
    return {
      snapshot: base,
      result: {
        applied: false,
        recoveredLife: false,
        lifeFragments: base.lifeFragments,
        currentLives: base.currentLives,
        reason: 'full_lives',
        message: null,
      },
    };
  }

  const nowIso = new Date(nowMs).toISOString();
  const nextHistory = trimReviewRewardHistory([
    { stableQuestionId: stableId, rewardedAt: nowIso },
    ...base.reviewRewardHistory,
  ]);

  const nextFragments = base.lifeFragments + 1;

  if (nextFragments >= FRAGMENTS_PER_LIFE) {
    const nextLives = clampLives(base.currentLives + 1, maxLives);
    const recovered = nextLives > base.currentLives;
    return {
      snapshot: {
        ...base,
        currentLives: nextLives,
        lifeFragments: 0,
        totalLivesRecoveredFromReview:
          base.totalLivesRecoveredFromReview + (recovered ? 1 : 0),
        lastLifeRecoveredFromReviewAt: recovered
          ? nowIso
          : base.lastLifeRecoveredFromReviewAt,
        reviewRewardHistory: nextHistory,
      },
      result: {
        applied: true,
        recoveredLife: recovered,
        lifeFragments: 0,
        currentLives: nextLives,
        reason: 'ok_life',
        message: recovered
          ? 'Excelente! Você recuperou 1 vida.'
          : null,
      },
    };
  }

  return {
    snapshot: {
      ...base,
      lifeFragments: 1,
      reviewRewardHistory: nextHistory,
    },
    result: {
      applied: true,
      recoveredLife: false,
      lifeFragments: 1,
      currentLives: base.currentLives,
      reason: 'ok_fragment',
      message: 'Boa! Você recuperou metade de uma vida.',
    },
  };
}

/** Dev helper: adiciona 1 fragmento sem histórico de questão. */
export function addReviewFragmentDev(
  snapshot: LivesSnapshot,
  nowMs = Date.now()
): LivesSnapshot {
  if (snapshot.isUnlimited) {
    return snapshot;
  }
  const regenerated = regenerateLives(snapshot, nowMs);
  const base = {
    ...snapshot,
    currentLives: regenerated.lives,
    lastLifeRegeneratedAt: regenerated.lastLifeRegeneratedAt,
  };
  if (base.currentLives >= base.maxLives) {
    return { ...base, lifeFragments: 0 };
  }
  if (base.lifeFragments >= 1) {
    const nextLives = clampLives(base.currentLives + 1, base.maxLives);
    return {
      ...base,
      currentLives: nextLives,
      lifeFragments: 0,
      totalLivesRecoveredFromReview:
        (base.totalLivesRecoveredFromReview ?? 0) +
        (nextLives > base.currentLives ? 1 : 0),
      lastLifeRecoveredFromReviewAt:
        nextLives > base.currentLives
          ? new Date(nowMs).toISOString()
          : base.lastLifeRecoveredFromReviewAt,
    };
  }
  return { ...base, lifeFragments: 1 };
}

export function clearReviewRewardHistory(
  snapshot: LivesSnapshot
): LivesSnapshot {
  return {
    ...snapshot,
    reviewRewardHistory: [],
  };
}
