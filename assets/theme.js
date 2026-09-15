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

  /* ---------- Menu mobile (header) ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-mobile-nav-toggle]");
    var nav = document.getElementById("MobileNav");
    if (!toggle || !nav) return;

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
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
        toggle.focus();
      }
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
