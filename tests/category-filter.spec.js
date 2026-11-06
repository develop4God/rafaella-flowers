const { test, expect } = require('@playwright/test');
const products = require('../products.json');
const es = require('../i18n/es.json');

const categories = [...new Set(products.map((p) => p.category))];
const countIn = (category) => products.filter((p) => p.category === category).length;

const chips = (page) => page.locator('.catalog-filters button');
const visibleCards = (page) => page.locator('article.product-card:visible');
const chip = (page, category) => page.locator(`.catalog-filters button[data-category="${category}"]`);

test.beforeEach(async ({ page }) => {
  await page.goto('/catalogo.html');
  await expect(page.locator('article.product-card')).toHaveCount(products.length);
});

test('filter bar has an "All" chip plus one chip per category, All active by default', async ({ page }) => {
  await expect(chips(page)).toHaveCount(categories.length + 1);
  await expect(chips(page).first()).toHaveText(es['catalogo.filterAll']);
  await expect(chips(page).first()).toHaveAttribute('aria-pressed', 'true');
  await expect(visibleCards(page)).toHaveCount(products.length);
});

test('clicking a category shows only its products', async ({ page }) => {
  await chip(page, 'funeral').click();
  await expect(visibleCards(page)).toHaveCount(countIn('funeral'));
  await expect(chip(page, 'funeral')).toHaveAttribute('aria-pressed', 'true');
  await expect(chips(page).first()).toHaveAttribute('aria-pressed', 'false');

  const names = await visibleCards(page).locator('h3').allTextContents();
  const funeralNames = products
    .filter((p) => p.category === 'funeral')
    .map((p) => es[`product.${p.key}.name`]);
  expect(names.sort()).toEqual(funeralNames.sort());
});

test('every category chip shows exactly the products of that category', async ({ page }) => {
  for (const category of categories) {
    await chip(page, category).click();
    await expect(visibleCards(page)).toHaveCount(countIn(category));
  }
});

test('clicking All restores every product', async ({ page }) => {
  await chip(page, 'bridal').click();
  await expect(visibleCards(page)).toHaveCount(countIn('bridal'));
  await chips(page).first().click();
  await expect(visibleCards(page)).toHaveCount(products.length);
  await expect(chips(page).first()).toHaveAttribute('aria-pressed', 'true');
});

test('clicking the active chip again keeps the filter', async ({ page }) => {
  await chip(page, 'funeral').click();
  await chip(page, 'funeral').click();
  await expect(visibleCards(page)).toHaveCount(countIn('funeral'));
  await expect(chip(page, 'funeral')).toHaveAttribute('aria-pressed', 'true');
});

test('chip labels and the active filter follow the language toggle', async ({ page }) => {
  await chip(page, 'romantic').click();
  await expect(chip(page, 'romantic')).toHaveText('Romántico');

  await page.click('[data-lang-toggle]');
  await expect(chip(page, 'romantic')).toHaveText('Romantic');
  await expect(chips(page).first()).toHaveText('All');
  await expect(visibleCards(page)).toHaveCount(countIn('romantic'));
});

test('card category label matches its chip label', async ({ page }) => {
  const label = await chip(page, 'bridal').textContent();
  await chip(page, 'bridal').click();
  await expect(visibleCards(page).locator('.product-category')).toHaveText(label);
});

test('filter bar is keyboard operable', async ({ page }) => {
  await chip(page, 'funeral').focus();
  await page.keyboard.press('Enter');
  await expect(visibleCards(page)).toHaveCount(countIn('funeral'));
});

test('home page has no filter bar', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('article.product-card').first()).toBeVisible();
  await expect(page.locator('.catalog-filters')).toHaveCount(0);
});

test('filtered cards keep a sensible width and the group is centered', async ({ page }) => {
  for (const category of categories) {
    await chip(page, category).click();
    const grid = await page.locator('.products-grid').boundingBox();
    const boxes = await visibleCards(page).evaluateAll((els) =>
      els.map((el) => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right, width: r.width }; })
    );
    for (const box of boxes) {
      expect(box.width, `${category} card width`).toBeGreaterThanOrEqual(255);
      expect(box.width, `${category} card width`).toBeLessThanOrEqual(345);
    }
    const left = Math.min(...boxes.map((b) => b.left));
    const right = Math.max(...boxes.map((b) => b.right));
    const gridCenter = grid.x + grid.width / 2;
    expect(Math.abs((left + right) / 2 - gridCenter), `${category} group centered`).toBeLessThan(2);
  }
});
