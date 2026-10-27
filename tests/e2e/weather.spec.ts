import { expect, test } from '@playwright/test';
import { mockWeatherData } from '../../src/types/weather';
import { mockWeatherApi, searchCity } from './weatherFixture';

test.beforeEach(async ({ page }) => {
  await mockWeatherApi(page);
});

test('geocoding without results shows an editable empty state without requesting forecast', async ({
  page,
}) => {
  let forecastCalls = 0;
  page.on('request', (request) => {
    if (request.url().startsWith('https://api.open-meteo.com/')) forecastCalls += 1;
  });
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: {} }),
  );
  await page.goto('/');
  await searchCity(page, 'Cidade inexistente');

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(page.getByRole('searchbox', { name: 'Nome da cidade' })).toBeEditable();
  await page.getByRole('searchbox', { name: 'Nome da cidade' }).fill('Outra cidade');
  expect(forecastCalls).toBe(0);
});

test('search and reversible unit conversion work at 375x812', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Nome da cidade' }).fill('Porto');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  const current = page.getByRole('region', { name: 'Porto', exact: true });
  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias' });
  await expect(current.getByText('18,5 °C', { exact: true })).toBeVisible();
  await expect(forecast.getByRole('article')).toHaveCount(5);
  await page.getByRole('button', { name: '°F', exact: true }).click();
  await expect(current.getByText('65,3 °F', { exact: true })).toBeVisible();
  await expect(forecast.getByText(/°F$/)).toHaveCount(10);
  await page.getByRole('button', { name: '°C', exact: true }).click();
  await expect(current.getByText('18,5 °C', { exact: true })).toBeVisible();
  await expect(forecast.getByText(/°C$/)).toHaveCount(10);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    375,
  );
});

for (const failure of ['http', 'network', 'incomplete'] as const) {
  test(`forecast ${failure} failure removes old data and allows retry`, async ({ page }) => {
    await page.goto('/');
    await searchCity(page, 'Porto');
    await expect(page.getByRole('article')).toHaveCount(5);
    await page.route(
      'https://api.open-meteo.com/**',
      (route) => {
        if (failure === 'network') return route.abort('failed');
        return route.fulfill({
          status: failure === 'http' ? 503 : 200,
          json: {},
        });
      },
      { times: 1 },
    );
    await searchCity(page, 'Porto');

    const message = {
      http: 'Falha ao consultar o clima (HTTP 503).',
      network: 'Falha de rede.',
      incomplete: 'Resposta meteorologica incompleta: current ou daily ausente.',
    }[failure];
    await expect(page.getByRole('alert')).toContainText(message);
    await expect(page.getByRole('status')).toHaveCount(0);
    await expect(page.getByRole('article')).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Porto', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Tentar novamente' }).click();

    await expect(page.getByRole('region', { name: 'Porto', exact: true })).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(5);
    await expect(page.getByRole('alert')).toHaveCount(0);
  });
}

