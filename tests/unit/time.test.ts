import { describe, expect, it } from 'vitest';
import { formatReferenceTime } from '../../src/lib/time';

describe('formatReferenceTime', () => {
  it('preserves local provider times without applying the offset twice', () => {
    expect(formatReferenceTime('2026-10-27T14:30', 'America/Sao_Paulo', -10800)).toBe(
      '27/10/2026 às 14:30 — America/Sao_Paulo (UTC-03:00)',
    );
  });

  it('converts an explicit instant into the supplied timezone, including date rollover', () => {
    expect(formatReferenceTime('2026-10-28T01:30:00Z', 'America/Sao_Paulo', -10800)).toBe(
      '27/10/2026 às 22:30 — America/Sao_Paulo (UTC-03:00)',
    );
    expect(formatReferenceTime('2026-10-27T14:00:00+00:00', 'Europe/Lisbon', 0)).toBe(
      '27/10/2026 às 14:00 — Europe/Lisbon (UTC+00:00)',
    );
  });

  it('uses the supplied offset when timezone is absent', () => {
    expect(formatReferenceTime('2026-10-27T14:30:00Z', null, 19800)).toBe(
      '27/10/2026 às 20:00 — Fuso indisponível (UTC+05:30)',
    );
  });

  it('does not replace missing reference or timezone fields with current time', () => {
    expect(formatReferenceTime(null, null, null)).toBeNull();
    expect(formatReferenceTime('2026-10-27T14:30', null, null)).toBe(
      '27/10/2026 às 14:30 — Fuso indisponível',
    );
    expect(formatReferenceTime('2026-10-27T14:30', 'Europe/Lisbon', null)).toBe(
      '27/10/2026 às 14:30 — Europe/Lisbon',
    );
  });

  it.each([undefined, '', 'not-a-date'])('returns no reference for invalid time %s', (time) => {
    expect(formatReferenceTime(time, null, null)).toBeNull();
  });

  it('falls back safely when the timezone or offset is invalid', () => {
    expect(formatReferenceTime('2026-10-27T14:30', 'Invalid/Timezone', Number.NaN)).toBe(
      '27/10/2026 às 14:30 — Fuso indisponível',
    );
  });
});
