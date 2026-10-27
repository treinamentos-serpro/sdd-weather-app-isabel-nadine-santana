import { describe, expect, it } from 'vitest';
import { getWeatherCondition } from '../../src/lib/weatherCodes';

describe('getWeatherCondition', () => {
  it.each([
    [0, 'Céu limpo'],
    [1, 'Predominantemente limpo'],
    [2, 'Parcialmente nublado'],
    [3, 'Nublado'],
    [45, 'Nevoeiro'],
    [48, 'Nevoeiro com deposição de geada'],
    [51, 'Garoa fraca'],
    [53, 'Garoa moderada'],
    [55, 'Garoa intensa'],
    [56, 'Garoa congelante fraca'],
    [57, 'Garoa congelante intensa'],
    [61, 'Chuva fraca'],
    [63, 'Chuva moderada'],
    [65, 'Chuva forte'],
    [66, 'Chuva congelante fraca'],
    [67, 'Chuva congelante forte'],
    [71, 'Neve fraca'],
    [73, 'Neve moderada'],
    [75, 'Neve forte'],
    [77, 'Grãos de neve'],
    [80, 'Pancadas de chuva fracas'],
    [81, 'Pancadas de chuva moderadas'],
    [82, 'Pancadas de chuva violentas'],
    [85, 'Pancadas de neve fracas'],
    [86, 'Pancadas de neve fortes'],
    [95, 'Trovoada fraca ou moderada'],
    [96, 'Trovoada com granizo fraco'],
    [99, 'Trovoada com granizo forte'],
  ] as const)('maps WMO %s to its localized condition and an icon', (code, label) => {
    const condition = getWeatherCondition(code);
    expect(condition.label).toBe(label);
    expect(condition.icon).not.toBe('');
    expect(condition.icon).not.toBe('❔');
  });

  it.each([null, -1, 999, 52, 62, 72])('handles missing or unsupported WMO %s', (code) => {
    expect(getWeatherCondition(code)).toEqual({ label: 'Condição indisponível', icon: '❔' });
  });
});
