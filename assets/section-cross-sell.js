/**
 * <product-recommendations> — charge le cross-sell "Complète ta routine avec..." via
 * l'API native de recommandations Shopify (aucune app tierce codée en dur).
 */
(function () {
  "use strict";

  if (customElements.get("product-recommendations")) return;

  class ProductRecommendations extends HTMLElement {
    connectedCallback() {
      var url = this.dataset.url;
      if (!url) return;

      var observer = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            observer.disconnect();
            this.loadRecommendations(url);
          }
        }.bind(this)
      );
      observer.observe(this);
    }

    loadRecommendations(url) {
      fetch(url)
        .then(function (response) {
          return response.text();
        })
        .then(
          function (text) {
            var parser = new DOMParser();
            var html = parser.parseFromString(text, "text/html");
            var recommendations = html.querySelector("product-recommendations");
            if (recommendations && recommendations.innerHTML.trim().length) {
              this.innerHTML = recommendations.innerHTML;
            }
          }.bind(this)
        )
        .catch(function () {});
    }
  }

  customElements.define("product-recommendations", ProductRecommendations);
})();
