import { expect, test } from '@playwright/test';

test('mock layout supports search, units, states and reload without API calls', async ({
  page,
}) => {
  const apiRequests: string[] = [];
  await page.route('**/*open-meteo.com/**', (route) => {
    apiRequests.push(route.request().url());
    return route.abort();
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Consulte o clima de uma cidade' })).toBeVisible();
  await page.getByLabel('Nome da cidade').fill('Porto');
  await page.getByLabel('Nome da cidade').press('Enter');
  await expect(page.getByRole('heading', { name: 'Porto', exact: true })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(5);
  await page.getByRole('button', { name: '°F', exact: true }).click();
  await expect(page.getByRole('main').getByText(/°F$/)).toHaveCount(11);
  await page.getByRole('button', { name: 'Erro', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(0);
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('main').getByText(/°F$/)).toHaveCount(11);
  await page.reload();
  await expect(page.getByRole('button', { name: '°C', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(apiRequests).toEqual([]);
});

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`all demo states fit viewport ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const demo = page.getByRole('group', { name: 'Estados de demonstração' });
    for (const label of ['Inicial', 'Carregando', 'Sem dados', 'Erro', 'Sucesso']) {
      await demo.getByRole('button', { name: label, exact: true }).click();
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
