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

test.describe('product data integrity', () => {
  const fs = require('fs');
  const path = require('path');
  const es = require('../i18n/es.json');
  const en = require('../i18n/en.json');

  for (const p of products) {
    test(`${p.key} has an image, price, category id and ES/EN labels`, () => {
      expect(fs.existsSync(path.join(__dirname, '..', p.img)), `missing ${p.img}`).toBe(true);
      for (const g of p.gallery || []) {
        expect(fs.existsSync(path.join(__dirname, '..', g.src)), `missing ${g.src}`).toBe(true);
      }
      expect(p.price).toBeGreaterThan(0);
      expect(p.category, `category id for ${p.key}`).toMatch(/^[a-z][a-z0-9-]*$/);
      for (const dict of [es, en]) {
        expect(dict[`product.${p.key}.name`], `name for ${p.key}`).toBeTruthy();
        expect(dict[`category.${p.category}`], `category label for ${p.key}`).toBeTruthy();
      }
    });
  }
});
