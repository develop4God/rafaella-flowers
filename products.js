(function () {
  var GALLERY_ICON =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';

  var galleries = {};

  function mediaHTML(p) {
    var hasGallery = p.gallery && p.gallery.length > 1;
    return (
      '<div class="product-media">' +
      '<img src="' + p.img + '" alt="' + p.alt + '" style="object-position: ' + p.objectPosition + '" loading="lazy" decoding="async"' +
      (hasGallery ? ' data-product="' + p.key + '"' : '') + '>' +
      (hasGallery ? '<span class="product-gallery-badge">' + GALLERY_ICON + '<span data-i18n="product.verFotos"></span></span>' : '') +
      '</div>'
    );
  }

  function cardHTML(p, showCategory) {
    return (
      '<article class="product-card" data-category="' + p.category + '">' +
      mediaHTML(p) +
      '<div class="product-body">' +
      '<h3 data-i18n="product.' + p.key + '.name"></h3>' +
      (showCategory ? '<p class="product-category" data-i18n="category.' + p.category + '"></p>' : '') +
      '<p class="price">$' + p.price + '</p>' +
      '<a class="btn btn-whatsapp" data-wa-product="' + p.key + '" data-wa-price="' + p.price + '" data-i18n="whatsapp.pedirBoton"></a>' +
      '</div>' +
      '</article>'
    );
  }

  function render(products) {
    products.forEach(function (p) {
      if (p.gallery && p.gallery.length > 1) galleries[p.key] = p.gallery;
    });
    document.querySelectorAll('.products-grid').forEach(function (grid) {
      var featured = grid.getAttribute('data-featured');
      var showCategory = grid.hasAttribute('data-show-category');
      var list = featured ? products.slice(0, Number(featured)) : products;
      grid.innerHTML = list.map(function (p) { return cardHTML(p, showCategory); }).join('');
    });
  }

  function chipHTML(category, labelKey, active) {
    return (
      '<button type="button" data-category="' + category + '" aria-pressed="' + active + '"' +
      (active ? ' class="active"' : '') + ' data-i18n="' + labelKey + '"></button>'
    );
  }

  function applyFilter(bar, category) {
    bar.querySelectorAll('button').forEach(function (chip) {
      var isActive = chip.getAttribute('data-category') === category;
      chip.classList.toggle('active', isActive);
      chip.setAttribute('aria-pressed', String(isActive));
    });
    document.querySelectorAll('.products-grid .product-card').forEach(function (card) {
      card.hidden = category !== 'all' && card.getAttribute('data-category') !== category;
    });
  }

  function renderFilter(products) {
    var bar = document.querySelector('[data-category-filter]');
    if (!bar) return;
    var categories = products
      .map(function (p) { return p.category; })
      .filter(function (c, i, all) { return all.indexOf(c) === i; });
    bar.innerHTML =
      chipHTML('all', 'catalogo.filterAll', true) +
      categories.map(function (c) { return chipHTML(c, 'category.' + c, false); }).join('');
    bar.addEventListener('click', function (event) {
      var chip = event.target.closest('button[data-category]');
      if (chip) applyFilter(bar, chip.getAttribute('data-category'));
    });
  }

  window.FRProducts = {
    getGallery: function (key) { return galleries[key]; }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var grids = document.querySelectorAll('.products-grid');
    if (!grids.length) return;

    fetch('products.json')
      .then(function (res) { return res.json(); })
      .then(function (products) {
        render(products);
        renderFilter(products);
        if (window.FRi18n) window.FRi18n.applyTranslations();
        if (window.FRLightbox) window.FRLightbox.init();
      });
  });
})();
