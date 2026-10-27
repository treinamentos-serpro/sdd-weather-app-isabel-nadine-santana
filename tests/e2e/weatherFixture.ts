import type { Page } from '@playwright/test';
import { mockCity, mockWeatherData } from '../../src/types/weather';

export async function mockWeatherApi(page: Page) {
  const { current, days } = mockWeatherData;
  await page.route('https://geocoding-api.open-meteo.com/**', (route) => {
    const name = new URL(route.request().url()).searchParams.get('name');
    if (name === 'Erro') return route.fulfill({ status: 500, body: '{}' });
    return route.fulfill({
      json: {
        results: name === 'Vazio' ? [] : [{ ...mockCity, id: 1 }],
      },
    });
  });
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({
      json: {
        timezone: current.timezone,
        utc_offset_seconds: current.utcOffsetSeconds,
        current: {
          time: current.referenceTime,
          temperature_2m: current.temperatureC,
          weather_code: current.weatherCode,
          relative_humidity_2m: current.humidityPercent,
          wind_speed_10m: current.windSpeedKmh,
          precipitation: current.precipitationMm,
          surface_pressure: current.pressureHpa,
        },
        daily: {
          time: days.map((day) => day.date),
          weather_code: days.map((day) => day.weatherCode),
          temperature_2m_min: days.map((day) => day.temperatureMinC),
          temperature_2m_max: days.map((day) => day.temperatureMaxC),
          precipitation_probability_max: days.map((day) => day.precipitationProbabilityPercent),
        },
      },
    }),
  );
}

export async function searchCity(page: Page, name: string) {
  await page.getByLabel('Nome da cidade').fill(name);
  await page.getByLabel('Nome da cidade').press('Enter');
}
