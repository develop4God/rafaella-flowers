const { test, expect } = require('@playwright/test');

test('contact form fields accept input', async ({ page }) => {
  await page.goto('/contacto.html');

  await page.fill('#nombre', 'Maria Gonzalez');
  await page.fill('#mensaje', 'Quiero un ramo de rosas para mañana en Las Acacias.');

  await expect(page.locator('#nombre')).toHaveValue('Maria Gonzalez');
  await expect(page.locator('#mensaje')).toHaveValue('Quiero un ramo de rosas para mañana en Las Acacias.');
});

test('submitting the contact form opens WhatsApp with the filled-in message', async ({ page, context }) => {
  await page.goto('/contacto.html');

  await page.fill('#nombre', 'Maria Gonzalez');
  await page.fill('#mensaje', 'Quiero un ramo de rosas para mañana.');

  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    page.click('button[type="submit"]'),
  ]);
  await popup.waitForLoadState('domcontentloaded').catch(() => {});

  const url = popup.url();
  const decoded = decodeURIComponent(url.replace(/\+/g, ' '));
  expect(url).toContain('50762865416');
  expect(decoded).toContain('Maria Gonzalez');
  expect(decoded).toContain('Quiero un ramo de rosas para mañana.');
});

test('contact page shows WhatsApp number and address', async ({ page }) => {
  await page.goto('/contacto.html');
  await expect(page.locator('.contact-cards')).toContainText('+507 6286-5416');
  await expect(page.locator('.contact-cards')).toContainText('Las Acacias');
});
