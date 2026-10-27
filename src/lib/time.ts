export function formatReferenceTime(
  referenceTime: string | null,
  timezone: string | null,
  utcOffsetSeconds: number | null,
): string | null {
  if (referenceTime === null) return null;

  const hasOffset = /(?:Z|[+-]\d{2}:\d{2})$/i.test(referenceTime);
  // Open-Meteo retorna timestamps locais sem offset; nao aplicar o fuso duas vezes.
  const parsedDate = new Date(hasOffset ? referenceTime : `${referenceTime}Z`);
  const date =
    hasOffset && timezone === null && utcOffsetSeconds !== null
      ? new Date(parsedDate.getTime() + utcOffsetSeconds * 1000)
      : parsedDate;
  const timeZone = hasOffset ? (timezone ?? 'UTC') : 'UTC';
  const day = new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
  const time = new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);

  const zone = timezone ?? 'Fuso indisponível';
  if (utcOffsetSeconds === null) return `${day} às ${time} — ${zone}`;

  const offsetMinutes = Math.floor(Math.abs(utcOffsetSeconds) / 60);
  const hours = String(Math.floor(offsetMinutes / 60)).padStart(2, '0');
  const minutes = String(offsetMinutes % 60).padStart(2, '0');
  const sign = utcOffsetSeconds < 0 ? '-' : '+';
  return `${day} às ${time} — ${zone} (UTC${sign}${hours}:${minutes})`;
}
