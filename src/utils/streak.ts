import { getLocalDateKey, getYesterdayDateKey } from './date';

export function getDisplayStreak(
  lastStudyDate: string | null,
  storedStreak: number
) {
  if (!lastStudyDate) {
    return 0;
  }

  const today = getLocalDateKey();
  const yesterday = getYesterdayDateKey();

  if (lastStudyDate === today || lastStudyDate === yesterday) {
    return storedStreak;
  }

  return 0;
}
