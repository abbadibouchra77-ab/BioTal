/**
 * <bundle-builder> — sélection de plusieurs produits, calcul du total avec réduction en direct,
 * puis ajout au panier + application automatique du code de réduction Shopify associé.
 */
(function () {
  "use strict";

  if (customElements.get("bundle-builder")) return;

  class BundleBuilder extends HTMLElement {
    connectedCallback() {
      this.reveal = this.querySelector("[data-bundle-reveal]");
      this.panel = this.querySelector("[data-bundle-panel]");
      this.checkboxes = Array.prototype.slice.call(this.querySelectorAll("[data-bundle-item]"));
      this.summary = this.querySelector("[data-bundle-summary]");
      this.subtotalEl = this.querySelector("[data-bundle-subtotal]");
      this.discountEl = this.querySelector("[data-bundle-discount]");
      this.totalEl = this.querySelector("[data-bundle-total]");
      this.hint = this.querySelector("[data-bundle-hint]");
      this.submit = this.querySelector("[data-bundle-submit]");
      this.discountPercent = parseFloat(this.dataset.discountPercent || "0");
      this.discountCode = this.dataset.discountCode || "";

      if (!this.checkboxes.length || !this.submit) return;

      if (this.reveal && this.panel) {
        this.reveal.addEventListener(
          "click",
          function () {
            this.panel.hidden = false;
            this.reveal.hidden = true;
          }.bind(this)
        );
      }

      this.checkboxes.forEach(
        function (checkbox) {
          checkbox.addEventListener("change", this.updateSummary.bind(this));
        }.bind(this)
      );

      this.submit.addEventListener("click", this.onSubmit.bind(this));
      this.updateSummary();
    }

    getSelected() {
      return this.checkboxes.filter(function (checkbox) {
        return checkbox.checked;
      });
    }

    updateSummary() {
      var selected = this.getSelected();

      if (!selected.length) {
        if (this.summary) this.summary.hidden = true;
        if (this.hint) this.hint.hidden = false;
        this.submit.disabled = true;
        return;
      }

      var subtotal = selected.reduce(function (sum, checkbox) {
        return sum + parseInt(checkbox.dataset.price, 10);
      }, 0);
      var discount = Math.round((subtotal * this.discountPercent) / 100);
      var total = subtotal - discount;

      if (this.subtotalEl) this.subtotalEl.textContent = window.BioTal.formatMoney(subtotal);
      if (this.discountEl) this.discountEl.textContent = "-" + window.BioTal.formatMoney(discount);
      if (this.totalEl) this.totalEl.textContent = window.BioTal.formatMoney(total);
      if (this.summary) this.summary.hidden = false;
      if (this.hint) this.hint.hidden = true;
      this.submit.disabled = false;
    }

    onSubmit() {
      if (this.submit.classList.contains("btn--loading")) return;

      var selected = this.getSelected();
      if (!selected.length) return;

      this.submit.classList.add("btn--loading");
      this.submit.disabled = true;

      var items = selected.map(function (checkbox) {
        return { id: checkbox.dataset.variantId, quantity: 1 };
      });
      var root = window.Shopify.routes.root;

      fetch(root + "cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ items: items })
      })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok) throw data;
            return data;
          });
        })
        .then(
          function () {
            if (this.discountCode) {
              window.location.href =
                root + "discount/" + encodeURIComponent(this.discountCode) + "?redirect=" + encodeURIComponent(root + "cart");
            } else {
              window.location.href = root + "cart";
            }
          }.bind(this)
        )
        .catch(
          function (error) {
            window.BioTal.publish(window.BioTal.EVENTS.cartError, { error: error });
            this.submit.classList.remove("btn--loading");
            this.submit.disabled = false;
          }.bind(this)
        );
    }
  }

  customElements.define("bundle-builder", BundleBuilder);
})();
