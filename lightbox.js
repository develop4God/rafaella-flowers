(function () {
  var initialized = false;
  var SWIPE_THRESHOLD = 50;

  function makeButton(className, label, text) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = className;
    btn.setAttribute('aria-label', label);
    btn.textContent = text;
    return btn;
  }

  function buildOverlay() {
    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-hidden', 'true');

    var img = document.createElement('img');
    img.className = 'lightbox-image';
    overlay.appendChild(img);

    var closeBtn = makeButton('lightbox-close', 'Cerrar', '×');
    var prevBtn = makeButton('lightbox-nav lightbox-prev', 'Foto anterior', '‹');
    var nextBtn = makeButton('lightbox-nav lightbox-next', 'Foto siguiente', '›');
    var dots = document.createElement('div');
    dots.className = 'lightbox-dots';
    var status = document.createElement('span');
    status.className = 'lightbox-status';
    status.setAttribute('aria-live', 'polite');

    [closeBtn, prevBtn, nextBtn, dots, status].forEach(function (el) { overlay.appendChild(el); });

    document.body.appendChild(overlay);
    return { overlay: overlay, img: img, closeBtn: closeBtn, prevBtn: prevBtn, nextBtn: nextBtn, dots: dots, status: status };
  }

  function readGallery(img) {
    var key = img.getAttribute('data-product');
    var gallery = key && window.FRProducts && window.FRProducts.getGallery(key);
    return gallery || [{ src: img.src, alt: img.alt }];
  }

  function init() {
    if (initialized) return;
    var productImages = document.querySelectorAll('.product-card img');
    if (!productImages.length) return;
    initialized = true;

    var els = buildOverlay();
    var gallery = [];
    var index = 0;
    var opener = null;
    var touchStartX = null;

    function show(i) {
      index = (i + gallery.length) % gallery.length;
      els.img.src = gallery[index].src;
      els.img.alt = gallery[index].alt || '';
      els.status.textContent = gallery.length > 1 ? (index + 1) + ' / ' + gallery.length : '';
      Array.prototype.forEach.call(els.dots.children, function (dot, d) {
        dot.classList.toggle('is-active', d === index);
      });
    }

    function open(img) {
      opener = img;
      if (!img.hasAttribute('tabindex')) img.setAttribute('tabindex', '-1');
      gallery = readGallery(img);
      var multi = gallery.length > 1;
      els.prevBtn.hidden = els.nextBtn.hidden = els.dots.hidden = !multi;
      els.dots.innerHTML = '';
      gallery.forEach(function (item, d) {
        var dot = makeButton('lightbox-dot', 'Foto ' + (d + 1), '');
        dot.addEventListener('click', function () { show(d); });
        els.dots.appendChild(dot);
      });
      show(0);
      els.overlay.classList.add('is-open');
      els.overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      els.closeBtn.focus();
    }

    function close() {
      els.overlay.classList.remove('is-open');
      els.overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (opener && opener.focus) opener.focus({ preventScroll: true });
    }

    function isOpen() {
      return els.overlay.classList.contains('is-open');
    }

    productImages.forEach(function (img) {
      img.addEventListener('click', function () { open(img); });
    });

    els.prevBtn.addEventListener('click', function () { show(index - 1); });
    els.nextBtn.addEventListener('click', function () { show(index + 1); });

    els.overlay.addEventListener('click', function (event) {
      if (event.target === els.overlay || event.target === els.closeBtn) {
        close();
      }
    });

    els.overlay.addEventListener('touchstart', function (event) {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });
    els.overlay.addEventListener('touchend', function (event) {
      if (touchStartX === null || gallery.length < 2) return;
      var dx = event.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(dx) >= SWIPE_THRESHOLD) show(index + (dx < 0 ? 1 : -1));
    }, { passive: true });

    document.addEventListener('keydown', function (event) {
      if (!isOpen()) return;
      if (event.key === 'Escape') close();
      else if (event.key === 'ArrowLeft' && gallery.length > 1) show(index - 1);
      else if (event.key === 'ArrowRight' && gallery.length > 1) show(index + 1);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
  window.FRLightbox = { init: init };
})();
