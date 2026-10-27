import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import { mockCity, mockWeatherData, type WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/services/weatherService')>()),
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(searchCities).mockResolvedValue([{ ...mockCity, name: 'Lisboa' }]);
  vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
});

async function submitSearch(name = 'Lisboa') {
  const user = userEvent.setup();
  await user.clear(screen.getByLabelText('Nome da cidade'));
  await user.type(screen.getByLabelText('Nome da cidade'), `${name}{Enter}`);
  return user;
}

describe('App', () => {
  it('starts idle with Celsius and no demo controls or network calls', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'SDD Weather' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Consulte o clima de uma cidade' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.queryByRole('group', { name: 'Estados de demonstração' }),
    ).not.toBeInTheDocument();
    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('validates empty input without calling the service', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByRole('alert')).toHaveTextContent('O nome da cidade é obrigatório.');
    expect(screen.getByLabelText('Nome da cidade')).toHaveFocus();
    expect(searchCities).not.toHaveBeenCalled();
  });

  it('shows loading exclusively until forecast resolves, then presents the returned city', async () => {
    let resolve!: (data: WeatherData) => void;
    vi.mocked(getWeather).mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      }),
    );
    render(<App />);
    await submitSearch('  Lisboa  ');
    expect(screen.getByRole('status')).toHaveTextContent('Carregando dados meteorológicos...');
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    expect(screen.getByLabelText('Nome da cidade')).toBeDisabled();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Consulte o clima de uma cidade' }),
    ).not.toBeInTheDocument();
    await act(async () => {
      resolve(mockWeatherData);
    });
    expect(screen.getByRole('heading', { name: 'Lisboa' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveFocus();
    expect(searchCities).toHaveBeenCalledExactlyOnceWith('Lisboa');
  });

  it('renders empty distinctly from error and announces the result', async () => {
    vi.mocked(searchCities).mockResolvedValueOnce([]);
    const { container } = render(<App />);
    await submitSearch();
    expect(screen.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      'Nenhuma cidade encontrada',
    );
    expect(screen.getByRole('main')).toHaveFocus();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('shows service error and retries the last search through ErrorState', async () => {
    vi.mocked(searchCities).mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'));
    render(<App />);
    const user = await submitSearch();
    expect(screen.getByRole('alert')).toHaveTextContent('Falha de rede.');
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(screen.getByRole('heading', { name: 'Lisboa' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveFocus();
    expect(searchCities).toHaveBeenNthCalledWith(2, 'Lisboa');
  });

  it('keeps UI unit through errors and retry, converts all temperatures without fetching, and resets on remount', async () => {
    const snapshot = structuredClone(mockWeatherData);
    const { container, unmount } = render(<App />);
    const user = await submitSearch();
    const main = within(screen.getByRole('main'));
    expect(main.getAllByText(/°C$/)).toHaveLength(11);
    await user.click(screen.getByRole('button', { name: '°F' }));
    expect(main.getAllByText(/°F$/)).toHaveLength(11);
    expect(main.getByText('65,3 °F')).toBeInTheDocument();
    expect(main.getByText('68 °F')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°F' })).toHaveFocus();
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      'Clima de Lisboa disponível. Temperaturas em Fahrenheit.',
    );
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(1);

    vi.mocked(getWeather).mockRejectedValueOnce(
      new WeatherServiceError('A requisição demorou demais.'),
    );
    await submitSearch('Porto');
    expect(screen.getByRole('alert')).toHaveTextContent('A requisição demorou demais.');
    expect(main.queryByRole('article')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(main.getAllByText(/°F$/)).toHaveLength(11);
    await user.click(screen.getByRole('button', { name: '°C' }));
    expect(main.getAllByText(/°C$/)).toHaveLength(11);
    expect(mockWeatherData).toEqual(snapshot);
    unmount();
    render(<App />);
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');
  });
});
