import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastList from '../../src/components/ForecastList';
import { mockWeatherData } from '../../src/types/weather';

describe('ForecastList', () => {
  it('renders exactly five days in order with the required responsive grid', () => {
    render(<ForecastList days={mockWeatherData.days} unit="celsius" />);

    const region = screen.getByRole('region', { name: 'Previsão de 5 dias' });
    const list = within(region).getByRole('list');
    expect(list).toHaveClass('grid', 'grid-cols-2', 'sm:grid-cols-3', 'lg:grid-cols-5');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(5);
    const expected = [
      ['terça-feira, 27/10/2026', '20 °C', '13 °C', '10 %'],
      ['quarta-feira, 28/10/2026', '21 °C', '12,5 °C', '0 %'],
      ['quinta-feira, 29/10/2026', '19 °C', '14 °C', '30 %'],
      ['sexta-feira, 30/10/2026', '17 °C', '13,5 °C', '80 %'],
      ['sábado, 31/10/2026', '18 °C', '12 °C', '100 %'],
    ];

    for (const [index, values] of expected.entries()) {
      for (const value of values) expect(within(items[index]).getByText(value)).toBeInTheDocument();
    }
  });

  it('passes the current unit to every card', () => {
    const { rerender } = render(<ForecastList days={mockWeatherData.days} unit="fahrenheit" />);
    expect(screen.getAllByText(/°F$/)).toHaveLength(10);
    expect(screen.queryByText(/°C$/)).not.toBeInTheDocument();
    expect(screen.getByText('100 %')).toBeInTheDocument();

    rerender(<ForecastList days={mockWeatherData.days} unit="celsius" />);
    expect(screen.getAllByText(/°C$/)).toHaveLength(10);
    expect(screen.queryByText(/°F$/)).not.toBeInTheDocument();
  });

  it('keeps all days when one day contains missing or unknown fields', () => {
    const days = mockWeatherData.days.map((day, index) =>
      index === 1
        ? { ...day, temperatureMinC: null, weatherCode: 999, precipitationProbabilityPercent: null }
        : day,
    );
    render(<ForecastList days={days} unit="celsius" />);

    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    const card = screen.getByRole('article', { name: 'quarta-feira, 28/10/2026' });
    expect(within(card).getByText('21 °C')).toBeInTheDocument();
    expect(within(card).getByText('Condição indisponível')).toBeInTheDocument();
    expect(within(card).getAllByText('Indisponível')).toHaveLength(2);
  });

  it('reports an empty forecast without inventing days', () => {
    render(<ForecastList days={[]} unit="celsius" />);

    expect(screen.getByRole('status')).toHaveTextContent('Previsão indisponível.');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });
});
