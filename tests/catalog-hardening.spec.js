const { test, expect } = require('@playwright/test');
const products = require('../products.json');
const es = require('../i18n/es.json');
const en = require('../i18n/en.json');

const countIn = (category) => products.filter((p) => p.category === category).length;
const chip = (page, category) => page.locator(`.catalog-filters button[data-category="${category}"]`);
const visibleCards = (page) => page.locator('.products-grid--catalog article.product-card:visible');

test.describe('when products.json fails to load', () => {
  for (const status of [404, 500]) {
    test(`catalogo shows an error message and no empty filter bar (HTTP ${status})`, async ({ page }) => {
      await page.route('**/products.json', (route) => route.fulfill({ status, body: 'nope' }));
      await page.goto('/catalogo.html');
      await expect(page.locator('.catalog-error')).toBeVisible();
      await expect(page.locator('.catalog-error')).toHaveText(es['catalogo.loadError']);
      await expect(page.locator('.catalog-error')).toHaveAttribute('role', 'alert');
      await expect(page.locator('.catalog-filters')).toBeHidden();
    });
  }

  test('malformed JSON also shows the error message', async ({ page }) => {
    await page.route('**/products.json', (route) => route.fulfill({ status: 200, body: '{not json' }));
    await page.goto('/catalogo.html');
    await expect(page.locator('.catalog-error')).toBeVisible();
  });
});

test('filter bar is visible once products load', async ({ page }) => {
  await page.goto('/catalogo.html');
  await expect(page.locator('.catalog-filters')).toBeVisible();
});

test('the filter only affects its own grid', async ({ page }) => {
  await page.goto('/catalogo.html');
  await expect(page.locator('article.product-card').first()).toBeVisible();
  await page.evaluate(() => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div class="products-grid"><article class="product-card" data-category="other" id="extra">extra</article></div>'
    );
  });
  await chip(page, 'funeral').click();
  await expect(page.locator('#extra')).toBeVisible();
});

test('filtering announces the result count to assistive tech', async ({ page }) => {
  await page.goto('/catalogo.html');
  const status = page.locator('[data-filter-status]');
  await expect(status).toHaveAttribute('aria-live', 'polite');
  await chip(page, 'funeral').click();
  await expect(status).toHaveText(es['catalogo.filterResult'].replace('{count}', String(countIn('funeral'))));
  await page.locator('.catalog-filters button').first().click();
  await expect(status).toHaveText(es['catalogo.filterResult'].replace('{count}', String(products.length)));
});

test.describe('filter in the URL', () => {
  test('opening catalogo.html#funeral applies the filter', async ({ page }) => {
    await page.goto('/catalogo.html#funeral');
    await expect(visibleCards(page)).toHaveCount(countIn('funeral'));
    await expect(chip(page, 'funeral')).toHaveAttribute('aria-pressed', 'true');
  });

  test('choosing a chip updates the hash and All clears it', async ({ page }) => {
    await page.goto('/catalogo.html');
    await chip(page, 'bridal').click();
    await expect(page).toHaveURL(/#bridal$/);
    await page.locator('.catalog-filters button').first().click();
    await expect(page).not.toHaveURL(/#/);
  });

  for (const hash of ['#nonsense', '#all', '#']) {
    test(`unknown hash "${hash}" falls back to All`, async ({ page }) => {
      await page.goto('/catalogo.html' + hash);
      await expect(visibleCards(page)).toHaveCount(products.length);
      await expect(page.locator('.catalog-filters button').first()).toHaveAttribute('aria-pressed', 'true');
    });
  }
});

for (const path of ['/index.html', '/catalogo.html']) {
  test(`${path} has no horizontal overflow at 280px`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: 280, height: 700 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await page.goto(path);
    await expect(page.locator('article.product-card').first()).toBeVisible();
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth, `scrollWidth ${scrollWidth} vs ${clientWidth}`).toBeLessThanOrEqual(clientWidth);
    await context.close();
  });
}

test('an unrelated in-page hash does not reset the active filter', async ({ page }) => {
  await page.goto('/catalogo.html');
  await chip(page, 'funeral').click();
  await page.evaluate(() => { window.location.hash = '#section'; });
  await expect(chip(page, 'funeral')).toHaveAttribute('aria-pressed', 'true');
  await expect(visibleCards(page)).toHaveCount(countIn('funeral'));
});

test('clearing the hash by hand shows All', async ({ page }) => {
  await page.goto('/catalogo.html#funeral');
  await expect(visibleCards(page)).toHaveCount(countIn('funeral'));
  await page.evaluate(() => { window.location.hash = ''; });
  await expect(visibleCards(page)).toHaveCount(products.length);
});

test('a missing filter target leaves the catalog intact and the bar hidden', async ({ page }) => {
  await page.route('**/catalogo.html', async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace('data-filter-target="catalog-grid"', 'data-filter-target="nope"');
    await route.fulfill({ response, body });
  });
  await page.goto('/catalogo.html');
  await expect(page.locator('article.product-card')).toHaveCount(products.length);
  await expect(page.locator('.catalog-error')).toHaveCount(0);
  await expect(page.locator('.catalog-filters')).toBeHidden();
});

test('an error while rendering does not masquerade as a load failure', async ({ page }) => {
  page.on('pageerror', () => {});
  await page.addInitScript(() => {
    Object.defineProperty(window, 'FRLightbox', {
      configurable: true,
      get: () => ({ init() { throw new Error('boom'); } }),
      set: () => {},
    });
  });
  await page.goto('/catalogo.html');
  await expect(page.locator('article.product-card')).toHaveCount(products.length);
  await expect(page.locator('.catalog-error')).toHaveCount(0);
});

test('the result status is cleared when the language changes', async ({ page }) => {
  await page.goto('/catalogo.html');
  await chip(page, 'funeral').click();
  await expect(page.locator('[data-filter-status]')).toHaveText(es['catalogo.filterResult'].replace('{count}', String(countIn('funeral'))));
  await page.click('[data-lang-toggle]');
  await expect(page.locator('[data-filter-status]')).toHaveText('');
  await chip(page, 'funeral').click();
  await expect(page.locator('[data-filter-status]')).toHaveText(en['catalogo.filterResult'].replace('{count}', String(countIn('funeral'))));
});
