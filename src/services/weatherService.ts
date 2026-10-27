import type { City, ForecastDay, WeatherData } from '../types/weather';
import { isValidIsoDate } from '../lib/format';

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

interface RequestMessages {
  failure: string;
  timeout: string;
}

const searchMessages: RequestMessages = {
  failure: 'Não foi possível concluir a busca. Tente novamente.',
  timeout: 'A busca demorou demais. Tente novamente.',
};

const weatherMessages: RequestMessages = {
  failure: 'Não foi possível carregar o clima. Tente novamente.',
  timeout: 'A consulta demorou demais. Tente novamente.',
};

export async function fetchWithTimeout<T>(
  url: string,
  readResponse: (response: Response) => Promise<T>,
  messages: RequestMessages,
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 10_000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return await readResponse(response);
  } catch (error) {
    if (error instanceof WeatherServiceError) {
      throw error;
    }
    if (
      timedOut ||
      (typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        error.name === 'AbortError')
    ) {
      throw new WeatherServiceError(messages.timeout);
    }
    throw new WeatherServiceError(messages.failure);
  } finally {
    clearTimeout(timeout);
  }
}

function mapCity(result: unknown): City {
  if (
    typeof result !== 'object' ||
    result === null ||
    !('id' in result) ||
    typeof result.id !== 'number' ||
    !Number.isFinite(result.id) ||
    !('name' in result) ||
    typeof result.name !== 'string' ||
    !('latitude' in result) ||
    typeof result.latitude !== 'number' ||
    !Number.isFinite(result.latitude) ||
    !('longitude' in result) ||
    typeof result.longitude !== 'number' ||
    !Number.isFinite(result.longitude)
  ) {
    throw new WeatherServiceError(searchMessages.failure);
  }

  return {
    id: String(result.id),
    name: result.name,
    admin1: 'admin1' in result && typeof result.admin1 === 'string' ? result.admin1 : null,
    country: 'country' in result && typeof result.country === 'string' ? result.country : null,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (!query) return [];

  const data: unknown = await fetchWithTimeout(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`,
    async (response) => {
      if (!response.ok) throw new WeatherServiceError(searchMessages.failure);
      return response.json();
    },
    searchMessages,
  );
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new WeatherServiceError(searchMessages.failure);
  }
  if (!('results' in data)) return [];
  if (!Array.isArray(data.results)) {
    throw new WeatherServiceError(searchMessages.failure);
  }

  return data.results.map(mapCity);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function dailyNumber(values: unknown, index: number): number | null {
  return Array.isArray(values) ? numberOrNull(values[index]) : null;
}

function dateTimeOrNull(value: unknown): string | null {
  if (
    typeof value !== 'string' ||
    !isValidIsoDate(value.slice(0, 10)) ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?$/i.test(value)
  ) {
    return null;
  }
  const hasOffset = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  const date = new Date(hasOffset ? value : `${value}Z`);
  return Number.isFinite(date.getTime()) ? value : null;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure',
    daily: 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    timezone: 'auto',
    forecast_days: '5',
  });
  const data: unknown = await fetchWithTimeout(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    async (response) => {
      if (!response.ok) throw new WeatherServiceError(weatherMessages.failure);
      return response.json();
    },
    weatherMessages,
  );
  if (!isRecord(data) || !isRecord(data.current) || !isRecord(data.daily)) {
    throw new WeatherServiceError(weatherMessages.failure);
  }

  const { current, daily } = data;
  if (!Array.isArray(daily.time) || daily.time.length < 5) {
    throw new WeatherServiceError(weatherMessages.failure);
  }

  const days: ForecastDay[] = daily.time.slice(0, 5).map((date: unknown, index: number) => {
    if (!isValidIsoDate(date)) {
      throw new WeatherServiceError(weatherMessages.failure);
    }
    const probability = dailyNumber(daily.precipitation_probability_max, index);
    return {
      date,
      weatherCode: dailyNumber(daily.weather_code, index),
      temperatureMinC: dailyNumber(daily.temperature_2m_min, index),
      temperatureMaxC: dailyNumber(daily.temperature_2m_max, index),
      precipitationProbabilityPercent:
        probability !== null && probability >= 0 && probability <= 100 ? probability : null,
    };
  });

  return {
    current: {
      temperatureC: numberOrNull(current.temperature_2m),
      weatherCode: numberOrNull(current.weather_code),
      humidityPercent: numberOrNull(current.relative_humidity_2m),
      windSpeedKmh: numberOrNull(current.wind_speed_10m),
      precipitationMm: numberOrNull(current.precipitation),
      pressureHpa: numberOrNull(current.surface_pressure),
      referenceTime: dateTimeOrNull(current.time),
      timezone: stringOrNull(data.timezone),
      utcOffsetSeconds: numberOrNull(data.utc_offset_seconds),
    },
    days,
  };
}
