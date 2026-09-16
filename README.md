# Floristería Rafaella

Sitio web para Floristería Rafaella, en Ciudad de Panamá. Catálogo de arreglos florales con pedidos por WhatsApp, en español e inglés.

## Características

- Catálogo de arreglos con fotos, precios y botón de pedido directo por WhatsApp (mensaje prellenado por producto)
- Sitio bilingüe (español/inglés) con selector de idioma persistente
- Galería con lightbox: clic en cualquier foto de producto para verla en grande
- Diseño responsive, sin dependencias externas ni build step

## Estructura

- `index.html` — Inicio, con arreglos destacados
- `catalogo.html` — Catálogo completo de arreglos
- `sobre-nosotros.html` — Historia de la florería
- `como-pedir.html` — Pasos para ordenar, entrega y métodos de pago
- `contacto.html` — Datos de contacto
- `styles.css` — Estilos compartidos por todas las páginas
- `images/` — Fotos de los arreglos y logos
- `products.json` — Catálogo de productos (fuente única: imagen, precio, clave i18n)
- `products.js` — Renderiza las tarjetas de producto en `index.html` y `catalogo.html` a partir de `products.json`
- `i18n/` — Diccionarios de traducción (`es.json`, `en.json`) y `i18n.js`, que aplica las traducciones y arma los enlaces de WhatsApp
- `lightbox.js` — Visor de imágenes ampliadas al hacer clic

## Agregar un nuevo arreglo

1. Coloca la imagen en `images/`
2. Agrega una entrada en `products.json` (imagen, texto alternativo, precio, clave)
3. Agrega el nombre y la categoría del producto en `i18n/es.json` e `i18n/en.json` bajo `product.<clave>.name` y `product.<clave>.category`

El arreglo aparecerá automáticamente en `catalogo.html`, y en `index.html` si el grid de destacados no limita la cantidad mostrada.

## Desarrollo

Sitio 100% HTML/CSS/JS estático, sin build step. Para verlo localmente, sirve la carpeta con cualquier servidor estático (abrir `index.html` directamente no funciona porque `products.js` e `i18n.js` cargan datos con `fetch`):

```bash
python3 -m http.server 8000
```

## Despliegue

Cualquier hosting estático (GitHub Pages, Netlify, Vercel) sirve directamente estos archivos sin configuración adicional.

## Tests

Pruebas end-to-end con Playwright: cargan cada página y verifican navegación, traducciones, enlaces de WhatsApp, el catálogo de productos, el lightbox y el formulario de contacto.

```bash
npm install
npx playwright install chromium
npm test
```
