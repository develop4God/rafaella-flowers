(function () {
  var STORAGE_KEY = 'fr-lang';
  var DEFAULT_LANG = 'es';
  var WHATSAPP_NUMBER = '50762865416';
  var dictionaries = {};

  function getLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function setLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  function t(key) {
    var dict = dictionaries[getLang()] || {};
    return dict[key] || key;
  }

  function waHref(message) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
  }

  function applyTranslations() {
    document.documentElement.lang = getLang();

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });

    document.querySelectorAll('title[data-i18n]').forEach(function (el) {
      document.title = t(el.getAttribute('data-i18n'));
    });

    document.querySelectorAll('meta[data-i18n-content]').forEach(function (el) {
      el.setAttribute('content', t(el.getAttribute('data-i18n-content')));
    });

    document.querySelectorAll('[data-wa-message]').forEach(function (el) {
      var key = el.getAttribute('data-wa-message');
      el.setAttribute('href', waHref(t(key)));
    });

    document.querySelectorAll('[data-wa-product]').forEach(function (el) {
      var productKey = el.getAttribute('data-wa-product');
      var price = el.getAttribute('data-wa-price');
      var name = t('product.' + productKey + '.name');
      var greeting = t('product.ordenarPor');
      var message = greeting + ' ' + name + ' ($' + price + ')';
      el.setAttribute('href', waHref(message));
    });

    document.querySelectorAll('[data-lang-toggle]').forEach(function (el) {
      el.textContent = getLang() === 'es' ? '🇺🇸 EN' : '🇪🇸 ES';
    });
  }

  function switchLang() {
    setLang(getLang() === 'es' ? 'en' : 'es');
    applyTranslations();
  }

  function loadDictionaries() {
    return Promise.all(
      ['es', 'en'].map(function (lang) {
        return fetch('i18n/' + lang + '.json')
          .then(function (res) { return res.json(); })
          .then(function (data) { dictionaries[lang] = data; });
      })
    );
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadDictionaries().then(applyTranslations);

    document.querySelectorAll('[data-lang-toggle]').forEach(function (el) {
      el.addEventListener('click', switchLang);
    });
  });

  window.FRi18n = { t: t, getLang: getLang, waHref: waHref };
})();
