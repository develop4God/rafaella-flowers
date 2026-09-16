const { test, expect } = require('@playwright/test');
const products = require('../products.json');

test('catalogo.html renders every product from products.json', async ({ page }) => {
  await page.goto('/catalogo.html');
  const cards = page.locator('article.product-card');
  await expect(cards).toHaveCount(products.length);
});

test('index.html and catalogo.html render the same set of products', async ({ page }) => {
  await page.goto('/index.html');
  const indexNames = await page.locator('article.product-card h3').allTextContents();

  await page.goto('/catalogo.html');
  const catalogoNames = await page.locator('article.product-card h3').allTextContents();

  expect(indexNames.sort()).toEqual(catalogoNames.sort());
});

test('catalogo.html shows product category, index.html does not', async ({ page }) => {
  await page.goto('/catalogo.html');
  await expect(page.locator('article.product-card .product-category').first()).toBeVisible();

  await page.goto('/index.html');
  const count = await page.locator('article.product-card .product-category').count();
  expect(count).toBe(0);
});
