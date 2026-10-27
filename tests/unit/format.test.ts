import { describe, expect, it } from 'vitest';
import { formatDayLabel, getDayLabel, getShortDate } from '../../src/lib/format';

describe('formatDayLabel', () => {
  it.each([
    ['2026-10-27', 'terça-feira, 27/10/2026'],
    ['2026-10-31', 'sábado, 31/10/2026'],
    ['2026-12-31', 'quinta-feira, 31/12/2026'],
    ['2027-01-01', 'sexta-feira, 01/01/2027'],
    ['2028-02-29', 'terça-feira, 29/02/2028'],
  ])('formats local date %s without shifting the calendar day', (date, label) => {
    expect(formatDayLabel(date)).toBe(label);
  });

  it.each(['', '2026-02-30', 'not-a-date'])('falls back for invalid date %s', (date) => {
    expect(formatDayLabel(date)).toBe('Data indisponível');
  });
});

describe('getDayLabel', () => {
  it('uses relative labels for the first two forecast days', () => {
    expect(getDayLabel(0, '2026-10-27')).toBe('Hoje');
    expect(getDayLabel(1, '2026-10-28')).toBe('Amanhã');
  });

  it('formats the weekday for the remaining forecast days', () => {
    expect(getDayLabel(2, '2026-10-29')).toBe('quinta-feira');
    expect(getDayLabel(4, '2026-10-31')).toBe('sábado');
  });
});

describe('getShortDate', () => {
  it.each([
    ['2026-10-27', '27/10'],
    ['2027-01-01', '01/01'],
    ['2028-02-29', '29/02'],
  ])('formats %s as a short local date', (date, shortDate) => {
    expect(getShortDate(date)).toBe(shortDate);
  });
});
