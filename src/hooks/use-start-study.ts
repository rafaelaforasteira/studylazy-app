import { useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';

import type { StudyTask } from '../utils/studyPlanGenerator';

type StartStudyParams = {
  subject: string;
  duration: number;
  type: string;
};

/**
 * Janela mínima (ms) entre aberturas de sessão. Evita que toques rápidos
 * duplos abram duas sessões de estudo empilhadas.
 */
const START_DEBOUNCE_MS = 1000;

export function useStartStudy() {
  const router = useRouter();
  const lastStartRef = useRef(0);

  const startStudy = useCallback(
    ({ subject, duration, type }: StartStudyParams) => {
      if (!subject || !Number.isFinite(duration) || duration <= 0) {
        return;
      }

      const now = Date.now();
      if (now - lastStartRef.current < START_DEBOUNCE_MS) {
        return;
      }
      lastStartRef.current = now;

      router.push({
        pathname: '/study-session',
        params: {
          subject,
          duration: String(duration),
          type: type || 'Teoria',
          startedAt: String(now),
        },
      });
    },
    [router]
  );

  const startNextTask = useCallback(
    (task?: StudyTask | null) => {
      if (!task) {
        return;
      }

      startStudy({
        subject: task.subject,
        duration: task.duration,
        type: task.type,
      });
    },
    [startStudy]
  );

  return {
    startStudy,
    startNextTask,
  };
}
