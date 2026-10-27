import type { Unit } from '../types/weather';

export function unitLabel(unit: Unit): string {
  return unit === 'celsius' ? '°C' : '°F';
}

export function convertTemperature(
  temperatureC: number | null | undefined,
  unit: Unit,
): number | null {
  if (typeof temperatureC !== 'number' || !Number.isFinite(temperatureC)) return null;
  const temperature = unit === 'fahrenheit' ? (temperatureC * 9) / 5 + 32 : temperatureC;
  return Number.isFinite(temperature) ? temperature : null;
}

export function formatTemperature(
  temperatureC: number | null | undefined,
  unit: Unit,
): string | null {
  const temperature = convertTemperature(temperatureC, unit);
  if (temperature === null) return null;

  const formatted = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
  }).format(temperature);
  return `${formatted} ${unitLabel(unit)}`;
}
