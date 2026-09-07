/**
 * CC Hub — Trading page marquees
 * Clones card sets for seamless infinite scroll.
 */

(() => {
  "use strict";

  const marquees = document.querySelectorAll("[data-marquee]");

  marquees.forEach((marquee) => {
    const track = marquee.querySelector("[data-marquee-track]");
    if (!track) return;

    const originals = Array.from(track.children);
    if (!originals.length) return;

    /* Duplicate the full set so -50% / 0 loops are seamless */
    originals.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("a").forEach((link) => {
        link.setAttribute("tabindex", "-1");
      });
      track.appendChild(clone);
    });

    const dots = marquee.querySelectorAll(".marquee-dot");
    let activeDot = 0;

    if (dots.length) {
      window.setInterval(() => {
        dots[activeDot]?.classList.remove("is-active");
        activeDot = (activeDot + 1) % dots.length;
        dots[activeDot]?.classList.add("is-active");
      }, 4000);
    }

    /* Optional nudge via arrows — briefly reverse/speed without stopping forever */
    const prev = marquee.querySelector(".marquee-arrow-prev");
    const next = marquee.querySelector(".marquee-arrow-next");
    const direction = marquee.dataset.direction || "rtl";

    function nudge(dir) {
      const current = getComputedStyle(track).animationDuration || "55s";
      const seconds = parseFloat(current) || 55;
      track.style.animationDuration = `${Math.max(18, seconds * 0.45)}s`;
      if (dir === "reverse") {
        track.style.animationDirection =
          direction === "rtl" ? "reverse" : "normal";
      } else {
        track.style.animationDirection =
          direction === "rtl" ? "normal" : "reverse";
      }
      window.setTimeout(() => {
        track.style.animationDuration = "";
        track.style.animationDirection = "";
      }, 1800);
    }

    prev?.addEventListener("click", () => nudge("reverse"));
    next?.addEventListener("click", () => nudge("forward"));
  });

  document.querySelector(".trading-page .search-bar")?.addEventListener("submit", (e) => {
    e.preventDefault();
  });

  /* Trading / Marketplace mode tabs */
  const modeTabs = Array.from(document.querySelectorAll(".trading-mode-tab"));
  if (modeTabs.length) {
    const initialTab = document.querySelector(".trading-mode-tab.is-active") || modeTabs[0];
    document.body.dataset.tradingMode = initialTab?.dataset.mode || "marketplace";

    modeTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const mode = tab.dataset.mode || "marketplace";
        modeTabs.forEach((item) => {
          const active = item === tab;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-selected", active ? "true" : "false");
        });
        document.body.dataset.tradingMode = mode;
      });
    });
  }
})();
