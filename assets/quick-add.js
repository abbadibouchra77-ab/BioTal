/**
 * <product-quick-add> — ajout au panier en AJAX depuis une carte produit (grille, cross-sell...).
 * Web component vanilla, ne se charge que si des cartes produit sont présentes sur la page.
 */
(function () {
  "use strict";

  if (customElements.get("product-quick-add")) return;

  class ProductQuickAdd extends HTMLElement {
    connectedCallback() {
      this.form = this.querySelector("form");
      if (!this.form) return;
      this.button = this.form.querySelector("[data-quick-add-submit]");
      this.label = this.form.querySelector("[data-quick-add-label]");
      this.defaultLabel = this.label ? this.label.textContent : "";
      this.form.addEventListener("submit", this.onSubmit.bind(this));
    }

    onSubmit(event) {
      event.preventDefault();
      if (this.button.classList.contains("btn--loading")) return;

      this.button.classList.add("btn--loading");
      this.button.disabled = true;

      var formData = new FormData(this.form);
      var body = JSON.stringify({
        id: formData.get("id"),
        quantity: 1
      });

      fetch(window.Shopify.routes.root + "cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: body
      })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok) throw data;
            return data;
          });
        })
        .then(
          function () {
            return fetch(window.Shopify.routes.root + "cart.js").then(function (res) {
              return res.json();
            });
          }.bind(this)
        )
        .then(
          function (cart) {
            window.BioTal.publish(window.BioTal.EVENTS.cartUpdated, { cart: cart, openDrawer: true });
            if (this.label) this.label.textContent = this.defaultLabel;
          }.bind(this)
        )
        .catch(
          function (error) {
            window.BioTal.publish(window.BioTal.EVENTS.cartError, { error: error });
          }.bind(this)
        )
        .finally(
          function () {
            this.button.classList.remove("btn--loading");
            this.button.disabled = false;
          }.bind(this)
        );
    }
  }

  customElements.define("product-quick-add", ProductQuickAdd);
})();
