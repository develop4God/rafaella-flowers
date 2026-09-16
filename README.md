# Floristería Rafaella

Sitio estático para la florería Floristería Rafaella, en Ciudad de Panamá. Pedidos por WhatsApp.

## Estructura

- `index.html` — Inicio
- `catalogo.html` — Catálogo de arreglos
- `sobre-nosotros.html` — Historia de la florería
- `como-pedir.html` — Pasos para ordenar y entrega
- `contacto.html` — Datos de contacto
- `styles.css` — Estilos compartidos por todas las páginas
- `images/` — Fotos de los arreglos

## Desarrollo

Sitio 100% HTML/CSS estático, sin build step. Para verlo localmente, abre `index.html` en el navegador o sirve la carpeta con cualquier servidor estático:

```bash
python3 -m http.server 8000
```

## Despliegue

Cualquier hosting estático (GitHub Pages, Netlify, Vercel) sirve directamente estos archivos sin configuración adicional.

## Tests

Pruebas end-to-end con Playwright: cargan cada página, verifican navegación, enlaces de WhatsApp y el formulario de contacto.

```bash
npm install
npx playwright install chromium
npm test
```
