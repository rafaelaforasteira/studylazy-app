/**
 * Lógica PURA de vidas — testável no Node sem React Native.
 */
import {
  LIFE_REGEN_MS,
  MAX_LIVES,
  type CanStudyResult,
  type LoseLifeResult,
  type LivesSnapshot,
  type RegenResult,
} from './livesTypes';

export function clampLives(value: number, maxLives: number = MAX_LIVES): number {
  if (!Number.isFinite(value)) {
    return maxLives;
  }
  return Math.max(0, Math.min(maxLives, Math.floor(value)));
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
      // Âncora de regen começa no momento da perda quando sai do máximo.
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
