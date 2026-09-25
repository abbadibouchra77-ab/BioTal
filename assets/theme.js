/**
 * BioTal — utilitaires globaux (namespace, pub/sub, formatage prix, menu mobile).
 * Chargé sur toutes les pages. Les scripts de section s'appuient sur window.BioTal.
 */
window.BioTal = window.BioTal || {};

(function () {
  "use strict";

  /* ---------- Pub/Sub minimal pour synchroniser panier / header / drawer ---------- */
  var subscribers = {};

  function subscribe(eventName, callback) {
    if (!subscribers[eventName]) subscribers[eventName] = [];
    subscribers[eventName].push(callback);
    return function unsubscribe() {
      subscribers[eventName] = subscribers[eventName].filter(function (cb) {
        return cb !== callback;
      });
    };
  }

  function publish(eventName, data) {
    (subscribers[eventName] || []).forEach(function (callback) {
      callback(data);
    });
  }

  var EVENTS = {
    cartUpdated: "cart:updated",
    cartError: "cart:error",
    variantChanged: "variant:changed"
  };

  /* ---------- Formatage monétaire (sans dépendance externe) ---------- */
  var moneyFormat = window.themeMoneyFormat || "€{{amount}}";

  function formatMoney(cents, format) {
    if (typeof cents === "string") cents = cents.replace(".", "");
    var value = "";
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = format || moneyFormat;

    function defaultTo(value, defaultValue) {
      return value == null || value !== value ? defaultValue : value;
    }

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultTo(precision, 2);
      thousands = defaultTo(thousands, ",");
      decimal = defaultTo(decimal, ".");
      if (isNaN(number) || number == null) return "0";
      number = (number / 100.0).toFixed(precision);
      var parts = number.split(".");
      var dollars = parts[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1" + thousands);
      var cents2 = parts[1] ? decimal + parts[1] : "";
      return dollars + cents2;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case "amount":
        value = formatWithDelimiters(cents, 2, " ", ",");
        break;
      case "amount_no_decimals":
        value = formatWithDelimiters(cents, 0, " ", ",");
        break;
      case "amount_with_comma_separator":
        value = formatWithDelimiters(cents, 2, ".", ",");
        break;
      case "amount_no_decimals_with_comma_separator":
        value = formatWithDelimiters(cents, 0, ".", ",");
        break;
      default:
        value = formatWithDelimiters(cents, 2, " ", ",");
    }

    return formatString.replace(placeholderRegex, value);
  }

  /* ---------- Debounce ---------- */
  function debounce(fn, wait) {
    var timeout;
    return function () {
      var args = arguments;
      var context = this;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        fn.apply(context, args);
      }, wait);
    };
  }

  /* ---------- Fetch panier JSON (mise à jour compteur header au chargement bfcache) ---------- */
  function refreshCartCount() {
    fetch(window.Shopify && window.Shopify.routes ? window.Shopify.routes.root + "cart.js" : "/cart.js")
      .then(function (res) { return res.json(); })
      .then(function (cart) {
        publish(EVENTS.cartUpdated, { cart: cart });
      })
      .catch(function () {});
  }

  window.addEventListener("pageshow", function (event) {
    if (event.persisted) refreshCartCount();
  });

  /* ---------- Défilement fiable vers une ancre (ex. liens de menu vers
     #shopify-section-xxx) ----------
     Le saut natif du navigateur vers l'ancre peut avoir lieu avant que les
     images "lazy" plus haut dans la page (héros, produits vedettes...) aient
     fini de charger et repoussé le contenu vers le bas : la cible n'est pas
     encore à sa position finale au moment du saut, qui atterrit alors au
     mauvais endroit — ou semble ne rien faire si l'écart est faible. On
     refait le calcul nous-mêmes une fois la page (et ses images) chargée,
     et à chaque changement de #ancre (clic sur un lien de menu). */
  function scrollToHashTarget() {
    if (!window.location.hash) return;
    var id;
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch (e) {
      id = window.location.hash.slice(1);
    }
    var target = id && document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  window.addEventListener("load", scrollToHashTarget);
  window.addEventListener("hashchange", scrollToHashTarget);

  /* ---------- Menu mobile (header) ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-mobile-nav-toggle]");
    var nav = document.getElementById("MobileNav");
    if (!toggle || !nav) return;

    function closeNav() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    }

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.classList.toggle("nav-open", isOpen);
      if (isOpen) {
        var firstLink = nav.querySelector("a, button");
        if (firstLink) firstLink.focus();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        closeNav();
        toggle.focus();
      }
    });

    /* Referme le tiroir au clic sur un lien : sans ça, "overflow: hidden"
       (posé sur body.nav-open) bloque le défilement de toute la page tant que
       le tiroir reste ouvert — invisible pour un lien qui change de page
       (le rechargement réinitialise tout), mais ça empêche silencieusement
       les liens d'ancrage vers la même page (ex. "#shopify-section-...")
       de faire défiler jusqu'à leur cible. */
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
  });

  subscribe(EVENTS.cartUpdated, function (data) {
    var countEls = document.querySelectorAll("[data-cart-count]");
    countEls.forEach(function (el) {
      el.textContent = data.cart.item_count;
      el.classList.toggle("is-empty", data.cart.item_count === 0);
    });
  });

  window.BioTal.subscribe = subscribe;
  window.BioTal.publish = publish;
  window.BioTal.EVENTS = EVENTS;
  window.BioTal.formatMoney = formatMoney;
  window.BioTal.debounce = debounce;
  window.BioTal.refreshCartCount = refreshCartCount;
})();
