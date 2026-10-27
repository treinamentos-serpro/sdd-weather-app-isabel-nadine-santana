import type { Locator } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { mockWeatherApi, searchCity } from './weatherFixture';

test.beforeEach(async ({ page }) => {
  await mockWeatherApi(page);
});

async function contrastRatio(locator: Locator, property = 'color') {
  return locator.evaluate((element, foregroundProperty) => {
    function parseColor(color: string) {
      const channels = color.match(/[\d.]+/g)?.map(Number);
      if (!channels || channels.length < 3) throw new Error(`Cor não suportada: ${color}`);
      return { rgb: channels.slice(0, 3), alpha: channels[3] ?? 1 };
    }

    function blend(color: ReturnType<typeof parseColor>, background: number[]) {
      return color.rgb.map(
        (channel, index) => channel * color.alpha + background[index] * (1 - color.alpha),
      );
    }

    function luminance(rgb: number[]) {
      const linear = rgb.map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    }

    const ancestors: Element[] = [];
    for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
      ancestors.push(ancestor);
    }
    let background = [255, 255, 255];
    for (const ancestor of ancestors.reverse()) {
      background = blend(parseColor(getComputedStyle(ancestor).backgroundColor), background);
    }
    const foreground = blend(
      parseColor(getComputedStyle(element).getPropertyValue(foregroundProperty)),
      background,
    );
    const a = luminance(foreground);
    const b = luminance(background);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }, property);
}

test('skip link moves focus to the visible main landmark', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Ir para o conteúdo' });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.getByRole('main')).not.toHaveCSS('box-shadow', 'none');
});

test('keyboard supports units, validation, results and retry focus', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '°C', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  const fahrenheit = page.getByRole('button', { name: '°F', exact: true });
  await expect(fahrenheit).toBeFocused();
  await page.keyboard.press('Space');
  await expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');
  await expect(fahrenheit).not.toHaveCSS('box-shadow', 'none');
  await page.keyboard.press('Tab');
  const input = page.getByRole('searchbox', { name: 'Nome da cidade' });
  await expect(input).toBeFocused();
  await input.fill('   ');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAccessibleDescription('O nome da cidade é obrigatório.');
  await input.fill('Porto');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();

  await input.fill('Erro');
  await input.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({
      json: { results: [{ id: 1, name: 'Porto', latitude: 41.15, longitude: -8.61 }] },
    }),
  );
  await page.getByRole('button', { name: 'Buscar', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.getByRole('listitem')).toHaveCount(5);
});

test('text and input boundary meet AA contrast; controls have 44px touch targets', async ({
  page,
}) => {
  await page.goto('/');
  const search = page.getByRole('button', { name: 'Buscar', exact: true });
  expect(await contrastRatio(search)).toBeGreaterThanOrEqual(4.5);
  await search.hover();
  expect(await contrastRatio(search)).toBeGreaterThanOrEqual(4.5);
  expect(
    await contrastRatio(page.getByRole('searchbox'), 'border-top-color'),
  ).toBeGreaterThanOrEqual(3);

  await searchCity(page, 'Erro');
  await expect(page.getByRole('alert')).toBeVisible();
  expect(await contrastRatio(page.getByRole('alert'))).toBeGreaterThanOrEqual(4.5);
  const retry = page.getByRole('button', { name: 'Tentar novamente' });
  expect(await contrastRatio(retry)).toBeGreaterThanOrEqual(4.5);
  await retry.hover();
  expect(await contrastRatio(retry)).toBeGreaterThanOrEqual(4.5);
  await searchCity(page, 'Porto');
  await expect(page.getByRole('heading', { name: 'Porto', exact: true })).toBeVisible();
  expect(await contrastRatio(page.getByText('Umidade', { exact: true }))).toBeGreaterThanOrEqual(
    4.5,
  );
  const units = page.getByRole('group', { name: 'Unidade de temperatura' });
  for (const button of await units.getByRole('button').all()) {
    expect(await contrastRatio(button)).toBeGreaterThanOrEqual(4.5);
  }
  for (const button of await page.getByRole('button').all()) {
    const size = await button.boundingBox();
    expect(size).not.toBeNull();
    expect(size?.width).toBeGreaterThanOrEqual(44);
    expect(size?.height).toBeGreaterThanOrEqual(44);
  }
});

test('320px reflow handles 200% text and long location without card overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/');
  await searchCity(page, 'Porto');
  await expect(page.getByRole('heading', { name: 'Porto', exact: true })).toBeVisible();
  await page.getByRole('heading', { name: 'Porto', exact: true }).evaluate((heading) => {
    heading.textContent = 'CidadeComNomeMuitoLongoSemEspacosParaTestarRefluxo';
    const location = heading.nextElementSibling;
    if (!location) throw new Error('Localização ausente no hero');
    location.textContent = 'RegiaoAdministrativaComNomeMuitoLongoSemEspacos';
  });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  for (const card of await page.getByRole('article').all()) {
    const overflow = await card.evaluate((element) => element.scrollWidth > element.clientWidth);
    expect(overflow).toBe(false);
  }
  const hero = page.getByRole('region', {
    name: 'CidadeComNomeMuitoLongoSemEspacosParaTestarRefluxo',
  });
  expect(await hero.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(false);
  await expect(page.getByRole('article')).toHaveCount(5);
});

test('loading animation respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.route('https://geocoding-api.open-meteo.com/**', () => {});
  await searchCity(page, 'Porto');
  const indicator = page.getByRole('status').locator('[aria-hidden="true"]');
  await expect(indicator).toHaveCSS('animation-name', 'none');
});
