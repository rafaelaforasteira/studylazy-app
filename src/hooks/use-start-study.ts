import { useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { ROUTES } from '../constants/routes';
import {
  checkSessionStart,
  resolveEntitlementState,
} from '../entitlements/entitlementLogic';
import { useEntitlementStore } from '../entitlements/entitlementStore';
import { formatMsUntilNextLife } from '../lives/livesLogic';
import { useLivesStore } from '../store/livesStore';
import { useStudyProgressStore } from '../store/studyProgressStore';
import type { StudyTask } from '../utils/studyPlanGenerator';

type StartStudyParams = {
  subject: string;
  duration: number;
  type: string;
};

/** Janela mínima entre aberturas de sessão (evita toque duplo). */
const START_DEBOUNCE_MS = 1000;

export function useStartStudy() {
  const router = useRouter();
  const lastStartRef = useRef(0);

  const navigateToSession = useCallback(
    ({ subject, duration, type }: StartStudyParams) => {
      const now = Date.now();
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

      const entitlement = resolveEntitlementState(
        useEntitlementStore.getState()
      );

      // Pro futuro / simulação local: vidas ilimitadas.
      if (entitlement.isPro) {
        useLivesStore.getState().setUnlimited(true);
      } else {
        useLivesStore.getState().setUnlimited(false);
      }

      const livesCheck = useLivesStore.getState().canStudy();
      if (!livesCheck.allowed && !livesCheck.isUnlimited) {
        const waitLabel = formatMsUntilNextLife(livesCheck.msUntilNextLife);
        Alert.alert(
          'Sem vidas por agora',
          `${livesCheck.message ?? 'Suas vidas acabaram por agora.'}${
            waitLabel ? `\n\nPróxima vida em cerca de ${waitLabel}.` : ''
          }`,
          [
            { text: 'Ok', style: 'cancel' },
            {
              text: 'Ver benefícios Pro',
              onPress: () => router.push(ROUTES.pro),
            },
          ]
        );
        return;
      }

      const progress = useStudyProgressStore.getState();
      const decision = checkSessionStart({
        entitlement,
        progress: {
          lessonHistory: progress.lessonHistory,
          answeredQuestionsToday: progress.answeredQuestionsToday,
          dailyProgressDate: progress.dailyProgressDate,
          lastStudyDate: progress.lastStudyDate,
        },
        questionCount: duration,
      });

      if (!decision.allowed && decision.message) {
        if (decision.softOverride) {
          Alert.alert('Limite do plano gratuito', decision.message, [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Conhecer o Pro',
              onPress: () => router.push(ROUTES.pro),
            },
            {
              text: 'Continuar mesmo assim',
              onPress: () => navigateToSession({ subject, duration, type }),
            },
          ]);
          return;
        }

        Alert.alert('Limite do plano gratuito', decision.message, [
          { text: 'Ok', style: 'cancel' },
          {
            text: 'Conhecer o Pro',
            onPress: () => router.push(ROUTES.pro),
          },
        ]);
        return;
      }

      navigateToSession({ subject, duration, type });
    },
    [navigateToSession, router]
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
