import { isValidIsoDate } from './format';

export function formatReferenceTime(
  referenceTime: string | null | undefined,
  timezone: string | null | undefined,
  utcOffsetSeconds: number | null | undefined,
): string | null {
  if (
    typeof referenceTime !== 'string' ||
    !isValidIsoDate(referenceTime.slice(0, 10)) ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?$/i.test(
      referenceTime,
    )
  ) {
    return null;
  }

  const hasOffset = /(?:Z|[+-]\d{2}:\d{2})$/i.test(referenceTime);
  // Open-Meteo retorna timestamps locais sem offset; nao aplicar o fuso duas vezes.
  const parsedDate = new Date(hasOffset ? referenceTime : `${referenceTime}Z`);
  if (Number.isNaN(parsedDate.getTime())) return null;
  const validOffset =
    typeof utcOffsetSeconds === 'number' && Number.isFinite(utcOffsetSeconds)
      ? utcOffsetSeconds
      : null;
  let zone = typeof timezone === 'string' && timezone.trim() ? timezone : null;
  let timeZone = hasOffset ? (zone ?? 'UTC') : 'UTC';
  if (zone) {
    try {
      new Intl.DateTimeFormat('pt-BR', { timeZone: zone });
    } catch {
      zone = null;
      timeZone = 'UTC';
    }
  }
  const date =
    hasOffset && !zone && validOffset !== null
      ? new Date(parsedDate.getTime() + validOffset * 1000)
      : parsedDate;
  if (!Number.isFinite(date.getTime())) return null;
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

  const zoneLabel = zone ?? 'Fuso indisponível';
  if (validOffset === null) {
    return `${day} às ${time} — ${zoneLabel}`;
  }

  const offsetMinutes = Math.floor(Math.abs(validOffset) / 60);
  const hours = String(Math.floor(offsetMinutes / 60)).padStart(2, '0');
  const minutes = String(offsetMinutes % 60).padStart(2, '0');
  const sign = validOffset < 0 ? '-' : '+';
  return `${day} às ${time} — ${zoneLabel} (UTC${sign}${hours}:${minutes})`;
}
