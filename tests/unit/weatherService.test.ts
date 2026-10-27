import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchWithTimeout,
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const city: City = {
  id: '3448439',
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.63,
};

function forecastResponse() {
  return {
    timezone: 'America/Sao_Paulo',
    utc_offset_seconds: -10800,
    current: {
      time: '2026-10-27T14:15',
      temperature_2m: 21.4,
      weather_code: 0,
      relative_humidity_2m: 65,
      wind_speed_10m: 12.5,
      precipitation: 0,
      surface_pressure: 1013.2,
    },
    daily: {
      time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
      weather_code: [0, 2, 61, 80, 95],
      temperature_2m_min: [0, 13, 14, 15, 16],
      temperature_2m_max: [20, 21, 22, 23, 24],
      precipitation_probability_max: [0, 10, 40, 80, 100],
    },
  };
}

describe('getWeather', () => {
  it('requests forecast parameters and maps current and five parallel daily entries', async () => {
    const data = forecastResponse();
    data.daily.time.push('2026-11-01');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(data)));
    vi.stubGlobal('fetch', fetchMock);

    const weather = await getWeather(city);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      latitude: '-23.55',
      longitude: '-46.63',
      current:
        'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure',
      daily: 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max',
      temperature_unit: 'celsius',
      wind_speed_unit: 'kmh',
      precipitation_unit: 'mm',
      timezone: 'auto',
      forecast_days: '5',
    });
    expect(weather.current).toEqual({
      temperatureC: 21.4,
      weatherCode: 0,
      humidityPercent: 65,
      windSpeedKmh: 12.5,
      precipitationMm: 0,
      pressureHpa: 1013.2,
      referenceTime: '2026-10-27T14:15',
      timezone: 'America/Sao_Paulo',
      utcOffsetSeconds: -10800,
    });
    expect(weather.days).toEqual([
      {
        date: '2026-10-27',
        weatherCode: 0,
        temperatureMinC: 0,
        temperatureMaxC: 20,
        precipitationProbabilityPercent: 0,
      },
      {
        date: '2026-10-28',
        weatherCode: 2,
        temperatureMinC: 13,
        temperatureMaxC: 21,
        precipitationProbabilityPercent: 10,
      },
      {
        date: '2026-10-29',
        weatherCode: 61,
        temperatureMinC: 14,
        temperatureMaxC: 22,
        precipitationProbabilityPercent: 40,
      },
      {
        date: '2026-10-30',
        weatherCode: 80,
        temperatureMinC: 15,
        temperatureMaxC: 23,
        precipitationProbabilityPercent: 80,
      },
      {
        date: '2026-10-31',
        weatherCode: 95,
        temperatureMinC: 16,
        temperatureMaxC: 24,
        precipitationProbabilityPercent: 100,
      },
    ]);
  });

  it('keeps missing values null without shifting daily indices or inventing current values', async () => {
    const data = {
      current: { precipitation: null },
      daily: {
        time: forecastResponse().daily.time,
        temperature_2m_min: [0, null, 14],
        temperature_2m_max: [20, 21, 'invalid', 23, 24],
        precipitation_probability_max: [-1, 101, 0, null, 100],
      },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(data))));

    const weather = await getWeather(city);

    expect(weather.current).toEqual({
      temperatureC: null,
      weatherCode: null,
      humidityPercent: null,
      windSpeedKmh: null,
      precipitationMm: null,
      pressureHpa: null,
      referenceTime: null,
      timezone: null,
      utcOffsetSeconds: null,
    });
    expect(weather.days).toHaveLength(5);
    expect(weather.days.map((day) => day.temperatureMinC)).toEqual([0, null, 14, null, null]);
    expect(weather.days.map((day) => day.temperatureMaxC)).toEqual([20, 21, null, 23, 24]);
    expect(weather.days.map((day) => day.weatherCode)).toEqual([null, null, null, null, null]);
    expect(weather.days.map((day) => day.precipitationProbabilityPercent)).toEqual([
      null,
      null,
      0,
      null,
      100,
    ]);
  });

  it.each([
    null,
    [],
    {},
    { current: {} },
    { daily: {} },
    { current: null, daily: {} },
    { current: {}, daily: null },
    { current: [], daily: {} },
    { current: {}, daily: [] },
    { current: {}, daily: {} },
    { current: {}, daily: { time: ['2026-10-27'] } },
    {
      current: {},
      daily: { time: ['2026-02-30', '2026-03-01', '2026-03-02', '2026-03-03', '2026-03-04'] },
    },
    {
      current: {},
      daily: { time: ['2026-10-27', null, '2026-10-29', '2026-10-30', '2026-10-31'] },
    },
  ])('throws WeatherServiceError for incomplete or invalid responses: %j', async (data) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(data))));

    await expect(getWeather(city)).rejects.toThrow(WeatherServiceError);
  });

  it.each([400, 429, 500])('shows a friendly message for HTTP %i', async (status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('erro', { status })));

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Não foi possível carregar o clima. Tente novamente.',
    });
  });

  it('converts network failures into WeatherServiceError', async () => {
    const error = new TypeError('Failed to fetch');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Não foi possível carregar o clima. Tente novamente.',
    });
  });
});

