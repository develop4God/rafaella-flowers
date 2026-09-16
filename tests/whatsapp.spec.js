const { test, expect } = require('@playwright/test');

const WHATSAPP_NUMBER = '50762865416';

test('floating WhatsApp button is present on every page and points to the right number', async ({ page }) => {
  const paths = ['/index.html', '/catalogo.html', '/sobre-nosotros.html', '/como-pedir.html', '/contacto.html'];
  for (const path of paths) {
    await page.goto(path);
    const floatBtn = page.locator('a.whatsapp-float');
    await expect(floatBtn).toBeVisible();
    await expect(floatBtn).toHaveAttribute('href', new RegExp(`wa\\.me/${WHATSAPP_NUMBER}`));
  }
});

test('header "Ordenar Ahora" button links to WhatsApp with prefilled text', async ({ page }) => {
  await page.goto('/index.html');
  const orderBtn = page.locator('header .btn-primary');
  const href = await orderBtn.getAttribute('href');
  expect(href).toContain(`wa.me/${WHATSAPP_NUMBER}`);
  expect(href).toContain('text=');
});

test('each product card on catalogo.html has its own prefilled WhatsApp order link', async ({ page }) => {
  await page.goto('/catalogo.html');
  const cards = page.locator('article.product-card');
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const name = await card.locator('h3').innerText();
    const link = card.locator('a.btn-whatsapp');
    const href = await link.getAttribute('href');
    expect(href).toContain(`wa.me/${WHATSAPP_NUMBER}`);
    expect(decodeURIComponent(href)).toContain(name);
  }
});
