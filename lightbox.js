(function () {
  var initialized = false;

  function buildOverlay() {
    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-hidden', 'true');

    var img = document.createElement('img');
    img.className = 'lightbox-image';
    overlay.appendChild(img);

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Cerrar');
    closeBtn.textContent = '×';
    overlay.appendChild(closeBtn);

    document.body.appendChild(overlay);
    return { overlay: overlay, img: img, closeBtn: closeBtn };
  }

  function init() {
    if (initialized) return;
    var productImages = document.querySelectorAll('.product-card img');
    if (!productImages.length) return;
    initialized = true;

    var els = buildOverlay();

    function open(src, alt) {
      els.img.src = src;
      els.img.alt = alt || '';
      els.overlay.classList.add('is-open');
      els.overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      els.overlay.classList.remove('is-open');
      els.overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    productImages.forEach(function (img) {
      img.addEventListener('click', function () {
        open(img.src, img.alt);
      });
    });

    els.overlay.addEventListener('click', function (event) {
      if (event.target === els.overlay || event.target === els.closeBtn) {
        close();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
  window.FRLightbox = { init: init };
})();
