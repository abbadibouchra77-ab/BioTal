/**
 * <cart-drawer> — tiroir panier AJAX : ouverture/fermeture, mise à jour quantité,
 * suppression, upsell bundle. S'appuie sur l'API Section Rendering de Shopify pour
 * rafraîchir son contenu sans recharger la page.
 */
(function () {
  "use strict";

  if (customElements.get("cart-drawer")) return;

  class CartDrawer extends HTMLElement {
    connectedCallback() {
      this.body = this.querySelector("[data-cart-drawer-body]");
      this.lastFocused = null;

      this.querySelectorAll("[data-cart-drawer-close]").forEach(
        function (el) {
          el.addEventListener("click", this.close.bind(this));
        }.bind(this)
      );

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") this.close();
      }.bind(this));

      document.querySelectorAll("[data-open-cart-drawer]").forEach(
        function (trigger) {
          trigger.addEventListener(
            "click",
            function (event) {
              event.preventDefault();
              this.lastFocused = trigger;
              this.open();
            }.bind(this)
          );
        }.bind(this)
      );

      window.BioTal.subscribe(
        window.BioTal.EVENTS.cartUpdated,
        function (data) {
          this.refresh().then(
            function () {
              if (data.openDrawer) this.open();
            }.bind(this)
          );
        }.bind(this)
      );

      this.bindLineItemEvents();
    }

    open() {
      this.setAttribute("aria-hidden", "false");
      document.body.classList.add("cart-drawer-open");
      var closeBtn = this.querySelector(".cart-drawer__close");
      if (closeBtn) closeBtn.focus();
    }

    close() {
      this.setAttribute("aria-hidden", "true");
      document.body.classList.remove("cart-drawer-open");
      if (this.lastFocused) this.lastFocused.focus();
    }

    refresh() {
      return fetch(window.Shopify.routes.root + "cart?section_id=cart-drawer")
        .then(function (response) {
          return response.text();
        })
        .then(
          function (text) {
            var parser = new DOMParser();
            var html = parser.parseFromString(text, "text/html");
            var newDrawer = html.querySelector("cart-drawer");
            if (newDrawer) {
              this.innerHTML = newDrawer.innerHTML;
              this.body = this.querySelector("[data-cart-drawer-body]");
              this.bindLineItemEvents();
              this.querySelectorAll("[data-cart-drawer-close]").forEach(
                function (el) {
                  el.addEventListener("click", this.close.bind(this));
                }.bind(this)
              );
            }
          }.bind(this)
        )
        .catch(function () {});
    }

    bindLineItemEvents() {
      if (!this.body) return;

      this.body.querySelectorAll("[data-cart-item]").forEach(
        function (row) {
          var key = row.dataset.cartItemKey;
          var input = row.querySelector("[data-cart-quantity-input]");
          var decrease = row.querySelector("[data-cart-quantity-decrease]");
          var increase = row.querySelector("[data-cart-quantity-increase]");
          var remove = row.querySelector("[data-cart-remove]");

          var updateQuantity = window.BioTal.debounce(
            function (quantity) {
              this.changeLine(key, quantity);
            }.bind(this),
            400
          );

          if (decrease) {
            decrease.addEventListener(
              "click",
              function () {
                var value = Math.max(0, parseInt(input.value || "1", 10) - 1);
                input.value = value;
                this.changeLine(key, value);
              }.bind(this)
            );
          }
          if (increase) {
            increase.addEventListener(
              "click",
              function () {
                var value = parseInt(input.value || "1", 10) + 1;
                input.value = value;
                this.changeLine(key, value);
              }.bind(this)
            );
          }
          if (input) {
            input.addEventListener(
              "change",
              function () {
                updateQuantity(parseInt(input.value || "0", 10));
              }.bind(this)
            );
          }
          if (remove) {
            remove.addEventListener(
              "click",
              function () {
                this.changeLine(key, 0);
              }.bind(this)
            );
          }
        }.bind(this)
      );
    }

    changeLine(key, quantity) {
      this.classList.add("is-updating");
      fetch(window.Shopify.routes.root + "cart/change.js", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ id: key, quantity: quantity })
      })
        .then(function (response) {
          return response.json();
        })
        .then(
          function (cart) {
            window.BioTal.publish(window.BioTal.EVENTS.cartUpdated, { cart: cart, openDrawer: false });
          }.bind(this)
        )
        .catch(
          function (error) {
            window.BioTal.publish(window.BioTal.EVENTS.cartError, { error: error });
          }.bind(this)
        )
        .finally(
          function () {
            this.classList.remove("is-updating");
          }.bind(this)
        );
    }
  }

  customElements.define("cart-drawer", CartDrawer);
})();
