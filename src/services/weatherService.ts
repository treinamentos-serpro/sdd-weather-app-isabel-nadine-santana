import type { City, ForecastDay, WeatherData } from '../types/weather';

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

export async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (isRecord(error) && error.name === 'AbortError') {
      throw new WeatherServiceError('A requisição demorou demais.');
    }
    throw new WeatherServiceError('Falha de rede.');
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
    throw new WeatherServiceError('Resposta de busca de cidades invalida.');
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

  const response = await fetchWithTimeout(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`,
  );
  if (!response.ok) {
    throw new WeatherServiceError(`Falha ao buscar cidades (HTTP ${response.status}).`);
  }

  const data: unknown = await response.json();
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new WeatherServiceError('Resposta de busca de cidades invalida.');
  }
  if (!('results' in data)) return [];
  if (!Array.isArray(data.results)) {
    throw new WeatherServiceError('Resposta de busca de cidades invalida.');
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
  const response = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) {
    throw new WeatherServiceError(`Falha ao consultar o clima (HTTP ${response.status}).`);
  }

  const data: unknown = await response.json();
  if (!isRecord(data) || !isRecord(data.current) || !isRecord(data.daily)) {
    throw new WeatherServiceError('Resposta meteorologica incompleta: current ou daily ausente.');
  }

  const { current, daily } = data;
  if (!Array.isArray(daily.time) || daily.time.length < 5) {
    throw new WeatherServiceError('Resposta meteorologica incompleta: datas da previsao ausentes.');
  }

  const days: ForecastDay[] = daily.time.slice(0, 5).map((date: unknown, index: number) => {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new WeatherServiceError('Resposta meteorologica invalida: data da previsao.');
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
      referenceTime: typeof current.time === 'string' ? current.time : null,
      timezone: typeof data.timezone === 'string' ? data.timezone : null,
      utcOffsetSeconds: numberOrNull(data.utc_offset_seconds),
    },
    days,
  };
}
