import type { Unit } from '../types/weather';

export function convertTemperature(temperatureC: number | null, unit: Unit): number | null {
  if (temperatureC === null) return null;
  return unit === 'fahrenheit' ? (temperatureC * 9) / 5 + 32 : temperatureC;
}

export function formatTemperature(temperatureC: number | null, unit: Unit): string | null {
  const temperature = convertTemperature(temperatureC, unit);
  if (temperature === null) return null;

  const formatted = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
  }).format(temperature);
  return `${formatted} ${unit === 'celsius' ? '°C' : '°F'}`;
}
