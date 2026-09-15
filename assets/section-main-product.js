/**
 * <product-page> — sélection de variante, bascule achat unique / abonnement,
 * galerie avec zoom léger, quantité, barre d'achat sticky mobile.
 * Aucune dépendance externe.
 */
(function () {
  "use strict";

  if (customElements.get("product-page")) return;

  class ProductPage extends HTMLElement {
    connectedCallback() {
      this.form = this.querySelector("[data-product-form]");
      this.variantInput = this.querySelector("[data-product-form-variant-id]");
      this.priceWrapper = this.querySelector("[data-product-price]");
      this.submitButton = this.querySelector("[data-product-form-submit]");
      this.submitLabel = this.querySelector("[data-product-form-submit-label]");
      this.optionSelects = Array.from(this.querySelectorAll("[data-product-option]"));
      this.purchaseOptions = Array.from(this.querySelectorAll("[data-purchase-option]"));
      this.sellingPlanInput = this.querySelector("[data-selling-plan-input]");

      var jsonEl = this.querySelector("[data-product-json]");
      this.variants = jsonEl ? JSON.parse(jsonEl.textContent) : [];
      this.currentVariant = this.findVariantById(this.variantInput ? this.variantInput.value : null);

      this.bindOptions();
      this.bindPurchaseOptions();
      this.bindQuantity();
      this.bindGallery();
      this.bindStickyBar();
      this.bindFormSubmit();
    }

    findVariantById(id) {
      var numericId = Number(id);
      return this.variants.filter(function (v) {
        return v.id === numericId;
      })[0];
    }

    findVariantByOptions(options) {
      return this.variants.filter(function (v) {
        return v.options.every(function (value, index) {
          return value === options[index];
        });
      })[0];
    }

    bindOptions() {
      if (!this.optionSelects.length) return;
      this.optionSelects.forEach(
        function (select) {
          select.addEventListener(
            "change",
            function () {
              var selected = this.optionSelects
                .sort(function (a, b) {
                  return Number(a.dataset.optionPosition) - Number(b.dataset.optionPosition);
                })
                .map(function (s) {
                  return s.value;
                });
              var variant = this.findVariantByOptions(selected);
              if (variant) this.setVariant(variant);
            }.bind(this)
          );
        }.bind(this)
      );
    }

    setVariant(variant) {
      this.currentVariant = variant;
      if (this.variantInput) this.variantInput.value = variant.id;

      var priceCents = variant.price;
      var compareCents = variant.compare_at_price;
      var onSale = compareCents && compareCents > priceCents;

      if (this.priceWrapper) {
        this.priceWrapper.classList.toggle("price--on-sale", !!onSale);
        var saleEl = this.priceWrapper.querySelector(".price__sale");
        var regularEl = this.priceWrapper.querySelector(".price__regular");
        var compareEl = this.priceWrapper.querySelector(".price__compare");
        if (onSale) {
          if (saleEl) saleEl.textContent = window.BioTal.formatMoney(priceCents);
          if (compareEl) compareEl.textContent = window.BioTal.formatMoney(compareCents);
        } else if (regularEl) {
          regularEl.textContent = window.BioTal.formatMoney(priceCents);
        }
      }

      if (this.submitButton) {
        var available = variant.available;
        this.submitButton.disabled = !available;
        this.submitButton.setAttribute("aria-disabled", (!available).toString());
        if (this.submitLabel) {
          this.submitLabel.textContent = available
            ? this.submitLabel.dataset.addLabel || this.submitLabel.textContent
            : this.submitLabel.dataset.soldOutLabel || this.submitLabel.textContent;
        }
      }

      var stickyPrice = this.querySelector("[data-sticky-bar-price]");
      if (stickyPrice) stickyPrice.textContent = window.BioTal.formatMoney(priceCents);

      window.BioTal.publish(window.BioTal.EVENTS.variantChanged, { variant: variant });
    }

    bindPurchaseOptions() {
      if (!this.purchaseOptions.length) return;
      this.purchaseOptions.forEach(
        function (input) {
          input.addEventListener(
            "change",
            function () {
              var groupSelect = this.querySelector(
                '[data-selling-plan-select][data-group-id="' + input.value + '"]'
              );
              this.querySelectorAll("[data-selling-plan-select]").forEach(function (el) {
                el.hidden = true;
              });

              if (input.value === "onetime") {
                if (this.sellingPlanInput) this.sellingPlanInput.value = "";
                return;
              }

              if (groupSelect) {
                groupSelect.hidden = false;
                if (this.sellingPlanInput) this.sellingPlanInput.value = groupSelect.value;
                groupSelect.addEventListener(
                  "change",
                  function () {
                    if (this.sellingPlanInput) this.sellingPlanInput.value = groupSelect.value;
                  }.bind(this)
                );
              } else if (this.currentVariant && this.currentVariant.selling_plan_allocations) {
                var allocation = this.currentVariant.selling_plan_allocations.filter(function (a) {
                  return String(a.selling_plan_group_id) === input.value;
                })[0];
                if (allocation && this.sellingPlanInput) {
                  this.sellingPlanInput.value = allocation.selling_plan_id || allocation.selling_plan.id;
                }
              }
            }.bind(this)
          );
        }.bind(this)
      );
    }

    bindQuantity() {
      var input = this.querySelector("[data-quantity-input]");
      var decrease = this.querySelector("[data-quantity-decrease]");
      var increase = this.querySelector("[data-quantity-increase]");
      if (!input) return;

      if (decrease) {
        decrease.addEventListener("click", function () {
          var value = Math.max(1, parseInt(input.value || "1", 10) - 1);
          input.value = value;
        });
      }
      if (increase) {
        increase.addEventListener("click", function () {
          var value = parseInt(input.value || "1", 10) + 1;
          input.value = value;
        });
      }
    }

    bindGallery() {
      var thumbs = Array.from(this.querySelectorAll("[data-thumb-for]"));
      var mediaItems = Array.from(this.querySelectorAll("[data-media-id]"));
      if (!thumbs.length) return;

      thumbs.forEach(function (thumb) {
        thumb.addEventListener("click", function () {
          var mediaId = thumb.dataset.thumbFor;
          thumbs.forEach(function (t) {
            t.classList.toggle("is-active", t === thumb);
            t.setAttribute("aria-selected", t === thumb ? "true" : "false");
          });
          mediaItems.forEach(function (item) {
            var match = item.dataset.mediaId === mediaId;
            item.hidden = !match;
            item.classList.toggle("is-active", match);
          });
        });
      });

      mediaItems.forEach(function (item) {
        item.addEventListener("click", function () {
          item.classList.toggle("is-zoomed");
        });
      });
    }

    bindStickyBar() {
      var bar = this.querySelector("[data-product-sticky-bar]");
      var form = this.form;
      if (!bar || !form) return;

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            bar.hidden = entry.isIntersecting;
          });
        },
        { rootMargin: "-120px 0px 0px 0px" }
      );
      observer.observe(form.querySelector("[data-product-form-submit]"));

      var stickySubmit = this.querySelector("[data-sticky-bar-submit]");
      if (stickySubmit) {
        stickySubmit.addEventListener(
          "click",
          function () {
            if (typeof form.requestSubmit === "function") {
              form.requestSubmit();
            } else {
              form.submit();
            }
          }.bind(this)
        );
      }
    }

    bindFormSubmit() {
      if (!this.form) return;
      this.form.addEventListener(
        "submit",
        function (event) {
          event.preventDefault();
          if (this.submitButton.classList.contains("btn--loading")) return;
          this.submitButton.classList.add("btn--loading");

          var formData = new FormData(this.form);

          fetch(window.Shopify.routes.root + "cart/add.js", {
            method: "POST",
            headers: { Accept: "application/json" },
            body: formData
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
              }.bind(this)
            )
            .catch(
              function (error) {
                window.BioTal.publish(window.BioTal.EVENTS.cartError, { error: error });
              }.bind(this)
            )
            .finally(
              function () {
                this.submitButton.classList.remove("btn--loading");
              }.bind(this)
            );
        }.bind(this)
      );
    }
  }

  customElements.define("product-page", ProductPage);
})();
