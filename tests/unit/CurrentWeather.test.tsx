import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import type { CurrentWeather as CurrentWeatherData } from '../../src/types/weather';
import { mockCity, mockWeatherData } from '../../src/types/weather';

const current: CurrentWeatherData = {
  ...mockWeatherData.current,
  temperatureC: 18,
  referenceTime: '2026-10-27T14:30',
  timezone: 'America/Sao_Paulo',
  utcOffsetSeconds: -10800,
};

describe('CurrentWeather', () => {
  it('shows the city, condition, metrics and provider reference in a labelled hero', () => {
    render(<CurrentWeather city={mockCity} current={current} unit="celsius" />);

    expect(screen.getByRole('region', { name: 'Porto' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Porto' })).toBeInTheDocument();
    expect(screen.getByText('Porto, Portugal')).toBeInTheDocument();
    expect(screen.getByText('18 °C')).toBeInTheDocument();
    expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(screen.getByText('⛅')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('65 %')).toBeInTheDocument();
    expect(screen.getByText('12,5 km/h')).toBeInTheDocument();
    expect(screen.getByText('0 mm')).toBeInTheDocument();
    expect(screen.getByText('1.013,2 hPa')).toBeInTheDocument();
    expect(
      screen.getByText('Dados referentes a 27/10/2026 às 14:30 — America/Sao_Paulo (UTC-03:00)'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Estimativa do modelo meteorológico/)).toBeInTheDocument();
    expect(screen.queryByText(/em tempo real/i)).not.toBeInTheDocument();
  });

  it('converts only the temperature and reverses the unit without changing the source', () => {
    const data = { ...current, temperatureC: 20 };
    const { rerender } = render(<CurrentWeather city={mockCity} current={data} unit="celsius" />);
    expect(screen.getByText('20 °C')).toBeInTheDocument();

    rerender(<CurrentWeather city={mockCity} current={data} unit="fahrenheit" />);
    expect(screen.getByText('68 °F')).toBeInTheDocument();
    expect(screen.getByText('12,5 km/h')).toBeInTheDocument();
    expect(screen.getByText('65 %')).toBeInTheDocument();
    expect(screen.getByText('0 mm')).toBeInTheDocument();
    expect(screen.getByText('1.013,2 hPa')).toBeInTheDocument();

    rerender(<CurrentWeather city={mockCity} current={data} unit="celsius" />);
    expect(screen.getByText('20 °C')).toBeInTheDocument();
    expect(data.temperatureC).toBe(20);
  });

  it('reports absent fields independently without substituting zero', () => {
    render(
      <CurrentWeather
        city={mockCity}
        current={{
          ...current,
          temperatureC: null,
          weatherCode: null,
          humidityPercent: null,
          windSpeedKmh: null,
          precipitationMm: null,
          pressureHpa: null,
          referenceTime: null,
          timezone: null,
          utcOffsetSeconds: null,
        }}
        unit="fahrenheit"
      />,
    );

    expect(screen.getByText('Temperatura indisponível')).toBeInTheDocument();
    expect(screen.getByText('Condição indisponível')).toBeInTheDocument();
    expect(screen.getAllByText('Indisponível')).toHaveLength(4);
    expect(screen.getByText('Referência temporal indisponível')).toBeInTheDocument();
    expect(screen.queryByText('0 °F')).not.toBeInTheDocument();
  });

  it('keeps valid temperatures and metrics when one field or code is unavailable', () => {
    render(
      <CurrentWeather
        city={mockCity}
        current={{ ...current, weatherCode: 999, humidityPercent: null, windSpeedKmh: 0 }}
        unit="celsius"
      />,
    );

    expect(screen.getByText('18 °C')).toBeInTheDocument();
    expect(screen.getByText('Condição indisponível')).toBeInTheDocument();
    const humidity = screen.getByText('Umidade').parentElement;
    expect(humidity).not.toBeNull();
    if (humidity) expect(within(humidity).getByText('Indisponível')).toBeInTheDocument();
    expect(screen.getByText('0 km/h')).toBeInTheDocument();
    expect(screen.getByText('0 mm')).toBeInTheDocument();
  });

  it('falls back to coordinates when region and country are absent', () => {
    render(
      <CurrentWeather
        city={{ ...mockCity, admin1: null, country: null }}
        current={current}
        unit="celsius"
      />,
    );

    expect(screen.getByText('41.1496, -8.6109')).toBeInTheDocument();
  });
});