describe('searchCities', () => {
  it.each(['', '   ', '\t\n'])('returns no cities without fetching for %j', async (name) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities(name)).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('encodes the trimmed name and maps results to cities', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              id: 3448439,
              name: 'São Paulo',
              admin1: 'São Paulo',
              country: 'Brasil',
              latitude: -23.55,
              longitude: -46.63,
              timezone: 'America/Sao_Paulo',
            },
            { id: 2, name: 'Sao Paulo', latitude: 0, longitude: 0 },
          ],
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('  São Paulo & região  ')).resolves.toEqual([
      {
        id: '3448439',
        name: 'São Paulo',
        admin1: 'São Paulo',
        country: 'Brasil',
        latitude: -23.55,
        longitude: -46.63,
      },
      {
        id: '2',
        name: 'Sao Paulo',
        admin1: null,
        country: null,
        latitude: 0,
        longitude: 0,
      },
    ]);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      'https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o%20Paulo%20%26%20regi%C3%A3o&count=10&language=pt&format=json',
      { signal: expect.any(AbortSignal) },
    );
  });

  it.each([{ results: [] }, {}])('returns no cities for %j', async (data) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(data))));

    await expect(searchCities('Cidade inexistente')).resolves.toEqual([]);
  });

  it.each([400, 429, 500])('shows a friendly message for HTTP %i', async (status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('erro', { status })));

    await expect(searchCities('Porto')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Não foi possível concluir a busca. Tente novamente.',
    });
  });

  it('converts network failures into WeatherServiceError instead of returning an empty list', async () => {
    const error = new TypeError('Failed to fetch');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));

    await expect(searchCities('Porto')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Não foi possível concluir a busca. Tente novamente.',
    });
  });

  it.each([
    null,
    [],
    { results: null },
    { results: [{}] },
  ])('rejects malformed responses: %j', async (data) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(data))));

    await expect(searchCities('Porto')).rejects.toThrow(WeatherServiceError);
  });
});

describe('fetchWithTimeout', () => {
  const messages = {
    failure: 'Falha ao carregar.',
    timeout: 'A solicitação demorou demais.',
  };

  it.each([200, 500])('clears the timer when fetch resolves with HTTP %i', async (status) => {
    vi.useFakeTimers();
    const response = new Response('{}', { status });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      fetchWithTimeout('https://example.com', async (result) => result, messages),
    ).resolves.toBe(response);

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('https://example.com', {
      signal: expect.any(AbortSignal),
    });
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(false);
  });

  it.each([
    [new DOMException('Aborted', 'AbortError'), messages.timeout],
    [new TypeError('Failed to fetch'), messages.failure],
  ])('converts %s and clears the timer after rejection', async (error, message) => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));

    await expect(
      fetchWithTimeout('https://example.com', async (response) => response, messages),
    ).rejects.toMatchObject({ name: 'WeatherServiceError', message });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps the timeout active while reading the response body', async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const response = new Response('{}');
    vi.spyOn(response, 'json').mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        }),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, options: RequestInit) => {
        signal = options.signal ?? undefined;
        return Promise.resolve(response);
      }),
    );

    const pending = fetchWithTimeout('https://example.com', (result) => result.json(), messages);
    const rejection = expect(pending).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: messages.timeout,
    });
    await vi.advanceTimersByTimeAsync(10_000);
    await rejection;
    expect(signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    ['searchCities', () => searchCities('Porto')],
    ['getWeather', () => getWeather(city)],
  ])('aborts %s at exactly 10 seconds and clears the timer', async (_name, request) => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, options: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            signal = options.signal ?? undefined;
            signal?.addEventListener(
              'abort',
              () => reject(new DOMException('Aborted', 'AbortError')),
              { once: true },
            );
          }),
      ),
    );

    const pending = request();
    const rejection = expect(pending).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message:
        _name === 'searchCities'
          ? 'A busca demorou demais. Tente novamente.'
          : 'A consulta demorou demais. Tente novamente.',
    });
    await vi.advanceTimersByTimeAsync(9_999);
    expect(signal?.aborted).toBe(false);
    expect(vi.getTimerCount()).toBe(1);

    await vi.advanceTimersByTimeAsync(1);
    await rejection;
    expect(signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});
