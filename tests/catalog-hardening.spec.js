const { test, expect } = require('@playwright/test');
const products = require('../products.json');
const es = require('../i18n/es.json');

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
  test(`${path} has no horizontal overflow at 280px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 280, height: 700 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173' + path);
    await expect(page.locator('article.product-card').first()).toBeVisible();
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth, `scrollWidth ${scrollWidth} vs ${clientWidth}`).toBeLessThanOrEqual(clientWidth);
    await context.close();
  });
}
