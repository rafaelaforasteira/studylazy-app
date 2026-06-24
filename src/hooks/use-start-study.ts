import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import type { StudyTask } from '../utils/studyPlanGenerator';

type StartStudyParams = {
  subject: string;
  duration: number;
  type: string;
};

export function useStartStudy() {
  const router = useRouter();

  const startStudy = useCallback(
    ({ subject, duration, type }: StartStudyParams) => {
      if (!subject || duration <= 0) {
        return;
      }

      router.push({
        pathname: '/study-session',
        params: {
          subject,
          duration: String(duration),
          type: type || 'Teoria',
          startedAt: String(Date.now()),
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
