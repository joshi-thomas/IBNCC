/**
 * CC Hub — Product details page
 * Catalog markup lives in product-details.html; this file only handles gallery, similar products, and cart/wishlist.
 */

(() => {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("product") || "oneplus-nord-ce6";

  const state = {
    wishlist: new Set(JSON.parse(sessionStorage.getItem("plWishlist") || "[]")),
    cartCount: Number(sessionStorage.getItem("plCartCount") || "0"),
  };

  const els = {
    products: [...document.querySelectorAll(".pd-product")],
    similarTrack: document.getElementById("pdSimilarTrack"),
    similarViewport: document.getElementById("pdSimilarViewport"),
    similarPrev: document.getElementById("pdSimilarPrev"),
    similarNext: document.getElementById("pdSimilarNext"),
  };

  function updateCartBadges() {
    document.querySelectorAll(".cart-badge").forEach((badge) => {
      badge.textContent = String(state.cartCount);
    });
  }

  function syncWishlistButtons() {
    document.querySelectorAll("[data-wish]").forEach((btn) => {
      const on = state.wishlist.has(btn.dataset.wish);
      btn.classList.toggle("is-active", on);
      const icon = btn.querySelector("i");
      if (icon) icon.className = on ? "fa-solid fa-heart" : "fa-regular fa-heart";
    });
  }

  function showProduct(id) {
    const match = els.products.find((p) => p.dataset.id === id) || els.products[0];
    els.products.forEach((product) => {
      product.hidden = product !== match;
    });

    const title = match.querySelector(".pd-title")?.textContent?.trim();
    if (title) document.title = `${title} — CC Hub`;

    updateSimilar(match);
    syncWishlistButtons();
  }

  function updateSimilar(active) {
    if (!els.similarTrack) return;
    const cards = [...els.similarTrack.querySelectorAll(".pl-card")];
    const id = active.dataset.id;
    const cat = active.dataset.cat;
    const group = active.dataset.group;
    const sameGroup = cards.filter((c) => c.dataset.id !== id && c.dataset.cat === cat && c.dataset.group === group);
    const sameCat = cards.filter((c) => c.dataset.id !== id && c.dataset.cat === cat);
    const others = cards.filter((c) => c.dataset.id !== id);
    const visible = sameGroup.length >= 2 ? sameGroup : sameCat.length >= 2 ? sameCat : others;

    cards.forEach((card) => {
      card.hidden = !visible.includes(card);
    });
  }

  function setMainImage(product, src, thumb) {
    const main = product.querySelector(".pd-main-image");
    if (main && src) main.src = src;
    product.querySelectorAll(".pd-thumb").forEach((btn) => {
      btn.classList.toggle("is-active", btn === thumb);
    });
  }

  function scrollByCard(viewport, direction) {
    const firstCard = viewport.querySelector(".pl-card:not([hidden])");
    const amount = firstCard ? firstCard.getBoundingClientRect().width + 16 : 260;
    viewport.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  function toggleWishlist(id) {
    if (!id) return;
    if (state.wishlist.has(id)) state.wishlist.delete(id);
    else state.wishlist.add(id);
    sessionStorage.setItem("plWishlist", JSON.stringify([...state.wishlist]));
    syncWishlistButtons();
  }

  function addToCart() {
    state.cartCount += 1;
    sessionStorage.setItem("plCartCount", String(state.cartCount));
    updateCartBadges();
  }

  function goToPayment() {
    window.location.href = "payment.html";
  }

  function bindEvents() {
    document.querySelector(".pd-main")?.addEventListener("click", (e) => {
      const thumb = e.target.closest(".pd-thumb");
      if (thumb) {
        const product = thumb.closest(".pd-product");
        setMainImage(product, thumb.dataset.thumbSrc, thumb);
        return;
      }

      const thumbPrev = e.target.closest(".pd-thumb-prev");
      const thumbNext = e.target.closest(".pd-thumb-next");
      if (thumbPrev || thumbNext) {
        const thumbs = e.target.closest(".pd-product")?.querySelector(".pd-thumbs");
        thumbs?.scrollBy({ left: thumbPrev ? -120 : 120, behavior: "smooth" });
        return;
      }

      const buyNow = e.target.closest(".pd-btn-buy");
      if (buyNow) {
        e.preventDefault();
        goToPayment();
        return;
      }

      const wish = e.target.closest("[data-wish]");
      if (wish) {
        e.preventDefault();
        toggleWishlist(wish.dataset.wish);
        return;
      }

      const cart = e.target.closest("[data-cart]");
      if (cart) addToCart();
    });

    els.similarPrev?.addEventListener("click", () => scrollByCard(els.similarViewport, -1));
    els.similarNext?.addEventListener("click", () => scrollByCard(els.similarViewport, 1));
  }

  if (els.products.length) {
    bindEvents();
    showProduct(requestedId);
    updateCartBadges();
  }
})();
