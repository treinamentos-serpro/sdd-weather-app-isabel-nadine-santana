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
  return dayLabelFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function getDayLabel(index: number, date: string): string {
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';
  return weekdayFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function getShortDate(date: string): string {
  return shortDateFormatter.format(new Date(`${date}T00:00:00Z`));
}
