(function () {
  var GALLERY_ICON =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }

  function mediaHTML(p) {
    var hasGallery = p.gallery && p.gallery.length > 1;
    return (
      '<div class="product-media">' +
      '<img src="' + p.img + '" alt="' + p.alt + '" style="object-position: ' + p.objectPosition + '" loading="lazy" decoding="async"' +
      (hasGallery ? ' data-gallery="' + escapeAttr(JSON.stringify(p.gallery)) + '"' : '') + '>' +
      (hasGallery ? '<span class="product-gallery-badge">' + GALLERY_ICON + '<span data-i18n="product.verFotos"></span></span>' : '') +
      '</div>'
    );
  }

  function cardHTML(p, showCategory) {
    return (
      '<article class="product-card">' +
      mediaHTML(p) +
      '<div class="product-body">' +
      '<h3 data-i18n="product.' + p.key + '.name"></h3>' +
      (showCategory ? '<p class="product-category" data-i18n="product.' + p.key + '.category"></p>' : '') +
      '<p class="price">$' + p.price + '</p>' +
      '<a class="btn btn-whatsapp" data-wa-product="' + p.key + '" data-wa-price="' + p.price + '" data-i18n="whatsapp.pedirBoton"></a>' +
      '</div>' +
      '</article>'
    );
  }

  function render(products) {
    document.querySelectorAll('.products-grid').forEach(function (grid) {
      var featured = grid.getAttribute('data-featured');
      var showCategory = grid.hasAttribute('data-show-category');
      var list = featured ? products.slice(0, Number(featured)) : products;
      grid.innerHTML = list.map(function (p) { return cardHTML(p, showCategory); }).join('');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var grids = document.querySelectorAll('.products-grid');
    if (!grids.length) return;

    fetch('products.json')
      .then(function (res) { return res.json(); })
      .then(function (products) {
        render(products);
        if (window.FRi18n) window.FRi18n.applyTranslations();
        if (window.FRLightbox) window.FRLightbox.init();
      });
  });
})();
