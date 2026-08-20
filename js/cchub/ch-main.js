/**
 * CC Hub — Hero interactions
 * Slider autoplay, tabs, and scroll animations
 */

(() => {
  "use strict";

  /* ---------- Hero Slider ---------- */

  const track = document.getElementById("heroTrack");
  const slider = document.getElementById("heroSlider");
  const prevBtn = document.getElementById("heroPrev");
  const nextBtn = document.getElementById("heroNext");
  const dotsWrap = document.getElementById("heroDots");

  if (!track || !slider) return;

  const originalSlides = Array.from(track.querySelectorAll(".hero-slide"));
  const total = originalSlides.length;
  if (!total) return;

  /* Clone edges so adjacent peeks + wrap feel continuous */
  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[total - 1].cloneNode(true);
  firstClone.classList.remove("is-active");
  lastClone.classList.remove("is-active");
  firstClone.setAttribute("aria-hidden", "true");
  lastClone.setAttribute("aria-hidden", "true");
  firstClone.removeAttribute("data-index");
  lastClone.removeAttribute("data-index");
  track.insertBefore(lastClone, originalSlides[0]);
  track.appendChild(firstClone);

  const slides = Array.from(track.querySelectorAll(".hero-slide"));
  /* Track index: 0 = last clone, 1..total = real slides, total+1 = first clone */
  let current = 1;
  let timer = null;
  let isAnimating = false;
  const INTERVAL = 4000;
  const TRANSITION_MS = 700;

  function realIndex(trackIndex = current) {
    if (trackIndex === 0) return total - 1;
    if (trackIndex === total + 1) return 0;
    return trackIndex - 1;
  }

  function setTrackPosition(trackIndex, instant = false) {
    if (instant) {
      track.classList.add("is-instant");
    }
    track.style.transform = `translateX(calc(var(--hero-track-pad) - ${trackIndex} * var(--hero-slide-step)))`;
    if (instant) {
      /* Force reflow so the next animated move isn't skipped */
      void track.offsetHeight;
      track.classList.remove("is-instant");
    }
  }

  function buildDots() {
    dotsWrap.innerHTML = "";
    originalSlides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "hero-dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
      dot.addEventListener("click", () => goTo(i + 1));
      dotsWrap.appendChild(dot);
    });
  }

  function updateActiveStates() {
    const activeReal = realIndex();
    slides.forEach((slide) => {
      const idx = slide.getAttribute("data-index");
      slide.classList.toggle(
        "is-active",
        idx !== null && Number(idx) === activeReal
      );
    });

    const dots = dotsWrap.querySelectorAll(".hero-dot");
    dots.forEach((dot, i) => {
      const active = i === activeReal;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function settleIfClone() {
    if (current === 0) {
      current = total;
      setTrackPosition(current, true);
    } else if (current === total + 1) {
      current = 1;
      setTrackPosition(current, true);
    }
    updateActiveStates();
    isAnimating = false;
  }

  function goTo(trackIndex) {
    if (isAnimating) return;
    if (trackIndex === current) return;

    isAnimating = true;
    current = trackIndex;
    setTrackPosition(current);
    updateActiveStates();

    window.setTimeout(settleIfClone, TRANSITION_MS);
    restartAutoplay();
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    timer = window.setInterval(next, INTERVAL);
  }

  function stopAutoplay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function restartAutoplay() {
    startAutoplay();
  }

  prevBtn?.addEventListener("click", prev);
  nextBtn?.addEventListener("click", next);

  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  slider.addEventListener("focusin", stopAutoplay);
  slider.addEventListener("focusout", (e) => {
    if (!slider.contains(e.relatedTarget)) startAutoplay();
  });

  /* Touch / swipe support */
  let touchStartX = 0;
  let touchDeltaX = 0;

  slider.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchDeltaX = 0;
      stopAutoplay();
    },
    { passive: true }
  );

  slider.addEventListener(
    "touchmove",
    (e) => {
      touchDeltaX = e.changedTouches[0].screenX - touchStartX;
    },
    { passive: true }
  );

  slider.addEventListener(
    "touchend",
    () => {
      if (Math.abs(touchDeltaX) > 50) {
        if (touchDeltaX < 0) next();
        else prev();
      } else {
        startAutoplay();
      }
    },
    { passive: true }
  );

  /* Keyboard */
  slider.setAttribute("tabindex", "0");
  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  });

  /* Pause when tab is hidden */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  buildDots();
  setTrackPosition(current, true);
  updateActiveStates();
  startAutoplay();

  /* ---------- Feature Tabs ---------- */

  const tabs = document.querySelectorAll(".feature-tab");
  const panels = document.querySelectorAll(".feature-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });

      panels.forEach((panel) => {
        const match = panel.id === `panel-${target}`;
        panel.classList.toggle("is-active", match);
        if (match) {
          panel.removeAttribute("hidden");
        } else {
          panel.setAttribute("hidden", "");
        }
      });
    });

    tab.addEventListener("keydown", (e) => {
      const list = Array.from(tabs);
      const i = list.indexOf(tab);
      let nextTab = null;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        nextTab = list[(i + 1) % list.length];
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        nextTab = list[(i - 1 + list.length) % list.length];
      } else if (e.key === "Home") {
        nextTab = list[0];
      } else if (e.key === "End") {
        nextTab = list[list.length - 1];
      }

      if (nextTab) {
        e.preventDefault();
        nextTab.focus();
        nextTab.click();
      }
    });
  });

  /* ---------- Feature card scroll reveal ---------- */

  const cards = document.querySelectorAll(".feature-card");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card = entry.target;
            const index = Array.from(cards).indexOf(card);
            window.setTimeout(() => {
              card.classList.add("is-visible");
            }, index * 100);
            observer.unobserve(card);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
    );

    cards.forEach((card) => observer.observe(card));
  } else {
    cards.forEach((card) => card.classList.add("is-visible"));
  }

  /* ---------- Search form (demo) ---------- */

  const searchForm = document.querySelector(".search-bar");
  searchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = searchForm.querySelector("input");
    const query = input?.value.trim();
    if (query) {
      input.blur();
      /* Placeholder — wire to real search when backend is ready */
      console.info(`Search: ${query}`);
    }
  });

  /* ---------- Networking directory (demo) ---------- */

  const networkingSearch = document.querySelector(".networking-search");
  networkingSearch?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = networkingSearch.querySelector("input");
    const query = input?.value.trim();
    if (query) {
      input.blur();
      console.info(`Networking search: ${query}`);
    }
  });

  const officialToggle = document.getElementById("officialFilterToggle");
  const officialExtraFilters = document.getElementById("officialExtraFilters");
  const officialAgeRange = document.getElementById("officialAgeRange");
  const officialAgeValue = document.getElementById("officialAgeValue");
  const officialJobCategory = document.getElementById("officialJobCategory");
  const officialJob = document.getElementById("officialJob");

  function setOfficialFiltersVisible(visible) {
    if (!officialExtraFilters) return;
    officialExtraFilters.hidden = !visible;
  }

  function updateOfficialAgeLabel() {
    if (!officialAgeRange || !officialAgeValue) return;
    officialAgeValue.textContent = `${officialAgeRange.value} years`;
  }

  function filterOfficialJobs() {
    if (!officialJob) return;
    const category = officialJobCategory?.value || "";
    let hasVisible = false;

    officialJob.querySelectorAll("option[data-category]").forEach((option) => {
      const match = !category || option.dataset.category === category;
      option.hidden = !match;
      if (match) hasVisible = true;
    });

    const selected = officialJob.selectedOptions[0];
    if (selected?.dataset.category && category && selected.dataset.category !== category) {
      officialJob.value = "";
    }

    officialJob.disabled = Boolean(category) && !hasVisible;
  }

  officialToggle?.addEventListener("change", () => {
    setOfficialFiltersVisible(officialToggle.checked);
  });

  officialAgeRange?.addEventListener("input", updateOfficialAgeLabel);
  officialJobCategory?.addEventListener("change", filterOfficialJobs);

  setOfficialFiltersVisible(Boolean(officialToggle?.checked));
  updateOfficialAgeLabel();
  filterOfficialJobs();

  const pagination = document.querySelector(".networking-pagination");
  pagination?.addEventListener("click", (e) => {
    const btn = e.target.closest(".page-btn");
    if (!btn || btn.classList.contains("page-next")) return;
    pagination.querySelectorAll(".page-btn").forEach((b) => {
      b.classList.remove("is-active");
      b.removeAttribute("aria-current");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-current", "page");
  });
})();
