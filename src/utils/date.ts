function addZero(value: number) {
  return String(value).padStart(2, '0');
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = addZero(date.getMonth() + 1);
  const day = addZero(date.getDate());

  return `${year}-${month}-${day}`;
}

export function getYesterdayDateKey() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return getLocalDateKey(yesterday);
}

export function formatDisplayDate(date: string) {
  return date.split('-').reverse().join('/');
}

export function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function parseLocalDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getDateKeysForLastDays(days: number, fromDate = new Date()) {
  const keys: string[] = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(fromDate);
    date.setDate(fromDate.getDate() - index);
    keys.push(getLocalDateKey(date));
  }

  return keys;
}

export function getWeekStartKey(date = new Date()) {
  const local = new Date(date);
  const day = local.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  local.setDate(local.getDate() + diff);
  return getLocalDateKey(local);
}

/** Monday → Sunday keys for the week containing `date`. */
export function getCurrentWeekDateKeys(date = new Date()) {
  const weekStart = parseLocalDateKey(getWeekStartKey(date));
  const keys: string[] = [];

  for (let index = 0; index < 7; index += 1) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    keys.push(getLocalDateKey(day));
  }

  return keys;
}

export const WEEKDAY_SHORT_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'] as const;

export const WEEKDAY_CHART_LABELS = [
  'Seg',
  'Ter',
  'Qua',
  'Qui',
  'Sex',
  'Sáb',
  'Dom',
] as const;

export function isTodayKey(dateKey: string, today = new Date()) {
  return dateKey === getLocalDateKey(today);
}

export function isFutureDateKey(dateKey: string, today = new Date()) {
  const target = parseLocalDateKey(dateKey);
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return target.getTime() > now.getTime();
}

export function formatShortWeekday(dateKey: string) {
  const date = parseLocalDateKey(dateKey);
  return date.toLocaleDateString('pt-BR', { weekday: 'short' });
}

export function formatShortDayMonth(dateKey: string) {
  const date = parseLocalDateKey(dateKey);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}
