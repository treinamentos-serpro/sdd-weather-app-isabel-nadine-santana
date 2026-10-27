const dayLabelFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  timeZone: 'UTC',
});

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
});

export function formatDayLabel(date: string): string {
  if (!isValidIsoDate(date)) return 'Data indisponível';
  return dayLabelFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function getDayLabel(index: number, date: string): string {
  if (!isValidIsoDate(date)) return 'Data indisponível';
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';
  return weekdayFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function getShortDate(date: string): string {
  if (!isValidIsoDate(date)) return 'Data indisponível';
  return shortDateFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
