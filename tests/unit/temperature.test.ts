import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature } from '../../src/lib/temperature';

describe('temperature', () => {
  it.each([
    [20, 68],
    [21.3, 70.34],
    [0, 32],
    [-40, -40],
  ])('converts %s Celsius to Fahrenheit', (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, 'fahrenheit')).toBeCloseTo(fahrenheit);
    expect(convertTemperature(celsius, 'celsius')).toBe(celsius);
  });

  it('formats pt-BR with at most one decimal and an explicit unit', () => {
    expect(formatTemperature(20, 'celsius')).toBe('20 °C');
    expect(formatTemperature(21.3, 'fahrenheit')).toBe('70,3 °F');
    expect(formatTemperature(22, 'fahrenheit')).toBe('71,6 °F');
    expect(formatTemperature(18.56, 'celsius')).toBe('18,6 °C');
    expect(formatTemperature(0, 'celsius')).toBe('0 °C');
    expect(formatTemperature(-12.34, 'celsius')).toBe('-12,3 °C');
  });

  it('preserves null in both units', () => {
    expect(convertTemperature(null, 'celsius')).toBeNull();
    expect(convertTemperature(null, 'fahrenheit')).toBeNull();
    expect(formatTemperature(null, 'celsius')).toBeNull();
    expect(formatTemperature(null, 'fahrenheit')).toBeNull();
  });
});
