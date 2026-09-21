/**
 * CC Hub — Order table auto-removal by Order Date retention setting.
 * Used on seller_page.html and your-store.html.
 */

(() => {
  "use strict";

  const STORAGE_KEY = "ccHubOrderRetentionDays";
  const MONTHS = {
    jan: 0,
    january: 0,
    feb: 1,
    february: 1,
    mar: 2,
    march: 2,
    apr: 3,
    april: 3,
    may: 4,
    jun: 5,
    june: 5,
    jul: 6,
    july: 6,
    aug: 7,
    august: 7,
    sep: 8,
    sept: 8,
    september: 8,
    oct: 9,
    october: 9,
    nov: 10,
    november: 10,
    dec: 11,
    december: 11,
  };

  function parseOrderDate(value) {
    if (!value) return null;
    const iso = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [y, m, d] = iso.split("-").map(Number);
      return new Date(y, m - 1, d);
    }

    const match = iso.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
    if (!match) return null;
    const day = Number(match[1]);
    const month = MONTHS[match[2].toLowerCase()];
    const year = Number(match[3]);
    if (month == null || !day || !year) return null;
    return new Date(year, month, day);
  }

  function daysBetween(fromDate, toDate) {
    const from = Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    const to = Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
    return Math.floor((to - from) / 86400000);
  }

  function getOrderDate(row) {
    if (row.dataset.orderDate) return parseOrderDate(row.dataset.orderDate);
    const cells = row.querySelectorAll("td");
    // Order Date is the second column in current tables
    if (cells.length > 1) return parseOrderDate(cells[1].textContent || "");
    return null;
  }

  function ensureEmptyNotice(table) {
    let notice = table.parentElement?.querySelector(".seller-order-empty");
    if (!notice) {
      notice = document.createElement("p");
      notice.className = "seller-order-empty";
      notice.hidden = true;
      notice.textContent = "No orders in this period. Older records were removed by your retention setting.";
      table.insertAdjacentElement("afterend", notice);
    }
    return notice;
  }

  function applyRetention(table, days) {
    if (!table) return;
    const today = new Date();
    let visibleCount = 0;

    [...table.tBodies].forEach((tbody) => {
      const rows = [...tbody.querySelectorAll("tr")];
      rows.forEach((row) => {
        if (row.classList.contains("store-buyer-detail")) return;

        const orderDate = getOrderDate(row);
        const ageDays = orderDate ? daysBetween(new Date(orderDate), new Date(today)) : 0;
        const shouldRemove = orderDate != null && ageDays > days;
        row.hidden = shouldRemove;
        if (!shouldRemove) visibleCount += 1;

        const detail = row.nextElementSibling;
        if (detail?.classList.contains("store-buyer-detail")) {
          if (shouldRemove) {
            detail.hidden = true;
            const toggle = row.querySelector(".store-buyer-toggle");
            toggle?.setAttribute("aria-expanded", "false");
          }
        }
      });
    });

    const notice = ensureEmptyNotice(table);
    notice.hidden = visibleCount > 0;
    table.hidden = visibleCount === 0;
  }

  function initRetentionControls() {
    const controls = [...document.querySelectorAll("[data-order-retention]")];
    if (!controls.length) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    const defaultDays = saved === "30" || saved === "45" || saved === "60" ? saved : "60";

    controls.forEach((select) => {
      const tableId = select.getAttribute("data-order-retention");
      const table = tableId ? document.getElementById(tableId) : select.closest(".seller-table-wrap")?.querySelector("table.seller-table");
      if (!table) return;

      if (![...select.options].some((opt) => opt.value === defaultDays)) {
        select.value = select.options[0]?.value || "60";
      } else {
        select.value = defaultDays;
      }

      const apply = () => {
        const days = Number(select.value) || 60;
        localStorage.setItem(STORAGE_KEY, String(days));
        // Keep all selects on the page in sync
        controls.forEach((other) => {
          if (other !== select) other.value = String(days);
        });
        document.querySelectorAll("table.seller-table[data-order-table]").forEach((tbl) => {
          applyRetention(tbl, days);
        });
      };

      select.addEventListener("change", apply);
      applyRetention(table, Number(select.value) || 60);
    });

    // Initial sync across all tables once
    const days = Number(defaultDays) || 60;
    document.querySelectorAll("table.seller-table[data-order-table]").forEach((tbl) => {
      applyRetention(tbl, days);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRetentionControls);
  } else {
    initRetentionControls();
  }
})();
