(function () {
  function cardHTML(p, showCategory) {
    return (
      '<article class="product-card">' +
      '<img src="' + p.img + '" alt="' + p.alt + '">' +
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
