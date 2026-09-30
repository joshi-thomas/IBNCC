/**
 * Previous Events — image slider modal.
 * Slide images, title and details are read from each .previous-card in index.html.
 */

(() => {
  "use strict";

  const gallery = document.querySelector(".previous-gallery");
  const dialog = document.getElementById("eventSlider");
  if (!gallery || !dialog || typeof dialog.showModal !== "function") return;

  const titleEl = dialog.querySelector(".event-slider-title");
  const detailsEl = dialog.querySelector(".event-slider-details");
  const track = dialog.querySelector(".event-slider-track");
  const counter = dialog.querySelector(".event-slider-counter");
  const prevBtn = dialog.querySelector("[data-slider-prev]");
  const nextBtn = dialog.querySelector("[data-slider-next]");
  const expandBtn = dialog.querySelector("[data-slider-expand]");
  const closeBtn = dialog.querySelector("[data-slider-close]");

  const SWIPE_THRESHOLD = 40;

  let index = 0;
  let total = 0;
  let lastTrigger = null;
  let touchStartX = null;

  function goTo(nextIndex) {
    if (!total) return;
    index = (nextIndex + total) % total;
    track.style.transform = `translateX(${-index * 100}%)`;
    [...track.children].forEach((slide, i) => {
      slide.setAttribute("aria-hidden", String(i !== index));
    });
    counter.textContent = `${index + 1} / ${total}`;
  }

  function setExpanded(expanded) {
    dialog.classList.toggle("is-expanded", expanded);
    expandBtn.setAttribute("aria-pressed", String(expanded));
    expandBtn.setAttribute("aria-label", expanded ? "Reduce slider size" : "Expand slider");
    const icon = expandBtn.querySelector("i");
    if (icon) {
      icon.className = expanded
        ? "fa-solid fa-down-left-and-up-right-to-center"
        : "fa-solid fa-up-right-and-down-left-from-center";
    }
  }

  function openForCard(card) {
    const template = card.querySelector("template.previous-card-slides");
    const slides = template
      ? [...template.content.querySelectorAll("img")]
      : [...card.querySelectorAll(".previous-card-media img")];
    if (!slides.length) return;

    titleEl.textContent = card.querySelector(".previous-card-body h3")?.textContent.trim() || "";
    detailsEl.replaceChildren(
      ...[...card.querySelectorAll(".previous-card-details p")].map((p) => p.cloneNode(true))
    );

    track.replaceChildren(
      ...slides.map((img) => {
        const slide = img.cloneNode(true);
        slide.classList.add("event-slider-slide");
        slide.removeAttribute("loading");
        slide.draggable = false;
        return slide;
      })
    );

    total = slides.length;
    dialog.classList.toggle("is-single", total < 2);
    lastTrigger = card;
    setExpanded(false);
    goTo(0);

    dialog.showModal();
    document.documentElement.classList.add("event-slider-open");
  }

  gallery.addEventListener("click", (e) => {
    const card = e.target.closest(".previous-card");
    if (!card) return;
    if (e.target.closest(".previous-card-btn")) e.preventDefault();
    openForCard(card);
  });

  gallery.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".previous-card");
    if (!card || e.target !== card) return;
    e.preventDefault();
    openForCard(card);
  });

  prevBtn.addEventListener("click", () => goTo(index - 1));
  nextBtn.addEventListener("click", () => goTo(index + 1));
  expandBtn.addEventListener("click", () => setExpanded(!dialog.classList.contains("is-expanded")));
  closeBtn.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index + 1);
    }
  });

  track.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
    },
    { passive: true }
  );

  track.addEventListener("touchend", (e) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    goTo(deltaX < 0 ? index + 1 : index - 1);
  });

  dialog.addEventListener("close", () => {
    document.documentElement.classList.remove("event-slider-open");
    track.replaceChildren();
    total = 0;
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  });
})();
