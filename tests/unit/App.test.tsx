import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../../src/App';
import { mockWeatherData } from '../../src/types/weather';

describe('App', () => {
  it('starts idle with the header, search and Celsius selected', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'SDD Weather' })).toBeInTheDocument();
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('heading', { name: 'Consulte o clima de uma cidade' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Porto' })).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows only the selected demo state and recovers from an error with retry', async () => {
    const user = userEvent.setup();
    render(<App />);
    const demo = within(screen.getByRole('group', { name: 'Estados de demonstração' }));

    await user.click(demo.getByRole('button', { name: 'Sucesso' }));
    expect(screen.getByRole('heading', { name: 'Porto' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);

    await user.click(demo.getByRole('button', { name: 'Carregando' }));
    expect(screen.getByRole('status')).toHaveTextContent('Carregando o clima de Porto...');
    expect(screen.getByLabelText('Nome da cidade')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Porto' })).not.toBeInTheDocument();

    await user.click(demo.getByRole('button', { name: 'Sem dados' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Dados meteorológicos indisponíveis' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Nome da cidade')).toBeEnabled();

    await user.click(demo.getByRole('button', { name: 'Erro' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar o clima.');
    expect(
      screen.queryByRole('heading', { name: 'Dados meteorológicos indisponíveis' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(screen.getByRole('main')).toHaveFocus();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Porto' })).toBeInTheDocument();
    expect(demo.getByRole('button', { name: 'Sucesso' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(demo.getByRole('button', { name: 'Inicial' }));
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Consulte o clima de uma cidade' }),
    ).toBeInTheDocument();
  });

  it('uses the Porto mock for any valid search and keeps empty input idle', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByRole('alert')).toHaveTextContent('O nome da cidade é obrigatório.');
    expect(screen.queryByRole('heading', { name: 'Porto' })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Nome da cidade'), '  Lisboa  {Enter}');
    expect(screen.getByRole('main')).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Porto' })).toBeInTheDocument();
    expect(
      screen.getByText(/qualquer busca válida mostra dados fictícios de Porto/),
    ).toBeInTheDocument();
  });

  it('announces empty and successful results without moving focus from demo controls or units', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const announcement = container.querySelector('[aria-live="polite"]');
    expect(announcement).toBeEmptyDOMElement();
    const demo = within(screen.getByRole('group', { name: 'Estados de demonstração' }));

    await user.click(demo.getByRole('button', { name: 'Sem dados' }));
    expect(announcement).toHaveTextContent('Dados meteorológicos indisponíveis');
    expect(demo.getByRole('button', { name: 'Sem dados' })).toHaveFocus();

    await user.click(demo.getByRole('button', { name: 'Sucesso' }));
    expect(demo.getByRole('button', { name: 'Sucesso' })).toHaveFocus();
    expect(announcement).toHaveTextContent('Clima de Porto disponível. Temperaturas em Celsius.');

    await user.click(screen.getByRole('button', { name: '°F' }));
    expect(screen.getByRole('button', { name: '°F' })).toHaveFocus();
    expect(announcement).toHaveTextContent(
      'Clima de Porto disponível. Temperaturas em Fahrenheit.',
    );
  });

  it('converts all eleven temperatures on render and preserves UI unit across states', async () => {
    const user = userEvent.setup();
    const snapshot = structuredClone(mockWeatherData);
    const { unmount } = render(<App />);
    const demo = within(screen.getByRole('group', { name: 'Estados de demonstração' }));
    await user.click(demo.getByRole('button', { name: 'Sucesso' }));
    const main = within(screen.getByRole('main'));
    expect(main.getAllByText(/°C$/)).toHaveLength(11);

    await user.click(screen.getByRole('button', { name: '°F' }));
    expect(main.getAllByText(/°F$/)).toHaveLength(11);
    expect(main.queryByText(/°C$/)).not.toBeInTheDocument();
    expect(main.getByText('65,3 °F')).toBeInTheDocument();
    expect(main.getByText('68 °F')).toBeInTheDocument();
    expect(main.getByText('12,5 km/h')).toBeInTheDocument();
    expect(main.getByText('100 %')).toBeInTheDocument();

    await user.click(demo.getByRole('button', { name: 'Erro' }));
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(main.getAllByText(/°F$/)).toHaveLength(11);
    await user.click(screen.getByRole('button', { name: '°C' }));
    expect(main.getAllByText(/°C$/)).toHaveLength(11);
    expect(mockWeatherData).toEqual(snapshot);

    await user.click(screen.getByRole('button', { name: '°F' }));
    unmount();
    render(<App />);
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');
  });
});
