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
