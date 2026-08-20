/* =========================================================
   IBNCC — Interactions & animations
   ========================================================= */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header = document.getElementById("site-header");
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const backToTop = document.getElementById("back-to-top");
  const navLinks = document.querySelectorAll(".nav-desktop .nav-link, .nav-mobile .nav-link");
  const sections = document.querySelectorAll("main section[id]");

  /* ---------- Sticky header opacity ---------- */
  const onScrollHeader = () => {
    if (!header) return;
    const scrolled = window.scrollY > 24;
    header.classList.toggle("is-scrolled", scrolled);
    if (backToTop) {
      backToTop.classList.toggle("is-visible", window.scrollY > 500);
    }
  };

  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Mobile menu ---------- */
  const closeMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    mobileMenu.hidden = true;
    if (header) header.classList.remove("is-menu-open");
  };

  const openMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    mobileMenu.hidden = false;
    if (header) header.classList.add("is-menu-open");
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      if (expanded) closeMenu();
      else openMenu();
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    window.addEventListener(
      "resize",
      () => {
        if (window.innerWidth >= 1024) closeMenu();
      },
      { passive: true }
    );
  }

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      history.pushState(null, "", id);
    });
  });

  /* ---------- Active nav indicator ---------- */
  const setActiveNav = () => {
    let current = "home";
    const offset = window.scrollY + 120;

    sections.forEach((section) => {
      if (section.offsetTop <= offset) {
        current = section.id;
      }
    });

    // Map content sections to nav items
    const map = {
      home: "home",
      about: "about",
      objectives: "about",
      activities: "about",
      trading: "trading",
      events: "events",
      benefits: "events",
      networking: "networking",
      knowledge: "networking",
      growth: "networking",
      highlights: "events",
      cta: "home",
    };

    const activeKey = map[current] || current;

    document.querySelectorAll(".nav-desktop .nav-link, .nav-mobile .nav-link").forEach((link) => {
      const section = link.getAttribute("data-section");
      link.classList.toggle("active", section === activeKey);
    });
  };

  window.addEventListener("scroll", setActiveNav, { passive: true });
  setActiveNav();

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const stagger = el.getAttribute("data-stagger");
          if (stagger !== null) {
            el.style.setProperty("--stagger", stagger);
          }
          el.classList.add("is-visible");
          observer.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Growth path animation ---------- */
  const growthPath = document.getElementById("growth-path");
  if (growthPath) {
    if (reduceMotion) {
      growthPath.classList.add("is-visible");
    } else if ("IntersectionObserver" in window) {
      const growthObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            growthPath.classList.add("is-visible");
            observer.unobserve(growthPath);
          });
        },
        { threshold: 0.35 }
      );
      growthObserver.observe(growthPath);
    } else {
      growthPath.classList.add("is-visible");
    }
  }

  /* ---------- Back to top ---------- */
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Network particle canvases ---------- */
  function createNetworkCanvas(canvas, options = {}) {
    if (!canvas || reduceMotion) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const {
      nodeCount = 28,
      maxDist = 120,
      color = "rgba(26, 79, 156, 0.55)",
      lineColor = "rgba(26, 79, 156, 0.18)",
      speed = 0.25,
      /** Particle radius range: [minR, maxR] */
      radius = [0.8, 2.4],
    } = options;

    let nodes = [];
    let raf = 0;
    let running = true;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initNodes(rect.width, rect.height);
    };

    const initNodes = (w, h) => {
      const [minR, maxR] = radius;
      const span = Math.max(0, maxR - minR);
      nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: Math.random() * span + minR,
      }));
    };

    const draw = () => {
      if (!running) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDist) {
            ctx.beginPath();
            ctx.strokeStyle = lineColor;
            ctx.globalAlpha = 1 - dist / maxDist;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const onResize = () => resize();
    window.addEventListener("resize", onResize, { passive: true });

    // Pause when off-screen for performance
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          running = entry.isIntersecting;
          if (running) {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(draw);
          }
        });
      });
      io.observe(canvas);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }

  createNetworkCanvas(document.getElementById("network-canvas"), {
    nodeCount: 32,
    maxDist: 110,
    color: "rgba(30, 70, 140, 0.45)",
    lineColor: "rgba(30, 70, 140, 0.16)",
    speed: 0.22,
  });

  createNetworkCanvas(document.getElementById("cta-canvas"), {
    nodeCount: 36,
    maxDist: 130,
    color: "rgba(201, 162, 39, 0.55)",
    lineColor: "rgba(180, 200, 255, 0.14)",
    speed: 0.28,
    radius: [1.35, 3.2],
  });

})();
