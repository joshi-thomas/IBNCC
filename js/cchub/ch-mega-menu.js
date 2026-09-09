/**
 * CC Hub — Category mega menu interactions + scroll-aware sticky nav
 * Dropdown markup lives in the HTML pages; this file handles open/close
 * and show/hide of .category-nav based on scroll direction.
 */

(() => {
  "use strict";

  function initMegaMenu(inner) {
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

  function initScrollAwareNav(nav, header) {
    const root = document.documentElement;
    let lastY = window.scrollY || window.pageYOffset || 0;
    let ticking = false;
    const delta = 6;

    function syncHeaderHeight() {
      const h = Math.round(header.getBoundingClientRect().height) || 88;
      root.style.setProperty("--header-h-sticky", `${h}px`);
      return h;
    }

    function syncNavHeight(hidden) {
      if (hidden) {
        root.style.setProperty("--category-nav-h", "0px");
        return;
      }
      const navH = Math.round(nav.getBoundingClientRect().height) || 114;
      root.style.setProperty("--category-nav-h", `${navH}px`);
    }

    function setHidden(hidden) {
      const isHidden = nav.classList.contains("is-scroll-hidden");
      if (hidden === isHidden) return;
      nav.classList.toggle("is-scroll-hidden", hidden);
      syncNavHeight(hidden);
    }

    function update() {
      ticking = false;
      const y = window.scrollY || window.pageYOffset || 0;
      const headerH = syncHeaderHeight();
      const topThreshold = Math.max(headerH, 72);
      const menuOpen = !!nav.querySelector(".category-dropdown.is-open");

      // Near the top of the page: always show category nav in place
      if (y <= topThreshold) {
        setHidden(false);
        lastY = y;
        return;
      }

      // Keep nav visible while a mega-menu dropdown is open
      if (menuOpen) {
        setHidden(false);
        lastY = y;
        return;
      }

      if (y > lastY + delta) {
        // Scrolling down — hide category nav; header stays sticky
        setHidden(true);
      } else if (y < lastY - delta) {
        // Scrolling up — reveal sticky category nav below header
        setHidden(false);
      }

      lastY = y;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    syncHeaderHeight();
    syncNavHeight(false);
    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
      syncHeaderHeight();
      syncNavHeight(nav.classList.contains("is-scroll-hidden"));
    });

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => {
        syncHeaderHeight();
        if (!nav.classList.contains("is-scroll-hidden")) syncNavHeight(false);
      });
      ro.observe(header);
      ro.observe(nav);
    }
  }

  function init() {
    const nav = document.querySelector(
      'nav.category-nav[aria-label="Product categories"]'
    );
    if (!nav) return;

    const inner = nav.querySelector(".category-nav-inner");
    if (inner) initMegaMenu(inner);

    const header = document.querySelector("header.site-header");
    if (header) initScrollAwareNav(nav, header);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
