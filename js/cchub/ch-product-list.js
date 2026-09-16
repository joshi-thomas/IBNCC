/**
 * CC Hub — Product list page
 * Product cards and subcategory gallery markup live in ch-product-list.html;
 * this file only filters, sorts, toggles UI, and handles interactions.
 */

(() => {
  "use strict";

  const CATEGORY_LABELS = {
    electronics: "Electronics",
    appliances: "TVs & Appliances",
    men: "Men",
    women: "Women",
    kids: "Baby & Kids",
    home: "Home & Furniture",
    sports: "Sports, Books & More",
    farm: "Farm & Garden",
    food: "Food Items",
  };

  const SORT_LABELS = {
    relevance: "Relevance",
    popularity: "Popularity",
    "price-asc": "Price — Low to High",
    "price-desc": "Price — High to Low",
    rating: "Customer Rating",
    newest: "Newest",
  };

  const ITEM_FILTER_MAP = {
    "power banks": "powerBanks",
    cases: "mobileCases",
    "mobile cases": "mobileCases",
    headphones: "headphones",
    "headphones and headsets": "headphones",
    "smart watches": "smartWatches",
    "smart bands": "smartWatches",
    "smart glasses": "smartWatches",
    "gaming laptops": "laptops",
    "thin & light": "laptops",
    "2-in-1 laptops": "laptops",
    laptops: "laptops",
  };

  const GROUP_FILTER_MAP = {
    mobiles: "mobiles",
    "mobile accessories": "mobileCases",
    "smart wearable tech": "smartWatches",
    "health care appliances": "default",
    laptops: "laptops",
    "desktop pcs": "default",
  };

  const params = new URLSearchParams(window.location.search);
  const state = {
    cat: params.get("cat") || "electronics",
    group: params.get("group") || "",
    item: params.get("item") || "",
    sort: "popularity",
    wishlist: new Set(JSON.parse(sessionStorage.getItem("plWishlist") || "[]")),
    cartCount: Number(sessionStorage.getItem("plCartCount") || "0"),
  };

  const els = {
    breadcrumb: document.getElementById("plBreadcrumb"),
    subcatGallery: document.getElementById("plSubcatGallery"),
    title: document.getElementById("plTitle"),
    count: document.getElementById("plCount"),
    filters: document.getElementById("plFilters"),
    applied: document.getElementById("plApplied"),
    sortTabs: document.getElementById("plSortTabs"),
    grid: document.getElementById("plGrid"),
    empty: document.getElementById("plEmpty"),
    sidebar: document.getElementById("plSidebar"),
    backdrop: document.getElementById("plSidebarBackdrop"),
    fab: document.getElementById("plFiltersFab"),
    closeSidebar: document.getElementById("plSidebarClose"),
    clearAll: document.getElementById("plClearAll"),
  };

  const SUBCAT_MQ = window.matchMedia("(max-width: 1198px)");

  function norm(s) {
    return (s || "").trim().toLowerCase();
  }

  function formatPrice(n) {
    return `₹${Number(n).toLocaleString("en-IN")}`;
  }

  function pageTitle() {
    if (state.item) return state.item;
    if (state.group) return state.group;
    return CATEGORY_LABELS[state.cat] || "Products";
  }

  function resolveFilterPreset() {
    const itemKey = norm(state.item);
    const groupKey = norm(state.group);

    if (itemKey && ITEM_FILTER_MAP[itemKey]) return ITEM_FILTER_MAP[itemKey];
    if (itemKey.includes("power bank")) return "powerBanks";
    if (itemKey.includes("case")) return "mobileCases";
    if (groupKey && GROUP_FILTER_MAP[groupKey]) return GROUP_FILTER_MAP[groupKey];
    if (state.cat === "men" || state.cat === "women") return "men";
    if (state.cat === "farm") return "farm";
    if (state.cat === "food") return "food";
    if (state.cat === "electronics" && !state.group) return "mobiles";
    return "default";
  }

  function activeFilterSet() {
    return els.filters?.querySelector(".pl-filter-set:not([hidden])") || els.filters;
  }

  function showFilterPreset() {
    const preset = resolveFilterPreset();
    els.filters?.querySelectorAll(".pl-filter-set").forEach((set) => {
      set.hidden = set.dataset.preset !== preset;
    });
  }

  function renderBreadcrumb() {
    const parts = [
      { label: "Home", href: "ch-trading.html" },
      {
        label: CATEGORY_LABELS[state.cat] || state.cat,
        href: `product-list.html?cat=${encodeURIComponent(state.cat)}`,
      },
    ];
    if (state.group) {
      parts.push({
        label: state.group,
        href: `product-list.html?cat=${encodeURIComponent(state.cat)}&group=${encodeURIComponent(state.group)}`,
      });
    }
    if (state.item) parts.push({ label: state.item, href: null });

    els.breadcrumb.innerHTML = parts
      .map((p, idx) => {
        const isLast = idx === parts.length - 1;
        if (isLast) return `<span aria-current="page">${p.label}</span>`;
        return `<a href="${p.href}">${p.label}</a><span aria-hidden="true">›</span>`;
      })
      .join(" ");
  }

  function highlightActiveCategory() {
    document.querySelectorAll(".category-item").forEach((el) => {
      const href = el.getAttribute("href") || "";
      el.classList.toggle("is-active", href.includes(`cat=${state.cat}`));
    });
  }

  function renderSubcatGallery() {
    const gallery = els.subcatGallery;
    if (!gallery) return;

    const sets = gallery.querySelectorAll(".pl-subcat-set");
    sets.forEach((set) => {
      set.hidden = true;
    });

    if (!SUBCAT_MQ.matches) {
      gallery.hidden = true;
      return;
    }

    const active = gallery.querySelector(
      '.pl-subcat-set[data-cat="' + state.cat + '"]'
    );
    if (!active || !active.querySelector(".pl-subcat-card")) {
      gallery.hidden = true;
      return;
    }

    active.hidden = false;
    gallery.hidden = false;
  }

  function readFilters() {
    const set = activeFilterSet();
    const filters = {};
    if (!set) return filters;

    set.querySelectorAll('input[type="checkbox"][data-filter]:checked').forEach((cb) => {
      const id = cb.dataset.filter;
      if (!filters[id]) filters[id] = [];
      filters[id].push(cb.value);
    });

    set.querySelectorAll('input[type="range"][data-filter]').forEach((range) => {
      const max = Number(range.max);
      const value = Number(range.value);
      if (value < max) filters[range.dataset.filter] = { max: value };
    });

    return filters;
  }

  function cardAttr(card, id) {
    return card.getAttribute(`data-${id.toLowerCase()}`) || "";
  }

  function matchesContext(card) {
    if (state.cat && card.dataset.cat !== state.cat) return false;
    if (state.group && norm(card.dataset.group) !== norm(state.group)) return false;
    if (state.item && norm(card.dataset.item) !== norm(state.item)) return false;
    return true;
  }

  function productMatchesFilters(card, filters) {
    return Object.entries(filters).every(([id, val]) => {
      if (Array.isArray(val) && val.length) {
        if (id === "rating") {
          const min = val.some((v) => v.includes("4")) ? 4 : 3;
          return Number(card.dataset.rating) >= min;
        }
        if (id === "discount") {
          const minDisc = Math.min(...val.map((v) => parseInt(v, 10) || 0));
          return Number(card.dataset.discount) >= minDisc;
        }
        const attr = cardAttr(card, id);
        const specs = card.querySelector(".pl-card-specs")?.textContent || "";
        return val.some((v) => attr === v || specs.includes(v));
      }
      if (val && typeof val === "object" && val.max != null) {
        return Number(card.dataset.price) <= val.max;
      }
      return true;
    });
  }

  function sortCards(list) {
    const sorted = [...list];
    switch (state.sort) {
      case "price-asc":
        sorted.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
        break;
      case "price-desc":
        sorted.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
        break;
      case "rating":
        sorted.sort((a, b) => Number(b.dataset.rating) - Number(a.dataset.rating));
        break;
      case "newest":
        sorted.sort((a, b) => (b.dataset.id || "").localeCompare(a.dataset.id || ""));
        break;
      case "popularity":
        sorted.sort((a, b) => Number(b.dataset.reviews) - Number(a.dataset.reviews));
        break;
      default:
        break;
    }
    return sorted;
  }

  function capitalize(s) {
    return s.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
  }

  function renderApplied(filters) {
    const chips = [];
    const sortLabel = SORT_LABELS[state.sort];
    if (sortLabel && state.sort !== "relevance") {
      chips.push({ key: "__sort", label: `Sort: ${sortLabel}` });
    }
    Object.entries(filters).forEach(([id, val]) => {
      if (Array.isArray(val)) {
        val.forEach((v) => chips.push({ key: `${id}::${v}`, label: `${capitalize(id)}: ${v}` }));
      } else if (val && typeof val === "object" && val.max != null) {
        chips.push({ key: id, label: `Price: up to ${formatPrice(val.max)}` });
      }
    });

    if (!chips.length) {
      els.applied.innerHTML = `<span class="pl-applied-empty">No filters applied</span>`;
      return;
    }
    els.applied.innerHTML = chips
      .map(
        (c) =>
          `<span class="pl-chip">${c.label}<button type="button" data-remove="${c.key}" aria-label="Remove filter">×</button></span>`
      )
      .join("");
  }

  function renderSortTabs() {
    els.sortTabs?.querySelectorAll("[data-sort]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.sort === state.sort);
    });
  }

  function syncWishlistButtons() {
    els.grid?.querySelectorAll("[data-wish]").forEach((btn) => {
      const on = state.wishlist.has(btn.dataset.wish);
      btn.classList.toggle("is-active", on);
      const icon = btn.querySelector("i");
      if (icon) icon.className = on ? "fa-solid fa-heart" : "fa-regular fa-heart";
    });
  }

  function applyView() {
    const filters = readFilters();
    const cards = [...(els.grid?.querySelectorAll(".pl-card") || [])];
    const inContext = cards.filter(matchesContext);
    const matched = sortCards(inContext.filter((card) => productMatchesFilters(card, filters)));

    cards.forEach((card) => {
      card.hidden = true;
    });
    matched.forEach((card) => {
      card.hidden = false;
      els.grid.appendChild(card);
    });

    const showing = matched.length;
    const total = inContext.length;
    els.title.textContent = pageTitle();
    els.count.textContent =
      showing > 0
        ? `(Showing 1 – ${showing} products of ${total.toLocaleString("en-IN")} products)`
        : `(Showing 0 of ${total.toLocaleString("en-IN")} products)`;
    els.empty.hidden = showing > 0;

    renderApplied(filters);
    renderSortTabs();
    syncWishlistButtons();
  }

  function resetFilterInputs() {
    els.filters?.querySelectorAll('input[type="checkbox"][data-filter]').forEach((cb) => {
      cb.checked = false;
    });
    els.filters?.querySelectorAll('input[type="range"][data-filter]').forEach((range) => {
      range.value = range.max;
      const label = range.closest(".pl-price-range")?.querySelector(".pl-price-labels span:last-child");
      if (label) label.textContent = formatPrice(Number(range.max));
    });
  }

  function updateCartBadge() {
    document.querySelectorAll(".cart-badge").forEach((el) => {
      el.textContent = String(state.cartCount);
    });
  }

  function bindEvents() {
    els.sortTabs?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-sort]");
      if (!btn) return;
      state.sort = btn.dataset.sort;
      applyView();
    });

    els.filters?.addEventListener("change", (e) => {
      if (!e.target.closest("[data-filter]")) return;
      applyView();
    });

    els.filters?.addEventListener("input", (e) => {
      const range = e.target.closest("[data-range]");
      if (!range) return;
      const label = range.closest(".pl-price-range")?.querySelector(".pl-price-labels span:last-child");
      if (label) label.textContent = formatPrice(Number(range.value));
      applyView();
    });

    els.applied?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove]");
      if (!btn) return;
      const key = btn.dataset.remove;
      const set = activeFilterSet();

      if (key === "__sort") {
        state.sort = "relevance";
      } else if (key.includes("::")) {
        const [id, val] = key.split("::");
        set?.querySelectorAll(`input[type="checkbox"][data-filter="${id}"]`).forEach((cb) => {
          if (cb.value === val) cb.checked = false;
        });
      } else {
        set?.querySelectorAll(`input[type="range"][data-filter="${key}"]`).forEach((range) => {
          range.value = range.max;
          const label = range.closest(".pl-price-range")?.querySelector(".pl-price-labels span:last-child");
          if (label) label.textContent = formatPrice(Number(range.max));
        });
      }
      applyView();
    });

    els.clearAll?.addEventListener("click", () => {
      state.sort = "popularity";
      resetFilterInputs();
      applyView();
    });

    els.grid?.addEventListener("click", (e) => {
      const wish = e.target.closest("[data-wish]");
      const cart = e.target.closest("[data-cart]");
      if (wish) {
        const id = wish.dataset.wish;
        if (state.wishlist.has(id)) state.wishlist.delete(id);
        else state.wishlist.add(id);
        sessionStorage.setItem("plWishlist", JSON.stringify([...state.wishlist]));
        syncWishlistButtons();
      }
      if (cart) {
        state.cartCount += 1;
        sessionStorage.setItem("plCartCount", String(state.cartCount));
        updateCartBadge();
      }
    });

    els.fab?.addEventListener("click", () => {
      els.sidebar?.classList.add("is-open");
      els.backdrop?.classList.add("is-visible");
      els.backdrop.hidden = false;
    });

    els.closeSidebar?.addEventListener("click", closeSidebar);
    els.backdrop?.addEventListener("click", closeSidebar);
  }

  function closeSidebar() {
    els.sidebar?.classList.remove("is-open");
    els.backdrop?.classList.remove("is-visible");
    els.backdrop.hidden = true;
  }

  if (els.grid) {
    bindEvents();
    renderBreadcrumb();
    showFilterPreset();
    highlightActiveCategory();
    renderSubcatGallery();
    applyView();
    updateCartBadge();

    const onViewportChange = () => renderSubcatGallery();
    if (typeof SUBCAT_MQ.addEventListener === "function") {
      SUBCAT_MQ.addEventListener("change", onViewportChange);
    } else if (typeof SUBCAT_MQ.addListener === "function") {
      SUBCAT_MQ.addListener(onViewportChange);
    }
  }
})();