test('partial forecast preserves valid fields and does not convert missing values to zero', async ({
  page,
}) => {
  await mockWeatherApi(page, {
    ...mockWeatherData,
    current: { ...mockWeatherData.current, temperatureC: null, referenceTime: null },
    days: mockWeatherData.days.map((day, index) =>
      index === 4 ? { ...day, temperatureMaxC: null, weatherCode: 999 } : day,
    ),
  });
  await page.goto('/');
  await searchCity(page, 'Porto');

  const current = page.getByRole('region', { name: 'Porto', exact: true });
  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias' });
  const lastDay = forecast.getByRole('article', { name: 'sábado, 31/10/2026' });
  await expect(current.getByText('Temperatura indisponível', { exact: true })).toBeVisible();
  await expect(current.getByText('Referência temporal indisponível')).toBeVisible();
  await expect(forecast.getByRole('article')).toHaveCount(5);
  await expect(lastDay.getByText('Indisponível', { exact: true })).toBeVisible();
  await expect(lastDay.getByText('Condição indisponível')).toBeVisible();
  await expect(lastDay.getByText('12 °C', { exact: true })).toBeVisible();
  await expect(forecast.getByRole('article').first().getByText('20 °C')).toBeVisible();
  await page.getByRole('button', { name: '°F', exact: true }).click();

  await expect(lastDay.getByText('53,6 °F', { exact: true })).toBeVisible();
  await expect(lastDay.getByText('Indisponível', { exact: true })).toBeVisible();
  await expect(current.getByText('Temperatura indisponível', { exact: true })).toBeVisible();
  await expect(current.getByText('32 °F', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('unit selected while forecast is pending applies to all returned temperatures', async ({
  page,
}) => {
  let releaseForecast!: () => void;
  const pending = new Promise<void>((resolve) => {
    releaseForecast = resolve;
  });
  await page.route('https://api.open-meteo.com/**', async (route) => {
    await pending;
    await route.fallback();
  });
  await page.goto('/');
  const request = page.waitForRequest('https://api.open-meteo.com/**');
  await searchCity(page, 'Porto');
  await request;
  await expect(page.getByRole('status')).toContainText('Carregando dados meteorológicos');
  await page.getByRole('button', { name: '°F', exact: true }).click();
  releaseForecast();

  await expect(
    page.getByRole('region', { name: 'Porto', exact: true }).getByText('65,3 °F'),
  ).toBeVisible();
  await expect(page.getByRole('main').getByText(/°F$/)).toHaveCount(11);
  await expect(page.getByRole('main').getByText(/°C$/)).toHaveCount(0);
});

test('forecast timeout ends loading after ten seconds and permits retry', async ({ page }) => {
  await page.clock.install();
  await page.route('https://api.open-meteo.com/**', () => {}, { times: 1 });
  await page.goto('/');
  const request = page.waitForRequest('https://api.open-meteo.com/**');
  await searchCity(page, 'Porto');
  await request;
  await expect(page.getByRole('status')).toContainText('Carregando dados meteorológicos');
  await page.clock.fastForward(10_000);

  await expect(page.getByRole('alert')).toContainText('A requisição demorou demais.');
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(page.getByRole('article')).toHaveCount(0);
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('article')).toHaveCount(5);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('searches a city, displays its forecast and converts zero degrees to Fahrenheit', async ({
  page,
}) => {
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({
      json: {
        results: [
          {
            id: 1,
            name: 'Porto',
            admin1: 'Porto',
            country: 'Portugal',
            latitude: 41.1496,
            longitude: -8.6109,
          },
        ],
      },
    }),
  );
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({
      json: {
        timezone: 'Europe/Lisbon',
        utc_offset_seconds: 0,
        current: {
          time: '2026-10-27T14:00',
          temperature_2m: 0,
          weather_code: 0,
          relative_humidity_2m: 65,
          wind_speed_10m: 12.5,
          precipitation: 0,
          surface_pressure: 1013.2,
        },
        daily: {
          time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
          weather_code: [0, 1, 2, 3, 45],
          temperature_2m_min: [-2, -1, 0, 1, 2],
          temperature_2m_max: [2, 3, 4, 5, 6],
          precipitation_probability_max: [0, 10, 20, 30, 40],
        },
      },
    }),
  );

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Nome da cidade' }).fill('Porto');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Porto', exact: true })).toBeVisible();
  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias', exact: true });
  await expect(forecast).toBeVisible();
  await expect(forecast.getByRole('article')).toHaveCount(5);
  const currentWeather = page.getByRole('region', { name: 'Porto', exact: true });
  await expect(currentWeather.getByText('0 °C', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '°F', exact: true }).click();
  await expect(currentWeather.getByText('32 °F', { exact: true })).toBeVisible();
});

test('search, units, errors, retry and reload use the real hook with intercepted API', async ({
  page,
}) => {
  let forecastCalls = 0;
  page.on('request', (request) => {
    if (request.url().startsWith('https://api.open-meteo.com/')) forecastCalls += 1;
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Consulte o clima de uma cidade' })).toBeVisible();
  await searchCity(page, 'Porto');
  await expect(page.getByRole('heading', { name: 'Porto', exact: true })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(5);
  await page.getByRole('button', { name: '°F', exact: true }).click();
  await expect(page.getByRole('main').getByText(/°F$/)).toHaveCount(11);
  expect(forecastCalls).toBe(1);
  await searchCity(page, 'Erro');
  await expect(page.getByRole('alert')).toContainText('HTTP 500');
  await expect(page.getByRole('article')).toHaveCount(0);
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({
      json: { results: [{ id: 1, name: 'Porto', latitude: 41.15, longitude: -8.61 }] },
    }),
  );
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('main').getByText(/°F$/)).toHaveCount(11);
  expect(forecastCalls).toBe(2);
  await page.reload();
  await expect(page.getByRole('button', { name: '°C', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('heading', { name: 'Consulte o clima de uma cidade' })).toBeVisible();
});

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`request states fit viewport ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    for (const [name, heading] of [
      ['Vazio', 'Nenhuma cidade encontrada'],
      ['Erro', null],
      ['Porto', 'Porto'],
    ] as const) {
      await searchCity(page, name);
      if (heading)
        await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
      else await expect(page.getByRole('alert')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      await expect(page.getByRole('button', { name: 'Buscar', exact: true })).toBeVisible();
    }
    const gridColumns = await page
      .getByRole('list')
      .evaluate((list) => getComputedStyle(list).gridTemplateColumns.split(' ').length);
    expect(gridColumns).toBe(width >= 1024 ? 5 : width >= 640 ? 3 : 2);
    await expect(page.getByRole('article')).toHaveCount(5);
  });
}
