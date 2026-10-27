export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: string;
  name: string;
  admin1: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperatureC: number | null;
  weatherCode: number | null;
  humidityPercent: number | null;
  windSpeedKmh: number | null;
  precipitationMm: number | null;
  pressureHpa: number | null;
  referenceTime: string | null;
  timezone: string | null;
  utcOffsetSeconds: number | null;
}

export interface ForecastDay {
  date: string;
  weatherCode: number | null;
  temperatureMinC: number | null;
  temperatureMaxC: number | null;
  precipitationProbabilityPercent: number | null;
}

export interface WeatherData {
  current: CurrentWeather;
  days: ForecastDay[];
}

export type RequestError =
  | { kind: 'network' }
  | { kind: 'api'; message?: string }
  | { kind: 'timeout' }
  | { kind: 'invalid-response' };

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'success'; query: string; results: City[] }
  | { status: 'empty'; query: string }
  | { status: 'error'; query: string; error: RequestError };

export type WeatherState =
  | { status: 'idle' }
  | { status: 'loading'; city: City }
  | { status: 'success'; city: City; data: WeatherData }
  | { status: 'empty'; city: City; message: string }
  | { status: 'error'; city: City; error: RequestError };

// Dados ficticios com datas fixas para desenvolver a UI sem chamadas a API.
export const mockCity: City = {
  id: 'porto-41.1496--8.6109',
  name: 'Porto',
  admin1: 'Porto',
  country: 'Portugal',
  latitude: 41.1496,
  longitude: -8.6109,
};

export const mockWeatherData: WeatherData = {
  current: {
    temperatureC: 18.5,
    weatherCode: 2,
    humidityPercent: 65,
    windSpeedKmh: 12.5,
    precipitationMm: 0,
    pressureHpa: 1013.2,
    referenceTime: '2026-10-27T14:00:00+00:00',
    timezone: 'Europe/Lisbon',
    utcOffsetSeconds: 0,
  },
  days: [
    {
      date: '2026-10-27',
      weatherCode: 2,
      temperatureMinC: 13,
      temperatureMaxC: 20,
      precipitationProbabilityPercent: 10,
    },
    {
      date: '2026-10-28',
      weatherCode: 0,
      temperatureMinC: 12.5,
      temperatureMaxC: 21,
      precipitationProbabilityPercent: 0,
    },
    {
      date: '2026-10-29',
      weatherCode: 3,
      temperatureMinC: 14,
      temperatureMaxC: 19,
      precipitationProbabilityPercent: 30,
    },
    {
      date: '2026-10-30',
      weatherCode: 61,
      temperatureMinC: 13.5,
      temperatureMaxC: 17,
      precipitationProbabilityPercent: 80,
    },
    {
      date: '2026-10-31',
      weatherCode: 80,
      temperatureMinC: 12,
      temperatureMaxC: 18,
      precipitationProbabilityPercent: 100,
    },
  ],
};
