import { expect, test } from '@playwright/test';
import { mockWeatherApi, searchCity } from './weatherFixture';

test.beforeEach(async ({ page }) => {
  await mockWeatherApi(page);
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
