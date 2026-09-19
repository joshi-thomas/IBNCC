/**
 * CC Hub — Seller page interactions
 * Mode tabs, left nav panels, property/tier rows, gallery preview, stock meter.
 */

(() => {
  "use strict";

  const body = document.body;
  const modeTabs = [...document.querySelectorAll(".seller-mode-tab")];
  const modeHints = [...document.querySelectorAll("[data-mode-hint]")];
  const modeBadges = [...document.querySelectorAll("[data-mode-badge]")];
  const navItems = [...document.querySelectorAll(".seller-nav-item[data-panel]")];
  const panels = [...document.querySelectorAll(".seller-panel[data-panel]")];

  /* ---------- Category / subcategory comboboxes ---------- */
  function initComboboxes() {
    const combos = [...document.querySelectorAll("[data-combo]")];

    function closeCombo(combo) {
      const input = combo.querySelector('input[role="combobox"]');
      const list = combo.querySelector(".seller-combo-list");
      if (!input || !list) return;
      combo.classList.remove("is-open");
      list.hidden = true;
      input.setAttribute("aria-expanded", "false");
      list.querySelectorAll("li.is-active").forEach((li) => li.classList.remove("is-active"));
    }

    function openCombo(combo, { filter = true } = {}) {
      const input = combo.querySelector('input[role="combobox"]');
      const list = combo.querySelector(".seller-combo-list");
      if (!input || !list) return;

      combos.forEach((other) => {
        if (other !== combo) closeCombo(other);
      });

      const query = filter ? input.value.trim().toLowerCase() : "";
      const options = [...list.querySelectorAll('[role="option"]')];
      let visibleCount = 0;

      options.forEach((option) => {
        const value = (option.dataset.value || option.textContent || "").trim();
        const match = !query || value.toLowerCase().includes(query);
        option.hidden = !match;
        option.classList.toggle("is-active", false);
        option.setAttribute("aria-selected", value === input.value ? "true" : "false");
        if (match) visibleCount += 1;
      });

      let empty = list.querySelector(".seller-combo-empty");
      if (visibleCount === 0) {
        if (!empty) {
          empty = document.createElement("li");
          empty.className = "seller-combo-empty";
          empty.setAttribute("aria-disabled", "true");
          empty.textContent = "No matching options — keep typing to use a custom value";
          list.appendChild(empty);
        }
        empty.hidden = false;
      } else if (empty) {
        empty.hidden = true;
      }

      // When opening via chevron, show the full list
      if (!filter) {
        options.forEach((option) => {
          option.hidden = false;
        });
        if (empty) empty.hidden = true;
      }

      combo.classList.add("is-open");
      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
    }

    function selectOption(combo, option) {
      const input = combo.querySelector('input[role="combobox"]');
      if (!input || !option) return;
      const value = option.dataset.value || option.textContent.trim();
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      closeCombo(combo);
      input.focus();
    }

    combos.forEach((combo) => {
      const input = combo.querySelector('input[role="combobox"]');
      const toggle = combo.querySelector(".seller-combo-toggle");
      const list = combo.querySelector(".seller-combo-list");
      if (!input || !toggle || !list) return;

      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (combo.classList.contains("is-open") && !list.hidden) {
          closeCombo(combo);
        } else {
          openCombo(combo, { filter: false });
          input.focus();
        }
      });

      input.addEventListener("focus", () => {
        openCombo(combo, { filter: false });
      });

      input.addEventListener("input", () => {
        openCombo(combo, { filter: true });
      });

      input.addEventListener("keydown", (e) => {
        const visible = [...list.querySelectorAll('[role="option"]:not([hidden])')];
        const active = list.querySelector("li.is-active");
        const idx = visible.indexOf(active);

        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (list.hidden) openCombo(combo, { filter: false });
          const next = visible[Math.min(idx + 1, visible.length - 1)] || visible[0];
          visible.forEach((li) => li.classList.toggle("is-active", li === next));
          next?.scrollIntoView({ block: "nearest" });
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (list.hidden) openCombo(combo, { filter: false });
          const prev = visible[Math.max(idx - 1, 0)] || visible[visible.length - 1];
          visible.forEach((li) => li.classList.toggle("is-active", li === prev));
          prev?.scrollIntoView({ block: "nearest" });
        } else if (e.key === "Enter") {
          if (!list.hidden && active) {
            e.preventDefault();
            selectOption(combo, active);
          } else {
            closeCombo(combo);
          }
        } else if (e.key === "Escape") {
          closeCombo(combo);
        }
      });

      list.addEventListener("mousedown", (e) => {
        const option = e.target.closest('[role="option"]');
        if (!option || option.hidden) return;
        e.preventDefault();
        selectOption(combo, option);
      });
    });

    document.addEventListener("click", (e) => {
      combos.forEach((combo) => {
        if (!combo.contains(e.target)) closeCombo(combo);
      });
    });
  }

  initComboboxes();

  function setMode(mode) {
    const next = mode === "trading" ? "trading" : "marketplace";
    body.dataset.sellerMode = next;

    modeTabs.forEach((tab) => {
      const active = tab.dataset.mode === next;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });

    modeHints.forEach((hint) => {
      hint.hidden = hint.dataset.modeHint !== next;
    });

    modeBadges.forEach((badge) => {
      badge.textContent = next === "trading" ? "Trading" : "Marketplace";
      badge.dataset.mode = next;
    });

    // Prefer bulk-focused panels when switching into Trading
    if (next === "trading") {
      const activePanel = document.querySelector(".seller-nav-item.is-active")?.dataset.panel;
      if (activePanel === "retail-orders" || activePanel === "pricing") {
        showPanel(activePanel === "retail-orders" ? "bulk-orders" : "bulk-rule");
      }
    }
  }

  function showPanel(panelId) {
    navItems.forEach((item) => {
      const active = item.dataset.panel === panelId;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", active ? "true" : "false");
    });

    panels.forEach((panel) => {
      const active = panel.dataset.panel === panelId;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  }

  modeTabs.forEach((tab) => {
    tab.addEventListener("click", () => setMode(tab.dataset.mode));
  });

  navItems.forEach((item) => {
    item.addEventListener("click", () => showPanel(item.dataset.panel));
  });

  /* ---------- Product details: property rows ---------- */
  const propertyRows = document.getElementById("propertyRows");
  const addPropertyRow = document.getElementById("addPropertyRow");

  function bindRemoveButtons(root) {
    root?.querySelectorAll(".seller-row-remove").forEach((btn) => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", () => {
        const row = btn.closest(".seller-prop-row, .seller-tier-row");
        const parent = row?.parentElement;
        if (!row || !parent) return;
        if (parent.children.length <= 1) {
          row.querySelectorAll("input").forEach((input) => {
            input.value = "";
          });
          return;
        }
        row.remove();
      });
    });
  }

  addPropertyRow?.addEventListener("click", () => {
    if (!propertyRows) return;
    const row = document.createElement("div");
    row.className = "seller-prop-row";
    row.innerHTML = `
      <input type="text" name="property" value="" placeholder="Property (e.g. Color)" aria-label="Property" />
      <input type="text" name="value" value="" placeholder="Value (e.g. Black)" aria-label="Value" />
      <button type="button" class="seller-row-remove" aria-label="Remove row">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
    `;
    propertyRows.appendChild(row);
    bindRemoveButtons(row);
    row.querySelector("input")?.focus();
  });

  bindRemoveButtons(propertyRows);

  document.getElementById("saveDetails")?.addEventListener("click", () => {
    flashSaved(document.getElementById("saveDetails"));
  });

  /* ---------- Gallery preview ---------- */
  const mainImage = document.getElementById("detailsMainImage");
  const thumbs = [...document.querySelectorAll("#detailsThumbs .seller-thumb")];
  let thumbIndex = Math.max(
    0,
    thumbs.findIndex((t) => t.classList.contains("is-active"))
  );

  function selectThumb(index) {
    if (!thumbs.length || !mainImage) return;
    thumbIndex = (index + thumbs.length) % thumbs.length;
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle("is-active", i === thumbIndex);
    });
    const src = thumbs[thumbIndex].dataset.src;
    if (src) mainImage.src = src;
  }

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener("click", () => selectThumb(i));
  });

  document.getElementById("thumbPrev")?.addEventListener("click", () => {
    selectThumb(thumbIndex - 1);
  });
  document.getElementById("thumbNext")?.addEventListener("click", () => {
    selectThumb(thumbIndex + 1);
  });

  /* ---------- Price tiers ---------- */
  const tierList = document.getElementById("tierList");
  const addTierRow = document.getElementById("addTierRow");

  addTierRow?.addEventListener("click", () => {
    if (!tierList) return;
    const row = document.createElement("div");
    row.className = "seller-tier-row";
    row.innerHTML = `
      <label>From
        <input type="number" name="from" value="" min="1" />
      </label>
      <label>To
        <input type="number" name="to" value="" min="1" placeholder="∞" />
      </label>
      <label>Price / unit (₹)
        <input type="number" name="price" value="" min="0" step="0.01" />
      </label>
      <button type="button" class="seller-row-remove" aria-label="Remove tier">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
    `;
    tierList.appendChild(row);
    bindRemoveButtons(row);
    row.querySelector("input")?.focus();
  });

  bindRemoveButtons(tierList);

  document.getElementById("saveTiers")?.addEventListener("click", () => {
    flashSaved(document.getElementById("saveTiers"));
  });

  /* ---------- Stock meter ---------- */
  const stockQty = document.getElementById("stockQty");
  const stockThreshold = document.getElementById("stockThreshold");
  const stockMeter = document.getElementById("stockMeter");
  const stockMeterLabel = document.getElementById("stockMeterLabel");

  function updateStockMeter() {
    if (!stockMeter || !stockQty || !stockThreshold) return;
    const qty = Number(stockQty.value) || 0;
    const threshold = Number(stockThreshold.value) || 0;
    const low = qty <= threshold;
    stockMeter.classList.toggle("is-low", low);
    const bar = stockMeter.querySelector(".bar > span");
    if (bar) {
      const pct = Math.max(8, Math.min(100, Math.round((qty / Math.max(threshold * 4, qty, 1)) * 100)));
      bar.style.width = `${pct}%`;
    }
    if (stockMeterLabel) {
      stockMeterLabel.textContent = low
        ? `${qty} units — at or below low-stock threshold (${threshold})`
        : `${qty} units available — above threshold (${threshold})`;
    }
  }

  stockQty?.addEventListener("input", updateStockMeter);
  stockThreshold?.addEventListener("input", updateStockMeter);
  updateStockMeter();

  /* ---------- Soft save feedback ---------- */
  function flashSaved(btn) {
    if (!btn) return;
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Saved';
    btn.disabled = true;
    window.setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled = false;
    }, 1400);
  }

  document.querySelectorAll('.seller-form[onsubmit], .seller-form').forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      flashSaved(btn);
    });
  });

  document.getElementById("resetAddEdit")?.addEventListener("click", () => {
    const form = document.getElementById("formAddEdit");
    form?.reset();
  });

  /* Image upload / remove (Add / edit product) */
  const productImages = document.getElementById("productImages");
  const addImageSlot = document.getElementById("addImageSlot");
  const productImageInput = document.getElementById("productImageInput");

  function revokeThumbUrl(thumb) {
    const img = thumb?.querySelector("img");
    const src = img?.getAttribute("src") || "";
    if (src.startsWith("blob:")) URL.revokeObjectURL(src);
  }

  function ensureActiveThumb() {
    if (!productImages) return;
    const thumbs = [...productImages.querySelectorAll(".seller-thumb")];
    if (!thumbs.length) return;
    if (!thumbs.some((thumb) => thumb.classList.contains("is-active"))) {
      thumbs[0].classList.add("is-active");
    }
  }

  function createProductThumb(src, alt) {
    const thumb = document.createElement("div");
    thumb.className = "seller-thumb";
    thumb.innerHTML = `
      <img src="${src}" alt="${alt}" />
      <button type="button" class="seller-thumb-remove" aria-label="Remove image">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
    `;
    return thumb;
  }

  addImageSlot?.addEventListener("click", () => {
    productImageInput?.click();
  });

  productImageInput?.addEventListener("change", () => {
    const files = [...(productImageInput.files || [])].filter((file) =>
      file.type.startsWith("image/")
    );
    if (!files.length || !productImages || !addImageSlot) {
      productImageInput.value = "";
      return;
    }

    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const thumb = createProductThumb(url, file.name || "Product image");
      productImages.insertBefore(thumb, addImageSlot);
    });

    ensureActiveThumb();
    productImageInput.value = "";
  });

  productImages?.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".seller-thumb-remove");
    if (removeBtn) {
      e.preventDefault();
      e.stopPropagation();
      const thumb = removeBtn.closest(".seller-thumb");
      if (!thumb || !productImages.contains(thumb)) return;
      const wasActive = thumb.classList.contains("is-active");
      revokeThumbUrl(thumb);
      thumb.remove();
      if (wasActive) ensureActiveThumb();
      return;
    }

    const thumb = e.target.closest(".seller-thumb");
    if (!thumb || !productImages.contains(thumb)) return;
    productImages.querySelectorAll(".seller-thumb").forEach((item) => {
      item.classList.toggle("is-active", item === thumb);
    });
  });

  // Init
  setMode(body.dataset.sellerMode || "marketplace");
  showPanel("add-edit");
})();
