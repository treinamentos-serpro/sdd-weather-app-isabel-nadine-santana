import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import { type City, mockCity, mockWeatherData, type WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/services/weatherService')>()),
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));

const otherCity: City = { ...mockCity, id: 'lisbon', name: 'Lisboa', latitude: 38.72 };
const otherWeather: WeatherData = {
  ...mockWeatherData,
  current: { ...mockWeatherData.current, temperatureC: 25 },
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(searchCities).mockResolvedValue([mockCity, otherCity]);
  vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
});

describe('useWeather', () => {
  it('starts idle and retry does nothing before an operation', async () => {
    const { result } = renderHook(() => useWeather());
    expect(result.current).toMatchObject({
      status: 'idle',
      city: null,
      data: null,
      cities: [],
      error: null,
      query: '',
    });
    await act(() => result.current.retry());
    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('normalizes search, keeps all cities and loads the first city automatically', async () => {
    const pending = deferred<City[]>();
    vi.mocked(searchCities).mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => useWeather());
    let request!: Promise<void>;
    act(() => {
      request = result.current.search('  Porto  ');
    });
    expect(result.current).toMatchObject({ status: 'loading', query: 'Porto', data: null });
    expect(searchCities).toHaveBeenCalledExactlyOnceWith('Porto');

    await act(async () => {
      pending.resolve([mockCity, otherCity]);
      await request;
    });
    expect(getWeather).toHaveBeenCalledExactlyOnceWith(mockCity);
    expect(result.current).toMatchObject({
      status: 'success',
      data: mockWeatherData,
      cities: [mockCity, otherCity],
      error: null,
    });
  });

  it('returns empty without forecast when no cities match', async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('Desconhecida'));
    expect(result.current).toMatchObject({ status: 'empty', cities: [], data: null, error: null });
    expect(getWeather).not.toHaveBeenCalled();
  });

  it.each(['', ' \t '])('validates empty search %j without network', async (query) => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search(query));
    expect(result.current).toMatchObject({
      status: 'error',
      query: '',
      data: null,
      error: 'O nome da cidade é obrigatório.',
    });
    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('selects another city without searching again and preserves the query and cities', async () => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('Porto'));
    vi.mocked(getWeather).mockResolvedValueOnce(otherWeather);
    await act(() => result.current.selectCity(otherCity));
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenLastCalledWith(otherCity);
    expect(result.current).toMatchObject({
      status: 'success',
      data: otherWeather,
      query: 'Porto',
      cities: [mockCity, otherCity],
    });
  });

  it('exposes service errors and retries the last search with its normalized query', async () => {
    vi.mocked(searchCities).mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'));
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('  Porto  '));
    expect(result.current).toMatchObject({ status: 'error', error: 'Falha de rede.', data: null });
    await act(() => result.current.retry());
    expect(searchCities).toHaveBeenNthCalledWith(2, 'Porto');
    expect(result.current).toMatchObject({ status: 'success', error: null, data: mockWeatherData });
  });

  it('repeats the complete search when its forecast failed', async () => {
    vi.mocked(getWeather).mockRejectedValueOnce(
      new WeatherServiceError('A requisição demorou demais.'),
    );
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('Porto'));
    expect(result.current.error).toBe('A requisição demorou demais.');
    await act(() => result.current.retry());
    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
  });

  it('retries only forecast after explicit selection and clears old data and errors', async () => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('Porto'));
    vi.mocked(getWeather).mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'));
    await act(() => result.current.selectCity(otherCity));
    expect(result.current).toMatchObject({ status: 'error', data: null, error: 'Falha de rede.' });
    const pending = deferred<WeatherData>();
    vi.mocked(getWeather).mockReturnValueOnce(pending.promise);
    let request!: Promise<void>;
    act(() => {
      request = result.current.retry();
    });
    expect(result.current).toMatchObject({ status: 'loading', data: null, error: null });
    await act(async () => {
      pending.resolve(otherWeather);
      await request;
    });
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenLastCalledWith(otherCity);
    expect(result.current).toMatchObject({ status: 'success', data: otherWeather, error: null });
  });

  it('uses an explicit error message for unexpected rejections', async () => {
    vi.mocked(searchCities).mockRejectedValueOnce(null);
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('Porto'));
    expect(result.current).toMatchObject({
      status: 'error',
      error: 'Não foi possível consultar o clima.',
    });
  });

  it.each([
    'resolve',
    'reject',
  ] as const)('ignores a stale search that %s after a newer search', async (outcome) => {
    const pending = deferred<City[]>();
    vi.mocked(searchCities).mockReturnValueOnce(pending.promise).mockResolvedValueOnce([otherCity]);
    const { result } = renderHook(() => useWeather());
    let request!: Promise<void>;
    act(() => {
      request = result.current.search('Porto');
    });
    await act(() => result.current.search('Lisboa'));
    await act(async () => {
      if (outcome === 'resolve') pending.resolve([mockCity]);
      else pending.reject(new Error('Erro antigo'));
      await request;
    });
    expect(getWeather).toHaveBeenCalledExactlyOnceWith(otherCity);
    expect(result.current).toMatchObject({
      status: 'success',
      query: 'Lisboa',
      cities: [otherCity],
      error: null,
    });
    await act(() => result.current.retry());
    expect(searchCities).toHaveBeenLastCalledWith('Lisboa');
  });

  it.each([
    'resolve',
    'reject',
  ] as const)('ignores a stale forecast that %s after a new selection', async (outcome) => {
    const pending = deferred<WeatherData>();
    vi.mocked(getWeather).mockReturnValueOnce(pending.promise).mockResolvedValueOnce(otherWeather);
    const { result } = renderHook(() => useWeather());
    let request!: Promise<void>;
    act(() => {
      request = result.current.selectCity(mockCity);
    });
    await act(() => result.current.selectCity(otherCity));
    await act(async () => {
      if (outcome === 'resolve') pending.resolve(mockWeatherData);
      else pending.reject(new Error('Erro antigo'));
      await request;
    });
    expect(result.current).toMatchObject({ status: 'success', data: otherWeather, error: null });
  });

  it('does not start forecast when unmounted during search', async () => {
    const pending = deferred<City[]>();
    vi.mocked(searchCities).mockReturnValueOnce(pending.promise);
    const { result, unmount } = renderHook(() => useWeather());
    let request!: Promise<void>;
    act(() => {
      request = result.current.search('Porto');
    });
    unmount();
    await act(async () => {
      pending.resolve([mockCity]);
      await request;
    });
    expect(getWeather).not.toHaveBeenCalled();
  });
});
