const { test, expect } = require('@playwright/test');

const pages = [
  { path: '/index.html', title: /Floristería Rafaella/, heading: 'Arreglos florales hechos con cariño' },
  { path: '/catalogo.html', title: /Catálogo/, heading: 'Catálogo' },
  { path: '/sobre-nosotros.html', title: /Sobre Nosotros/, heading: 'Sobre Floristería Rafaella' },
  { path: '/como-pedir.html', title: /Cómo Pedir/, heading: 'Cómo Pedir' },
  { path: '/contacto.html', title: /Contacto/, heading: 'Contacto' },
];

for (const p of pages) {
  test(`${p.path} loads with correct title and heading`, async ({ page }) => {
    await page.goto(p.path);
    await expect(page).toHaveTitle(p.title);
    await expect(page.locator('h1')).toHaveText(p.heading);
  });
}

test('nav links on home page go to the right pages', async ({ page }) => {
  await page.goto('/index.html');

  const nav = page.locator('nav.nav');
  await nav.getByRole('link', { name: 'Catálogo' }).click();
  await expect(page).toHaveURL(/catalogo\.html/);

  await nav.getByRole('link', { name: 'Sobre Nosotros' }).click();
  await expect(page).toHaveURL(/sobre-nosotros\.html/);

  await nav.getByRole('link', { name: 'Cómo Pedir' }).click();
  await expect(page).toHaveURL(/como-pedir\.html/);

  await nav.getByRole('link', { name: 'Contacto' }).click();
  await expect(page).toHaveURL(/contacto\.html/);

  await nav.getByRole('link', { name: 'Inicio' }).click();
  await expect(page).toHaveURL(/index\.html/);
});

test('footer links match nav destinations', async ({ page }) => {
  await page.goto('/index.html');
  const footer = page.locator('footer.site-footer');
  await expect(footer.getByRole('link', { name: 'Catálogo' })).toHaveAttribute('href', 'catalogo.html');
  await expect(footer.getByRole('link', { name: 'Sobre Nosotros' })).toHaveAttribute('href', 'sobre-nosotros.html');
  await expect(footer.getByRole('link', { name: 'Cómo Pedir' })).toHaveAttribute('href', 'como-pedir.html');
  await expect(footer.getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', 'contacto.html');
});
