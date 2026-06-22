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
