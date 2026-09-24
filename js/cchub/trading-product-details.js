/**
 * Trading product details — default product param, quantity control, tier selection
 */

(() => {
  "use strict";

  /* Ensure a default product is selected in the URL */
  const params = new URLSearchParams(window.location.search);
  if (!params.get("product")) {
    const next = window.location.pathname + "?product=foam-hat-inserts&cat=home";
    history.replaceState(null, "", next);
  }

  const MAX_QTY = 99999;

  function parseTierRange(text) {
    const raw = String(text || "")
      .replace(/,/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    let m = raw.match(/^[≥>=]+\s*(\d+)/);
    if (m) {
      return { min: Number(m[1]), max: Infinity };
    }

    m = raw.match(/^(\d+)\s*[-–—to]+\s*(\d+)/);
    if (m) {
      return { min: Number(m[1]), max: Number(m[2]) };
    }

    m = raw.match(/(\d+)/);
    if (m) {
      const n = Number(m[1]);
      return { min: n, max: n };
    }

    return { min: 1, max: Infinity };
  }

  function getControlQty(control) {
    const input = control.querySelector(".cart-qty-input");
    let qty = parseInt(input?.value, 10);
    if (!Number.isFinite(qty) || qty < 1) qty = 1;
    if (qty > MAX_QTY) qty = MAX_QTY;
    return qty;
  }

  function setControlQty(control, qty) {
    const input = control.querySelector(".cart-qty-input");
    if (!input) return;
    input.value = String(Math.max(1, Math.min(MAX_QTY, Number(qty) || 1)));
  }

  function getTierWrap(control) {
    const row = control.closest(".pd-qty-row");
    let node = (row || control).previousElementSibling;
    while (node && !node.classList.contains("pd-tier-prices")) {
      node = node.previousElementSibling;
    }
    return (
      node ||
      (row || control).parentElement?.querySelector(
        ".pd-price-wrap.pd-tier-prices"
      )
    );
  }

  function selectTierForQty(control, qty) {
    const wrap = getTierWrap(control);
    if (!wrap) return null;

    const tiers = [...wrap.querySelectorAll(".pd-tier")];
    if (!tiers.length) return null;

    let matched = null;
    tiers.forEach((tier) => {
      const range = parseTierRange(tier.querySelector(".pd-tier-qty")?.textContent);
      tier.dataset.minQty = String(range.min);
      tier.dataset.maxQty = Number.isFinite(range.max) ? String(range.max) : "";
      const inRange = qty >= range.min && qty <= range.max;
      tier.classList.toggle("is-active", inRange);
      if (inRange) matched = tier;
    });

    if (!matched && tiers.length) {
      const first = tiers[0];
      const firstMin = Number(first.dataset.minQty) || 1;
      if (qty < firstMin) {
        first.classList.add("is-active");
        matched = first;
      } else {
        const last = tiers[tiers.length - 1];
        last.classList.add("is-active");
        matched = last;
      }
    }

    return matched;
  }

  function initControl(control) {
    const wrap = getTierWrap(control);
    if (!wrap) return;

    const firstRange = parseTierRange(
      wrap.querySelector(".pd-tier .pd-tier-qty")?.textContent
    );
    const input = control.querySelector(".cart-qty-input");
    if (input) {
      input.min = String(Math.max(1, firstRange.min));
      if (!input.value || Number(input.value) < firstRange.min) {
        input.value = String(Math.max(1, firstRange.min));
      }
    }

    selectTierForQty(control, getControlQty(control));
  }

  function bindControls() {
    document.querySelectorAll(".cart-qty-control").forEach(initControl);

    document.addEventListener("click", (e) => {
      const minus = e.target.closest(".cart-qty-control .btn-qty-minus");
      const plus = e.target.closest(".cart-qty-control .btn-qty-plus");
      if (!minus && !plus) return;

      const control = (minus || plus).closest(".cart-qty-control");
      if (!control) return;

      let qty = getControlQty(control);
      if (minus) qty = Math.max(1, qty - 1);
      if (plus) qty = Math.min(MAX_QTY, qty + 1);
      setControlQty(control, qty);
      selectTierForQty(control, qty);
    });

    document.addEventListener("input", (e) => {
      const input = e.target.closest(".cart-qty-control .cart-qty-input");
      if (!input) return;
      const control = input.closest(".cart-qty-control");
      if (!control) return;
      selectTierForQty(control, getControlQty(control));
    });

    document.addEventListener(
      "change",
      (e) => {
        const input = e.target.closest(".cart-qty-control .cart-qty-input");
        if (!input) return;
        const control = input.closest(".cart-qty-control");
        if (!control) return;
        const qty = getControlQty(control);
        setControlQty(control, qty);
        selectTierForQty(control, qty);
      },
      true
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindControls);
  } else {
    bindControls();
  }
})();
