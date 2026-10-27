const dayLabelFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatDayLabel(date: string): string {
  return dayLabelFormatter.format(new Date(`${date}T00:00:00Z`));
}
