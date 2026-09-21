/**
 * CC Hub — Your Store
 * Marketplace / Trading + Product Gallery / Order Details switching.
 */

(() => {
  "use strict";

  const body = document.body;
  const modeTabs = [...document.querySelectorAll("[data-store-mode-tab]")];
  const viewTabs = [...document.querySelectorAll("[data-store-view-tab]")];
  const panes = {
    marketplaceGallery: document.getElementById("storeMarketplaceGallery"),
    tradingGallery: document.getElementById("storeTradingGallery"),
    retailOrders: document.getElementById("panel-retail-orders"),
    bulkOrders: document.getElementById("panel-bulk-orders"),
  };

  function currentMode() {
    return body.dataset.storeMode === "trading" ? "trading" : "marketplace";
  }

  function currentView() {
    return body.dataset.storeView === "orders" ? "orders" : "gallery";
  }

  function setPaneVisibility() {
    const mode = currentMode();
    const view = currentView();

    const showMarketplaceGallery = mode === "marketplace" && view === "gallery";
    const showTradingGallery = mode === "trading" && view === "gallery";
    const showRetailOrders = mode === "marketplace" && view === "orders";
    const showBulkOrders = mode === "trading" && view === "orders";

    if (panes.marketplaceGallery) panes.marketplaceGallery.hidden = !showMarketplaceGallery;
    if (panes.tradingGallery) panes.tradingGallery.hidden = !showTradingGallery;
    if (panes.retailOrders) panes.retailOrders.hidden = !showRetailOrders;
    if (panes.bulkOrders) panes.bulkOrders.hidden = !showBulkOrders;
  }

  function setMode(mode) {
    const next = mode === "trading" ? "trading" : "marketplace";
    body.dataset.storeMode = next;
    modeTabs.forEach((tab) => {
      const active = tab.dataset.storeModeTab === next;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    setPaneVisibility();
  }

  function setView(view) {
    const next = view === "orders" ? "orders" : "gallery";
    body.dataset.storeView = next;
    viewTabs.forEach((tab) => {
      const active = tab.dataset.storeViewTab === next;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    setPaneVisibility();
  }

  modeTabs.forEach((tab) => {
    tab.addEventListener("click", () => setMode(tab.dataset.storeModeTab));
  });

  viewTabs.forEach((tab) => {
    tab.addEventListener("click", () => setView(tab.dataset.storeViewTab));
  });

  document.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".pl-btn-remove");
    if (!removeBtn) return;
    const card = removeBtn.closest(".pl-card");
    if (!card) return;
    card.remove();

    const grid = removeBtn.closest(".pl-grid") || document.querySelector(".your-store-pane:not([hidden]) .pl-grid");
    if (grid && !grid.querySelector(".pl-card")) {
      const empty = document.createElement("p");
      empty.className = "your-store-empty";
      empty.textContent = "No products in this gallery yet.";
      grid.replaceWith(empty);
    }
  });

  setMode(body.dataset.storeMode || "marketplace");
  setView(body.dataset.storeView || "gallery");
})();
