import { describe, expect, it } from 'vitest';
import { formatDayLabel } from '../../src/lib/format';

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
});
