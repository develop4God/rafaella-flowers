const { test, expect } = require('@playwright/test');

test('clicking a product image opens it in a lightbox on catalogo.html', async ({ page }) => {
  await page.goto('/catalogo.html');

  const overlay = page.locator('.lightbox-overlay');
  await expect(overlay).not.toHaveClass(/is-open/);

  const firstImage = page.locator('.product-card img').first();
  const expectedSrc = await firstImage.evaluate((img) => img.src);
  await firstImage.click();

  await expect(overlay).toHaveClass(/is-open/);
  const lightboxImg = page.locator('.lightbox-image');
  await expect(lightboxImg).toHaveAttribute('src', expectedSrc);
});

test('lightbox closes on close button click', async ({ page }) => {
  await page.goto('/catalogo.html');
  await page.locator('.product-card img').first().click();
  await expect(page.locator('.lightbox-overlay')).toHaveClass(/is-open/);

  await page.locator('.lightbox-close').click();
  await expect(page.locator('.lightbox-overlay')).not.toHaveClass(/is-open/);
});

test('lightbox closes on Escape key', async ({ page }) => {
  await page.goto('/catalogo.html');
  await page.locator('.product-card img').first().click();
  await expect(page.locator('.lightbox-overlay')).toHaveClass(/is-open/);

  await page.keyboard.press('Escape');
  await expect(page.locator('.lightbox-overlay')).not.toHaveClass(/is-open/);
});

test('lightbox closes when clicking the overlay backdrop', async ({ page }) => {
  await page.goto('/catalogo.html');
  await page.locator('.product-card img').first().click();
  await expect(page.locator('.lightbox-overlay')).toHaveClass(/is-open/);

  await page.locator('.lightbox-overlay').click({ position: { x: 5, y: 5 } });
  await expect(page.locator('.lightbox-overlay')).not.toHaveClass(/is-open/);
});

test('lightbox also works on index.html featured products', async ({ page }) => {
  await page.goto('/index.html');
  await page.locator('.product-card img').first().click();
  await expect(page.locator('.lightbox-overlay')).toHaveClass(/is-open/);
});

test('multi-photo product shows a badge and the lightbox navigates between photos', async ({ page }) => {
  await page.goto('/catalogo.html');
  const card = page.locator('.product-card', { has: page.locator('.product-gallery-badge') });
  await expect(card).toHaveCount(1);
  await card.locator('img').click();

  const lightboxImg = page.locator('.lightbox-image');
  await expect(lightboxImg).toHaveAttribute('src', /A008A\.webp$/);

  await page.locator('.lightbox-next').click();
  await expect(lightboxImg).toHaveAttribute('src', /A008B\.webp$/);

  await page.keyboard.press('ArrowRight');
  await expect(lightboxImg).toHaveAttribute('src', /A008A\.webp$/);

  await page.keyboard.press('ArrowLeft');
  await expect(lightboxImg).toHaveAttribute('src', /A008B\.webp$/);

  await page.locator('.lightbox-dot').first().click();
  await expect(lightboxImg).toHaveAttribute('src', /A008A\.webp$/);
});

test('single-photo product hides gallery controls and focus returns on close', async ({ page }) => {
  await page.goto('/catalogo.html');
  const img = page.locator('.product-card img').first();
  await img.click();
  await expect(page.locator('.lightbox-next')).toBeHidden();
  await expect(page.locator('.lightbox-dots')).toBeHidden();

  await page.keyboard.press('Escape');
  await expect(img).toBeFocused();
});
