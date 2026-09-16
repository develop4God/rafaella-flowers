const { test, expect } = require('@playwright/test');

test('page loads in Spanish by default', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('h1')).toHaveText('Arreglos florales hechos con cariño');
  await expect(page.locator('nav.nav a', { hasText: 'Catálogo' })).toBeVisible();
});

test('toggle switches to English and persists across pages', async ({ page }) => {
  await page.goto('/index.html');
  await page.click('[data-lang-toggle]');

  await expect(page.locator('h1')).toHaveText('Flower arrangements made with love');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.locator('nav.nav a', { hasText: 'Catalog' }).click();
  await expect(page).toHaveURL(/catalogo\.html/);
  await expect(page.locator('h1')).toHaveText('Catalog');
});

test('toggle switches back to Spanish', async ({ page }) => {
  await page.goto('/index.html');
  await page.click('[data-lang-toggle]');
  await expect(page.locator('h1')).toHaveText('Flower arrangements made with love');

  await page.click('[data-lang-toggle]');
  await expect(page.locator('h1')).toHaveText('Arreglos florales hechos con cariño');
});

test('WhatsApp button text updates with language', async ({ page }) => {
  await page.goto('/index.html');
  const floatBtn = page.locator('a.whatsapp-float span');
  await expect(floatBtn).toHaveText('Pedir por WhatsApp');

  await page.click('[data-lang-toggle]');
  await expect(floatBtn).toHaveText('Order via WhatsApp');
});

test('product order link text changes with language on catalogo.html', async ({ page }) => {
  await page.goto('/catalogo.html');
  const firstProductName = page.locator('article.product-card h3').first();
  await expect(firstProductName).toHaveText('Arreglo Tropical en Base Verde');

  await page.click('[data-lang-toggle]');
  await expect(firstProductName).toHaveText('Tropical Arrangement in Green Base');

  const href = await page.locator('article.product-card a.btn-whatsapp').first().getAttribute('href');
  expect(decodeURIComponent(href)).toContain('Tropical Arrangement in Green Base');
});
