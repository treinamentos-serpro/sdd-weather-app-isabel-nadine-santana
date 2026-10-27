import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastCard from '../../src/components/ForecastCard';
import type { ForecastDay } from '../../src/types/weather';

const day: ForecastDay = {
  date: '2026-10-27',
  weatherCode: 2,
  temperatureMinC: 10,
  temperatureMaxC: 22,
  precipitationProbabilityPercent: 30,
};

describe('ForecastCard', () => {
  it('shows a labelled card, local day, decorative icon, condition and all metrics', () => {
    render(<ForecastCard day={day} unit="celsius" />);

    expect(screen.getByRole('article', { name: 'terça-feira, 27/10/2026' })).toBeInTheDocument();
    expect(screen.getByText('terça-feira, 27/10/2026')).toHaveAttribute('datetime', '2026-10-27');
    expect(screen.getByText('⛅')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(screen.getByText('Máxima')).toBeInTheDocument();
    expect(screen.getByText('22 °C')).toBeInTheDocument();
    expect(screen.getByText('Mínima')).toBeInTheDocument();
    expect(screen.getByText('10 °C')).toBeInTheDocument();
    expect(screen.getByText('Probabilidade de chuva')).toBeInTheDocument();
    expect(screen.getByText('30 %')).toBeInTheDocument();
  });

  it('converts both temperatures and leaves rain probability unchanged', () => {
    const { rerender } = render(<ForecastCard day={day} unit="fahrenheit" />);

    expect(screen.getByText('71,6 °F')).toBeInTheDocument();
    expect(screen.getByText('50 °F')).toBeInTheDocument();
    expect(screen.getByText('30 %')).toBeInTheDocument();

    rerender(<ForecastCard day={day} unit="celsius" />);
    expect(screen.getByText('22 °C')).toBeInTheDocument();
    expect(screen.getByText('10 °C')).toBeInTheDocument();
    expect(day.temperatureMaxC).toBe(22);
  });

  it.each([0, 100])('preserves valid rain probability %s', (probability) => {
    render(
      <ForecastCard
        day={{ ...day, precipitationProbabilityPercent: probability }}
        unit="celsius"
      />,
    );

    expect(screen.getByText(`${probability} %`)).toBeInTheDocument();
  });

  it('reports absent fields independently while keeping valid maximum and zero values', () => {
    render(
      <ForecastCard
        day={{
          ...day,
          weatherCode: 999,
          temperatureMinC: null,
          temperatureMaxC: 0,
          precipitationProbabilityPercent: null,
        }}
        unit="celsius"
      />,
    );

    expect(screen.getByText('Condição indisponível')).toBeInTheDocument();
    expect(screen.getByText('0 °C')).toBeInTheDocument();
    expect(screen.getAllByText('Indisponível')).toHaveLength(2);
  });

  it('reports both temperatures as unavailable rather than replacing them with zero', () => {
    render(
      <ForecastCard
        day={{ ...day, temperatureMinC: null, temperatureMaxC: null }}
        unit="fahrenheit"
      />,
    );

    expect(screen.getAllByText('Indisponível')).toHaveLength(2);
    expect(screen.queryByText('0 °F')).not.toBeInTheDocument();
    expect(screen.getByText('30 %')).toBeInTheDocument();
  });
});
