/**
 * <video-facade> — remplace une image de couverture par un lecteur vidéo (YouTube/Vimeo)
 * uniquement au clic, pour ne jamais charger un iframe tiers avant que l'internaute le
 * demande (poids de page et LCP préservés).
 */
(function () {
  "use strict";

  if (customElements.get("video-facade")) return;

  function toEmbedUrl(url) {
    var youtubeMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
    );
    if (youtubeMatch) {
      return "https://www.youtube-nocookie.com/embed/" + youtubeMatch[1] + "?autoplay=1&rel=0";
    }

    var vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
      return "https://player.vimeo.com/video/" + vimeoMatch[1] + "?autoplay=1";
    }

    return url;
  }

  class VideoFacade extends HTMLElement {
    connectedCallback() {
      var button = this.querySelector(".video-section__play");
      if (!button) return;

      button.addEventListener(
        "click",
        function () {
          var iframe = document.createElement("iframe");
          iframe.src = toEmbedUrl(this.dataset.videoUrl);
          iframe.title = document.title;
          iframe.allow = "autoplay; encrypted-media; picture-in-picture";
          iframe.allowFullscreen = true;
          iframe.className = "video-section__iframe";
          this.innerHTML = "";
          this.appendChild(iframe);
        }.bind(this)
      );
    }
  }

  customElements.define("video-facade", VideoFacade);
})();
