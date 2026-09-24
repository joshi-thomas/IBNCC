/**
 * CC Hub — Product details page
 * Gallery markup (including color image groups) lives in the HTML.
 * This file only handles interactions: color switching, thumbnails, cart/wishlist.
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

  function getSelectedColor(product) {
    const checked = product.querySelector(
      '.pd-prop-options[data-gallery-sync="color"] input[type="radio"]:checked, .pd-prop-options[aria-label="Color"] input[type="radio"]:checked'
    );
    return checked?.value || null;
  }

  function getGallerySets(product) {
    return [...product.querySelectorAll(".pd-gallery .pd-gallery-set")];
  }

  function getActiveGallerySet(product) {
    return (
      product.querySelector(".pd-gallery .pd-gallery-set.is-active") ||
      product.querySelector(".pd-gallery .pd-gallery-set:not([hidden])")
    );
  }

  function resetActiveThumb(set) {
    if (!set) return;
    const thumbs = [...set.querySelectorAll(".pd-thumb")];
    thumbs.forEach((btn, index) => {
      btn.classList.toggle("is-active", index === 0);
    });
    const main = set.querySelector(".pd-main-image");
    const firstSrc =
      thumbs[0]?.dataset.thumbSrc || thumbs[0]?.querySelector("img")?.src;
    if (main && firstSrc) main.src = firstSrc;
  }

  function showColorGallery(product, color, { animate = true } = {}) {
    if (!product) return;
    const sets = getGallerySets(product);
    if (!sets.length) return;

    const target =
      sets.find((set) => set.dataset.color === color) ||
      sets.find((set) => set.classList.contains("is-active")) ||
      sets[0];

    const current = getActiveGallerySet(product);
    if (current === target && target.classList.contains("is-active")) {
      product.dataset.activeColor = target.dataset.color || color || "";
      return;
    }

    const apply = () => {
      sets.forEach((set) => {
        const active = set === target;
        set.classList.toggle("is-active", active);
        set.hidden = !active;
        if (active) {
          set.classList.remove("is-switching");
          resetActiveThumb(set);
        }
      });
      product.dataset.activeColor = target.dataset.color || color || "";
    };

    if (animate && current) {
      current.classList.add("is-switching");
      window.setTimeout(apply, 120);
    } else {
      apply();
    }
  }

  function initColorGalleries() {
    els.products.forEach((product) => {
      const color = getSelectedColor(product);
      const sets = getGallerySets(product);
      if (!sets.length) return;

      if (color) {
        showColorGallery(product, color, { animate: false });
      } else {
        const active =
          sets.find((set) => set.classList.contains("is-active")) || sets[0];
        sets.forEach((set) => {
          const on = set === active;
          set.classList.toggle("is-active", on);
          set.hidden = !on;
        });
      }
    });
  }

  function setMainImage(product, src, thumb) {
    const set = thumb?.closest(".pd-gallery-set") || getActiveGallerySet(product);
    const main = set?.querySelector(".pd-main-image");
    const media = set?.querySelector(".pd-main-media");
    if (!main || !src) return;

    if (main.getAttribute("src") === src) {
      set.querySelectorAll(".pd-thumb").forEach((btn) => {
        btn.classList.toggle("is-active", btn === thumb);
      });
      return;
    }

    media?.classList.add("is-switching");
    window.setTimeout(() => {
      main.src = src;
      set.querySelectorAll(".pd-thumb").forEach((btn) => {
        btn.classList.toggle("is-active", btn === thumb);
      });
      requestAnimationFrame(() => {
        media?.classList.remove("is-switching");
      });
    }, 120);
  }

  function showProduct(id) {
    const match = els.products.find((p) => p.dataset.id === id) || els.products[0];
    els.products.forEach((product) => {
      product.hidden = product !== match;
    });

    const title = match.querySelector(".pd-title")?.textContent?.trim();
    if (title) document.title = `${title} — CC Hub`;

    const color = getSelectedColor(match);
    if (color) showColorGallery(match, color, { animate: false });

    updateSimilar(match);
    syncWishlistButtons();
  }

  function updateSimilar(active) {
    if (!els.similarTrack) return;
    const cards = [...els.similarTrack.querySelectorAll(".pl-card")];
    const id = active.dataset.id;
    const cat = active.dataset.cat;
    const group = active.dataset.group;
    const sameGroup = cards.filter(
      (c) => c.dataset.id !== id && c.dataset.cat === cat && c.dataset.group === group
    );
    const sameCat = cards.filter((c) => c.dataset.id !== id && c.dataset.cat === cat);
    const others = cards.filter((c) => c.dataset.id !== id);
    const visible =
      sameGroup.length >= 2 ? sameGroup : sameCat.length >= 2 ? sameCat : others;

    cards.forEach((card) => {
      card.hidden = !visible.includes(card);
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
    const MAX_QTY = 20;

    document.querySelector(".pd-main")?.addEventListener("click", (e) => {
      const minusBtn = e.target.closest(".cart-qty-control .btn-qty-minus");
      const plusBtn = e.target.closest(".cart-qty-control .btn-qty-plus");
      if (minusBtn || plusBtn) {
        const control = (minusBtn || plusBtn).closest(".cart-qty-control");
        const qtyNum = control?.querySelector(".cart-qty-number");
        if (!qtyNum) return;
        let currentQty = parseInt(qtyNum.textContent.trim(), 10) || 1;
        if (minusBtn && currentQty > 1) {
          qtyNum.textContent = String(currentQty - 1);
        } else if (plusBtn && currentQty < MAX_QTY) {
          qtyNum.textContent = String(currentQty + 1);
        }
        return;
      }

      const thumb = e.target.closest(".pd-gallery-set.is-active .pd-thumb, .pd-gallery-set:not([hidden]) .pd-thumb");
      if (thumb) {
        const product = thumb.closest(".pd-product");
        setMainImage(product, thumb.dataset.thumbSrc, thumb);
        return;
      }

      const thumbPrev = e.target.closest(".pd-thumb-prev");
      const thumbNext = e.target.closest(".pd-thumb-next");
      if (thumbPrev || thumbNext) {
        const product = e.target.closest(".pd-product");
        const set =
          (thumbPrev || thumbNext).closest(".pd-gallery-set") ||
          getActiveGallerySet(product);
        set?.querySelector(".pd-thumbs")?.scrollBy({
          left: thumbPrev ? -120 : 120,
          behavior: "smooth",
        });
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

    document.querySelector(".pd-main")?.addEventListener("change", (e) => {
      const input = e.target.closest(
        '.pd-prop-options[data-gallery-sync="color"] input[type="radio"], .pd-prop-options[aria-label="Color"] input[type="radio"]'
      );
      if (!input || !input.checked) return;
      const product = input.closest(".pd-product");
      if (!product) return;
      showColorGallery(product, input.value, { animate: true });
    });

    els.similarPrev?.addEventListener("click", () =>
      scrollByCard(els.similarViewport, -1)
    );
    els.similarNext?.addEventListener("click", () =>
      scrollByCard(els.similarViewport, 1)
    );
  }

  if (els.products.length) {
    initColorGalleries();
    bindEvents();
    showProduct(requestedId);
    updateCartBadges();
  }
})();
