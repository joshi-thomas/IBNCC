/**
 * CC Hub — Category mega menu interactions
 * Dropdown markup lives in the HTML pages; this file only handles open/close.
 */

(() => {
  "use strict";

  function init() {
    const inner = document.querySelector(".category-nav-inner");
    if (!inner) return;

    const dropdowns = Array.from(inner.querySelectorAll(".category-dropdown"));
    if (!dropdowns.length) return;

    let closeTimer = null;

    function openDropdown(wrap) {
      clearTimeout(closeTimer);
      dropdowns.forEach((el) => {
        if (el !== wrap) el.classList.remove("is-open");
      });
      wrap.classList.add("is-open");
    }

    function scheduleClose(wrap) {
      clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => {
        wrap.classList.remove("is-open");
      }, 140);
    }

    dropdowns.forEach((wrap) => {
      wrap.addEventListener("mouseenter", () => openDropdown(wrap));
      wrap.addEventListener("mouseleave", () => scheduleClose(wrap));
      wrap.addEventListener("focusin", () => openDropdown(wrap));
      wrap.addEventListener("focusout", (e) => {
        if (!wrap.contains(e.relatedTarget)) scheduleClose(wrap);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
