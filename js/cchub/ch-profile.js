/**
 * CC Hub — Profile page interactions
 */

(() => {
  "use strict";

  const searchForm = document.querySelector(".profile-header .search-bar");
  searchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = searchForm.querySelector("input");
    const query = input?.value.trim();
    if (query) {
      input.blur();
      console.info(`Profile search: ${query}`);
    }
  });

  /* Keep edit/privacy buttons from toggling the accordion */
  document.querySelectorAll(".profile-detail-item summary").forEach((summary) => {
    summary.addEventListener("click", (e) => {
      if (e.target.closest("[data-action]")) {
        e.preventDefault();
      }
    });
  });

  function escapeAttr(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function fieldTypeFor(label) {
    const key = label.toLowerCase();
    if (key.includes("email")) return "email";
    if (key.includes("mobile") || key.includes("phone") || key.includes("whatsapp")) return "tel";
    return "text";
  }

  const DETAIL_FIELD_OPTIONS = {
    "Church Details": {
      Rite: ["Latin", "Syro-Malabar", "Syro-Malankara"],
      Diocese: ["Kozhikode", "Kannur", "Thrissur", "Ernakulam-Angamaly", "Palakkad", "Thamarassery"],
      Forane: ["Kozhikode Forane", "Thamarassery Forane", "Kalpetta Forane", "Perambra Forane"],
      Parish: ["St. Mary's Cathedral", "St. Joseph's Church", "Holy Family Church", "Little Flower Church"],
    },
    "Personal Details": {
      Gender: ["Male", "Female", "Other", "Prefer not to say"],
      "Blood Group": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    "Permanent Address": {
      District: ["Kozhikode", "Kannur", "Wayanad", "Malappuram", "Thrissur", "Ernakulam"],
      State: ["Kerala", "Tamil Nadu", "Karnataka", "Goa", "Maharashtra"],
    },
    "Present Address": {
      District: ["Kozhikode", "Kannur", "Wayanad", "Malappuram", "Thrissur", "Ernakulam"],
      State: ["Kerala", "Tamil Nadu", "Karnataka", "Goa", "Maharashtra"],
    },
    "Employment Status": {
      Status: ["Employed", "Self-Employed", "Business", "Student", "Freelancer", "Seeking Opportunities"],
      "Work Mode": ["On-site", "Remote", "Hybrid", "Field Work", "Flexible"],
      Experience: ["0-2 years", "3-5 years", "6-10 years", "11-15 years", "16+ years"],
    },
    "Job Details": {
      Category: [
        "Hospitality & Personal Services",
        "Healthcare & Medical",
        "Engineering & Technical",
        "Education & Research",
        "Business & Finance",
        "Information Technology (IT)",
        "Construction & Skilled Trades",
        "Agriculture & Food",
        "Business, Sales & Marketing",
        "Government, Legal & Public Service",
        "Arts, Media & Design",
        "Transportation & Logistics",
      ],
    },
  };

  const JOB_CATEGORY_MAP = {
    "Hospitality & Personal Services": [
      "Hotel Manager",
      "Receptionist",
      "Beautician",
      "Hair Stylist",
      "Tour Guide",
      "Housekeeper",
      "Event Manager",
      "Chef",
    ],
    "Healthcare & Medical": [
      "Doctor",
      "Nurse",
      "Dentist",
      "Pharmacist",
      "Surgeon",
      "Physiotherapist",
      "Lab Technician",
      "Psychologist",
    ],
    "Engineering & Technical": [
      "Civil Engineer",
      "Mechanical Engineer",
      "Electrical Engineer",
      "Software Engineer",
      "Architect",
      "Surveyor",
      "Technician",
    ],
    "Education & Research": [
      "Teacher",
      "Professor",
      "Lecturer",
      "Tutor",
      "Researcher",
      "Librarian",
    ],
    "Business & Finance": [
      "Accountant",
      "Banker",
      "Financial Analyst",
      "Auditor",
      "Insurance Agent",
      "Investment Advisor",
    ],
    "Information Technology (IT)": [
      "Web Developer",
      "App Developer",
      "UI/UX Designer",
      "Data Scientist",
      "Cybersecurity Expert",
      "Network Engineer",
    ],
    "Construction & Skilled Trades": [
      "Electrician",
      "Plumber",
      "Carpenter",
      "Mason",
      "Welder",
      "Painter",
      "HVAC Technician",
    ],
    "Agriculture & Food": [
      "Farmer",
      "Gardener",
      "Dairy Farmer",
      "Fisherman",
      "Food Technologist",
      "Chef",
      "Baker",
    ],
    "Business, Sales & Marketing": [
      "Sales Executive",
      "Marketing Manager",
      "Business Development Officer",
      "Retail Manager",
      "Customer Support",
    ],
    "Government, Legal & Public Service": [
      "Police Officer",
      "Lawyer",
      "Judge",
      "Army Officer",
      "Firefighter",
      "Government Officer",
      "Social Worker",
    ],
    "Arts, Media & Design": [
      "Graphic Designer",
      "Photographer",
      "Musician",
      "Actor",
      "Writer",
      "Video Editor",
      "Animator",
      "Fashion Designer",
    ],
    "Transportation & Logistics": [
      "Driver",
      "Pilot",
      "Train Operator",
      "Delivery Executive",
      "Logistics Manager",
      "Warehouse Supervisor",
    ],
  };

  function optionListFor(sectionLabel, fieldLabel) {
    if (sectionLabel === "Job Details" && fieldLabel === "Job") {
      return [];
    }
    return DETAIL_FIELD_OPTIONS[sectionLabel]?.[fieldLabel] || [];
  }

  function buildOptionPicker(sectionLabel, fieldLabel, fieldId, value) {
    const options = optionListFor(sectionLabel, fieldLabel);
    if (!options.length) return "";

    const optionRole = sectionLabel === "Job Details" && fieldLabel === "Category" ? "category" : "field";

    return `
      <div class="detail-option-picker" hidden>
        <select class="detail-option-select" data-option-target="${fieldId}" data-option-role="${optionRole}" size="${Math.min(options.length, 5)}" aria-label="${escapeAttr(fieldLabel)} options">
          ${options
            .map(
              (option) =>
                `<option value="${escapeAttr(option)}"${option === value ? " selected" : ""}>${escapeAttr(option)}</option>`
            )
            .join("")}
        </select>
      </div>`;
  }

  function renderSelectOptions(select, options, value) {
    if (!select) return;
    select.size = Math.min(Math.max(options.length, 1), 5);
    select.innerHTML = options
      .map(
        (option) =>
          `<option value="${escapeAttr(option)}"${option === value ? " selected" : ""}>${escapeAttr(option)}</option>`
      )
      .join("");
  }

  function closeAllOptionDropdowns(scope = document) {
    scope.querySelectorAll(".detail-edit-field.has-options.is-open").forEach((field) => {
      field.classList.remove("is-open");
      field.querySelector(".detail-option-picker")?.setAttribute("hidden", "");
      field.querySelector(".detail-option-toggle")?.setAttribute("aria-expanded", "false");
    });
  }

  function setOptionDropdownOpen(field, shouldOpen) {
    if (!field) return;
    const picker = field.querySelector(".detail-option-picker");
    const toggle = field.querySelector(".detail-option-toggle");
    if (!picker || !toggle) return;

    if (shouldOpen) {
      closeAllOptionDropdowns(field.closest(".detail-edit-form") || document);
      field.classList.add("is-open");
      picker.removeAttribute("hidden");
      toggle.setAttribute("aria-expanded", "true");
    } else {
      field.classList.remove("is-open");
      picker.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
    }
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".detail-edit-field.has-options")) {
      closeAllOptionDropdowns();
    }
  });

  function updateJobOptions(form, selectedCategory, currentJob) {
    const jobSelect = form.querySelector('[data-option-role="job"]');
    const jobInput = form.querySelector('[name="detail-1"]');
    const jobs = JOB_CATEGORY_MAP[selectedCategory] || [];

    if (!jobSelect || !jobInput) return;

    renderSelectOptions(jobSelect, jobs, currentJob);
    if (!jobs.length) return;

    if (!jobs.includes(jobInput.value.trim())) {
      jobInput.value = currentJob && jobs.includes(currentJob) ? currentJob : jobs[0];
    }

    renderSelectOptions(jobSelect, jobs, jobInput.value.trim());
  }

  function closeDetailEditor(item) {
    if (!item) return;
    item.classList.remove("is-editing");
    item.querySelector(".detail-grid")?.removeAttribute("hidden");
    const form = item.querySelector(".detail-edit-form");
    if (form) {
      form.hidden = true;
      closeAllOptionDropdowns(form);
    }
    item.querySelector('[data-action="edit"]')?.setAttribute("aria-pressed", "false");
  }

  function syncDetailFormFromGrid(item, form) {
    const grid = item.querySelector(".detail-grid");
    if (!grid || !form) return;
    const rows = [...grid.querySelectorAll(":scope > div")];
    rows.forEach((row, index) => {
      const value = row.querySelector("dd")?.textContent.trim() || "";
      const input = form.querySelector(`[name="detail-${index}"]`);
      if (input) input.value = value;
      const select = form.querySelector(`.detail-option-select[data-option-target="detail-${index}"]`);
      if (select) {
        [...select.options].forEach((option) => {
          option.selected = option.value === value;
        });
      }
    });

    const sectionLabel = item.querySelector(".detail-label")?.textContent.trim() || "";
    if (sectionLabel === "Job Details") {
      const categoryInput = form.querySelector('[name="detail-0"]');
      const jobInput = form.querySelector('[name="detail-1"]');
      updateJobOptions(form, categoryInput?.value.trim() || "", jobInput?.value.trim() || "");
    }
  }

  function bindDetailEditForm(form, item) {
    if (!form || form.dataset.bound === "1") return;
    form.dataset.bound = "1";

    const grid = item.querySelector(".detail-grid");
    const rows = [...(grid?.querySelectorAll(":scope > div") || [])];
    const sectionLabel = item.querySelector(".detail-label")?.textContent.trim() || "";

    form.querySelectorAll(".detail-input-wrap input").forEach((input) => {
      input.addEventListener("click", () => {
        const field = input.closest(".detail-edit-field.has-options");
        if (!field) return;
        setOptionDropdownOpen(field, !field.classList.contains("is-open"));
      });
    });

    form.querySelectorAll(".detail-option-toggle").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const field = toggle.closest(".detail-edit-field.has-options");
        if (!field) return;
        setOptionDropdownOpen(field, !field.classList.contains("is-open"));
        field.querySelector("input")?.focus();
      });
    });

    form.querySelectorAll(".detail-option-select").forEach((select) => {
      select.addEventListener("change", () => {
        const input = form.querySelector(`[name="${select.dataset.optionTarget}"]`);
        if (!input) return;
        input.value = select.value;
        if (select.dataset.optionRole === "category") {
          updateJobOptions(form, select.value, "");
        }
        setOptionDropdownOpen(select.closest(".detail-edit-field.has-options"), false);
        input.focus();
      });
    });

    form.addEventListener("click", (e) => {
      if (!e.target.closest(".detail-edit-field.has-options")) {
        closeAllOptionDropdowns(form);
      }
    });

    if (sectionLabel === "Job Details") {
      form.querySelector('[name="detail-0"]')?.addEventListener("input", (e) => {
        updateJobOptions(form, e.target.value.trim(), form.querySelector('[name="detail-1"]')?.value.trim() || "");
      });
    }

    form.querySelector("[data-edit-cancel], .sidebar-btn-secondary")?.addEventListener("click", () => {
      closeDetailEditor(item);
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      rows.forEach((row, index) => {
        const dd = row.querySelector("dd");
        if (dd) dd.textContent = data.get(`detail-${index}`)?.toString().trim() || "";
      });
      closeDetailEditor(item);
    });
  }

  function openDetailEditor(item) {
    if (!item || item.classList.contains("is-editing")) return;

    document.querySelectorAll(".profile-detail-item.is-editing").forEach(closeDetailEditor);

    const grid = item.querySelector(".detail-grid");
    const content = item.querySelector(".detail-content");
    const existingForm = item.querySelector(".detail-edit-form");
    if (!grid || !content) return;

    item.open = true;
    item.classList.add("is-editing");
    item.querySelector('[data-action="edit"]')?.setAttribute("aria-pressed", "true");
    grid.hidden = true;

    // Prefer static markup from ch-profile.html when present
    if (existingForm) {
      syncDetailFormFromGrid(item, existingForm);
      bindDetailEditForm(existingForm, item);
      existingForm.hidden = false;
      existingForm.querySelector("input")?.focus();
      return;
    }

    // Fallback for pages without pre-baked edit forms
    const rows = [...(grid.querySelectorAll(":scope > div") || [])];
    const sectionLabel = item.querySelector(".detail-label")?.textContent.trim() || "";
    if (!rows.length) return;

    const form = document.createElement("form");
    form.className = "detail-edit-form";
    form.innerHTML = `
      <div class="detail-edit-grid">
        ${rows
          .map((row, index) => {
            const label = row.querySelector("dt")?.textContent.trim() || `Field ${index + 1}`;
            const value = row.querySelector("dd")?.textContent.trim() || "";
            const type = fieldTypeFor(label);
            const fieldId = `detail-${index}`;
            const hasOptions = optionListFor(sectionLabel, label).length > 0 || (sectionLabel === "Job Details" && label === "Job");
            return `
              <label class="detail-edit-field${hasOptions ? " has-options" : ""}">
                <span>${escapeAttr(label)}</span>
                <span class="detail-input-wrap">
                  <input type="${type}" name="${fieldId}" value="${escapeAttr(value)}" />
                  ${
                    hasOptions
                      ? `<button type="button" class="detail-option-toggle" data-option-target="${fieldId}" aria-label="Show ${escapeAttr(label)} options" aria-expanded="false">
                  <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                </button>`
                      : ""
                  }
                </span>
                ${buildOptionPicker(sectionLabel, label, fieldId, value)}
              </label>`;
          })
          .join("")}
      </div>
      <div class="detail-edit-actions">
        <button type="button" class="sidebar-btn-secondary" data-edit-cancel>Cancel</button>
        <button type="submit" class="sidebar-btn-primary">Save</button>
      </div>
    `;

    if (sectionLabel === "Job Details") {
      const jobField = form.querySelector('[name="detail-1"]')?.closest("label");
      const jobInput = form.querySelector('[name="detail-1"]');
      const categoryInput = form.querySelector('[name="detail-0"]');
      if (jobField && jobInput) {
        jobField.insertAdjacentHTML(
          "beforeend",
          `
            <div class="detail-option-picker" hidden>
              <select class="detail-option-select" data-option-target="detail-1" data-option-role="job" size="5" aria-label="Job options"></select>
            </div>
          `
        );
      }
      updateJobOptions(form, categoryInput?.value.trim() || "", jobInput?.value.trim() || "");
    }

    content.appendChild(form);
    bindDetailEditForm(form, item);
    form.querySelector("input")?.focus();
  }

  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const item = btn.closest(".profile-detail-item");
      const action = btn.getAttribute("data-action");

      if (action === "edit") {
        if (item?.classList.contains("is-editing")) closeDetailEditor(item);
        else openDetailEditor(item);
        return;
      }

      if (action === "privacy") {
        if (!item) return;
        setDetailPrivacy(item, !item.classList.contains("is-private"));
        return;
      }

      const label = item?.querySelector(".detail-label")?.textContent?.trim();
      console.info(`${action}: ${label}`);
    });
  });

  function setDetailPrivacy(item, isPrivate) {
    if (!item) return;
    const btn = item.querySelector('[data-action="privacy"]');
    const label = item.querySelector(".detail-label")?.textContent?.trim() || "this section";
    const icon = btn?.querySelector("i");

    item.classList.toggle("is-private", isPrivate);
    btn?.classList.add("detail-action--privacy");
    btn?.setAttribute("aria-pressed", isPrivate ? "true" : "false");

    if (isPrivate) {
      btn?.setAttribute("aria-label", `Show ${label} to other viewers`);
      btn?.setAttribute("title", "Hidden from other viewers - click to make visible");
      if (icon) {
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      }
    } else {
      btn?.setAttribute("aria-label", `Hide ${label} from other viewers`);
      btn?.setAttribute("title", "Visible to other viewers - click to hide");
      if (icon) {
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    }
  }

  /* Initialize privacy controls: sections start visible to others */
  document.querySelectorAll(".profile-accordion .profile-detail-item").forEach((item) => {
    setDetailPrivacy(item, item.classList.contains("is-private"));
  });

  /* ---------- Profile / cover image edit ---------- */

  function bindImagePicker({ button, input, image, label }) {
    if (!button || !input || !image) return;

    button.addEventListener("click", () => input.click());

    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;

      const objectUrl = URL.createObjectURL(file);
      const previousUrl = image.dataset.objectUrl;

      image.src = objectUrl;
      image.dataset.objectUrl = objectUrl;
      if (label) image.alt = label;

      if (previousUrl) URL.revokeObjectURL(previousUrl);
      input.value = "";
    });
  }

  bindImagePicker({
    button: document.getElementById("editCoverImageBtn"),
    input: document.getElementById("coverImageInput"),
    image: document.getElementById("profileCoverImage"),
    label: "Updated cover photo",
  });

  bindImagePicker({
    button: document.getElementById("editProfilePhotoBtn"),
    input: document.getElementById("profilePhotoInput"),
    image: document.getElementById("profilePhotoImage"),
    label: "Updated profile photo",
  });

  document.querySelector(".gallery-add-btn")?.addEventListener("click", () => {
    console.info("Add Image (demo)");
  });

  document.querySelector(".gallery-view-more")?.addEventListener("click", () => {
    console.info("View More gallery (demo)");
  });

  /* ---------- Gallery lightbox slider ---------- */

  const galleryGrid = document.querySelector(".gallery-grid");
  const galleryLightbox = document.getElementById("galleryLightbox");
  const galleryLightboxImage = document.getElementById("galleryLightboxImage");
  const galleryLightboxCaption = document.getElementById("galleryLightboxCaption");
  const galleryLightboxIndex = document.getElementById("galleryLightboxIndex");
  const galleryLightboxTotal = document.getElementById("galleryLightboxTotal");
  const galleryPrevBtn = document.getElementById("galleryLightboxPrev");
  const galleryNextBtn = document.getElementById("galleryLightboxNext");

  let galleryImages = [];
  let galleryIndex = 0;
  let galleryAnimating = false;

  function collectGalleryImages() {
    galleryImages = Array.from(galleryGrid?.querySelectorAll(".gallery-item img") || []).map((img) => ({
      src: img.currentSrc || img.src,
      alt: img.alt || "Gallery image",
    }));
    if (galleryLightboxTotal) {
      galleryLightboxTotal.textContent = String(galleryImages.length || 0);
    }
  }

  function setGalleryOpen(open) {
    if (!galleryLightbox) return;
    galleryLightbox.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  }

  function showGalleryImage(nextIndex, direction = "none") {
    if (!galleryLightboxImage || !galleryImages.length || galleryAnimating) return;

    const total = galleryImages.length;
    galleryIndex = ((nextIndex % total) + total) % total;
    const item = galleryImages[galleryIndex];

    const applyContent = () => {
      galleryLightboxImage.src = item.src;
      galleryLightboxImage.alt = item.alt;
      if (galleryLightboxCaption) galleryLightboxCaption.textContent = item.alt;
      if (galleryLightboxIndex) galleryLightboxIndex.textContent = String(galleryIndex + 1);
    };

    if (direction === "none") {
      applyContent();
      galleryLightboxImage.classList.remove("is-from-prev", "is-from-next");
      galleryLightboxImage.classList.add("is-active");
      return;
    }

    galleryAnimating = true;
    galleryLightboxImage.classList.remove("is-active", "is-from-prev", "is-from-next");
    galleryLightboxImage.classList.add(direction === "next" ? "is-from-next" : "is-from-prev");

    window.requestAnimationFrame(() => {
      applyContent();
      window.requestAnimationFrame(() => {
        galleryLightboxImage.classList.remove("is-from-prev", "is-from-next");
        galleryLightboxImage.classList.add("is-active");
        window.setTimeout(() => {
          galleryAnimating = false;
        }, 320);
      });
    });
  }

  function openGalleryAt(index) {
    collectGalleryImages();
    if (!galleryImages.length) return;
    showGalleryImage(index, "none");
    setGalleryOpen(true);
  }

  function closeGalleryLightbox() {
    setGalleryOpen(false);
  }

  galleryGrid?.querySelectorAll(".gallery-item").forEach((item, index) => {
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", `View gallery image ${index + 1}`);

    item.addEventListener("click", () => openGalleryAt(index));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openGalleryAt(index);
      }
    });
  });

  galleryPrevBtn?.addEventListener("click", () => showGalleryImage(galleryIndex - 1, "prev"));
  galleryNextBtn?.addEventListener("click", () => showGalleryImage(galleryIndex + 1, "next"));

  galleryLightbox?.querySelectorAll("[data-gallery-close]").forEach((el) => {
    el.addEventListener("click", closeGalleryLightbox);
  });

  document.addEventListener("keydown", (e) => {
    if (!galleryLightbox || galleryLightbox.hidden) return;
    if (e.key === "Escape") {
      closeGalleryLightbox();
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      showGalleryImage(galleryIndex - 1, "prev");
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      showGalleryImage(galleryIndex + 1, "next");
    }
  });

  /* ---------- Profile Brief ---------- */

  const briefView = document.getElementById("profileBriefView");
  const briefForm = document.getElementById("profileBriefForm");
  const briefEditBtn = document.getElementById("briefEditBtn");
  const briefCancelBtn = document.getElementById("briefCancelBtn");

  function setBriefEditing(editing) {
    if (!briefView || !briefForm || !briefEditBtn) return;
    briefView.hidden = editing;
    briefForm.hidden = !editing;
    briefEditBtn.setAttribute("aria-pressed", editing ? "true" : "false");
    briefEditBtn.setAttribute("aria-expanded", editing ? "true" : "false");
  }

  /* Keep the edit form hidden until the pen button is clicked */
  setBriefEditing(false);

  briefEditBtn?.addEventListener("click", () => {
    setBriefEditing(briefForm.hidden);
  });

  briefCancelBtn?.addEventListener("click", () => {
    setBriefEditing(false);
  });

  briefForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(briefForm);
    const name = data.get("name")?.toString().trim() || "George Mathew";
    const role = data.get("role")?.toString().trim() || "Civil Engineer";
    const bio = data.get("bio")?.toString().trim() || "";
    const status = data.get("status")?.toString() || "available";
    const location = data.get("location")?.toString().trim() || "Kozhikode, Kerala";
    const district = data.get("district")?.toString().trim() || "Kozhikode District";
    const phone = data.get("phone")?.toString().trim() || "";
    const email = data.get("email")?.toString().trim() || "";

    const card = briefView.querySelector(".profile-card--sidebar");
    card.querySelector(".profile-name").childNodes[0].textContent = `${name} `;
    card.querySelector(".profile-role").textContent = role;
    card.querySelector(".profile-bio").textContent = bio;

    const statusEl = card.querySelector(".profile-status");
    statusEl.classList.toggle("is-available", status === "available");
    statusEl.classList.toggle("is-busy", status === "busy");
    statusEl.innerHTML = `<span class="status-dot" aria-hidden="true"></span> ${status === "available" ? "Available" : "Busy"}`;

    card.querySelector(".profile-location strong").textContent = location;
    card.querySelector(".profile-location span").textContent = district;

    const phoneLink = card.querySelector('.profile-contact a[href^="tel:"]');
    const emailLink = card.querySelector('.profile-contact a[href^="mailto:"]');
    if (phoneLink) {
      phoneLink.href = `tel:${phone.replace(/\s/g, "")}`;
      phoneLink.innerHTML = `<i class="fa-solid fa-phone" aria-hidden="true"></i> ${phone}`;
    }
    if (emailLink) {
      emailLink.href = `mailto:${email}`;
      emailLink.innerHTML = `<i class="fa-solid fa-envelope" aria-hidden="true"></i> ${email}`;
    }

    setBriefEditing(false);
  });

  /* ---------- Work Details (inline edit) ---------- */

  const workView = document.getElementById("workDetailsView");
  const workSummaryText = document.getElementById("workSummaryText");
  const workSummaryMetaText = document.getElementById("workSummaryMetaText");
  const workSummaryActions = document.getElementById("workSummaryActions");
  const workEditBtn = document.getElementById("workEditBtn");
  const workCancelBtn = document.getElementById("workCancelBtn");
  const workSaveBtn = document.getElementById("workSaveBtn");
  const WORK_MIN_WORDS = 20;
  const WORK_MAX_WORDS = 75;

  let workDraft = { meta: "", text: "" };
  let workEditing = false;

  function countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  function setWorkEditing(editing) {
    if (!workView || !workEditBtn || !workSummaryText || !workSummaryMetaText) return;

    workEditing = editing;
    workView.classList.toggle("is-editing", editing);
    workEditBtn.setAttribute("aria-pressed", editing ? "true" : "false");

    if (workSummaryActions) {
      workSummaryActions.hidden = !editing;
    }

    workSummaryMetaText.contentEditable = editing ? "true" : "false";
    workSummaryText.contentEditable = editing ? "true" : "false";

    if (editing) {
      workDraft = {
        meta: workSummaryMetaText.textContent.trim(),
        text: workSummaryText.textContent.trim(),
      };
      workSummaryMetaText.focus();
    } else {
      workSummaryMetaText.blur();
      workSummaryText.blur();
    }
  }

  workEditBtn?.addEventListener("click", () => {
    if (workEditing) return;
    setWorkEditing(true);
  });

  workCancelBtn?.addEventListener("click", () => {
    if (workSummaryMetaText) workSummaryMetaText.textContent = workDraft.meta;
    if (workSummaryText) workSummaryText.textContent = workDraft.text;
    setWorkEditing(false);
  });

  workSaveBtn?.addEventListener("click", () => {
    const summary = workSummaryText?.textContent.trim() || "";
    const meta = workSummaryMetaText?.textContent.trim() || "";
    const words = countWords(summary);

    if (!meta) {
      window.alert("Please enter a short work title / role line.");
      workSummaryMetaText?.focus();
      return;
    }

    if (words < WORK_MIN_WORDS || words > WORK_MAX_WORDS) {
      window.alert(`Please enter between ${WORK_MIN_WORDS} and ${WORK_MAX_WORDS} words for the work description.`);
      workSummaryText?.focus();
      return;
    }

    setWorkEditing(false);
  });

  /* ---------- Change Password ---------- */

  const passwordDialog = document.getElementById("changePasswordDialog");
  const changePasswordLink = document.getElementById("changePasswordLink");
  const closePasswordDialog = document.getElementById("closePasswordDialog");
  const cancelPasswordBtn = document.getElementById("cancelPasswordBtn");
  const changePasswordForm = document.getElementById("changePasswordForm");
  const pwNewInput = document.getElementById("pwNew");
  const passwordStrength = document.getElementById("passwordStrength");

  function scorePassword(value) {
    let score = 0;
    if (!value) return 0;
    if (value.length >= 6) score += 1;
    if (value.length >= 10) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    if (score <= 2) return 1;
    if (score <= 4) return 2;
    return 3;
  }

  function updatePasswordStrength() {
    if (!passwordStrength || !pwNewInput) return;
    const level = scorePassword(pwNewInput.value);
    const label = passwordStrength.querySelector(".password-strength-label");
    passwordStrength.classList.remove("is-weak", "is-medium", "is-strong");
    if (!pwNewInput.value) {
      if (label) label.textContent = "Weak";
      return;
    }
    if (level === 1) {
      passwordStrength.classList.add("is-weak");
      if (label) label.textContent = "Weak";
    } else if (level === 2) {
      passwordStrength.classList.add("is-medium");
      if (label) label.textContent = "Medium";
    } else {
      passwordStrength.classList.add("is-strong");
      if (label) label.textContent = "Strong";
    }
  }

  function resetPasswordVisibility() {
    changePasswordForm?.querySelectorAll(".password-toggle").forEach((btn) => {
      const inputId = btn.getAttribute("data-toggle-password");
      const input = inputId ? document.getElementById(inputId) : null;
      if (!input) return;
      input.type = "password";
      btn.setAttribute("aria-label", btn.getAttribute("aria-label")?.replace(/^Hide/, "Show") || "Show password");
      const icon = btn.querySelector("i");
      if (icon) {
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  }

  function openPasswordDialog() {
    passwordDialog?.showModal();
    updatePasswordStrength();
  }

  function closePasswordDialogFn() {
    passwordDialog?.close();
    changePasswordForm?.reset();
    resetPasswordVisibility();
    updatePasswordStrength();
  }

  changePasswordLink?.addEventListener("click", (e) => {
    e.preventDefault();
    openPasswordDialog();
  });

  closePasswordDialog?.addEventListener("click", closePasswordDialogFn);
  cancelPasswordBtn?.addEventListener("click", closePasswordDialogFn);

  changePasswordForm?.querySelectorAll(".password-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const inputId = btn.getAttribute("data-toggle-password");
      const input = inputId ? document.getElementById(inputId) : null;
      if (!input) return;
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      const nextLabel = showing ? "Show" : "Hide";
      const currentLabel = btn.getAttribute("aria-label") || "";
      btn.setAttribute(
        "aria-label",
        currentLabel.replace(/^(Show|Hide)/, nextLabel) || `${nextLabel} password`
      );
      const icon = btn.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-eye", showing);
        icon.classList.toggle("fa-eye-slash", !showing);
      }
    });
  });

  pwNewInput?.addEventListener("input", updatePasswordStrength);

  changePasswordForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(changePasswordForm);
    const next = data.get("new")?.toString() || "";
    const confirm = data.get("confirm")?.toString() || "";

    if (next !== confirm) {
      window.alert("New passwords do not match.");
      return;
    }

    console.info("Password updated (demo)");
    closePasswordDialogFn();
  });

  /* ---------- Social Media Links ---------- */

  const socialBody = document.getElementById("socialLinksBody");
  const addSocialBtn = document.getElementById("addSocialBtn");

  function normalizeUrl(url) {
    const trimmed = url.trim();
    if (!trimmed) return "#";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  function displayUrl(url) {
    return url.replace(/^https?:\/\//i, "");
  }

  function createSocialRow(platform = "", url = "") {
    const row = document.createElement("div");
    row.className = "social-link-row";
    row.setAttribute("role", "row");
    row.dataset.socialRow = "";

    row.innerHTML = `
      <span class="social-platform" role="cell" data-field="platform">${platform || "Platform"}</span>
      <a class="social-url" role="cell" href="${normalizeUrl(url)}" target="_blank" rel="noopener noreferrer" data-field="url">${displayUrl(normalizeUrl(url)) || "profile-url.com"}</a>
      <span class="social-link-actions" role="cell">
        <button type="button" class="sidebar-icon-btn social-edit-btn" aria-label="Edit social profile">
          <i class="fa-solid fa-pen" aria-hidden="true"></i>
        </button>
        <button type="button" class="sidebar-icon-btn social-delete-btn" aria-label="Delete social profile">
          <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
        </button>
      </span>
    `;

    bindSocialRow(row);
    return row;
  }

  function bindSocialRow(row) {
    const editBtn = row.querySelector(".social-edit-btn");
    const deleteBtn = row.querySelector(".social-delete-btn");

    deleteBtn?.addEventListener("click", () => {
      row.remove();
    });

    editBtn?.addEventListener("click", () => {
      if (row.classList.contains("is-editing")) return;

      const platform = row.querySelector('[data-field="platform"]').textContent.trim();
      const url = row.querySelector('[data-field="url"]').href;

      row.classList.add("is-editing");

      const fields = document.createElement("div");
      fields.className = "social-link-edit-fields";
      fields.innerHTML = `
        <input type="text" class="social-input-platform" value="${platform === "Platform" ? "" : platform}" placeholder="Platform name" aria-label="Platform name" />
        <input type="url" class="social-input-url" value="${url === "#" ? "" : url}" placeholder="https://profile-url.com" aria-label="Profile URL" />
      `;

      const actions = document.createElement("div");
      actions.className = "social-link-edit-actions";
      actions.innerHTML = `
        <button type="button" class="sidebar-btn-secondary social-cancel-btn">Cancel</button>
        <button type="button" class="sidebar-btn-primary social-save-btn">Save</button>
      `;

      row.appendChild(fields);
      row.appendChild(actions);

      actions.querySelector(".social-cancel-btn")?.addEventListener("click", () => {
        row.classList.remove("is-editing");
        fields.remove();
        actions.remove();
      });

      actions.querySelector(".social-save-btn")?.addEventListener("click", () => {
        const nextPlatform = fields.querySelector(".social-input-platform").value.trim() || "Platform";
        const nextUrl = normalizeUrl(fields.querySelector(".social-input-url").value.trim() || "profile-url.com");

        row.querySelector('[data-field="platform"]').textContent = nextPlatform;
        const link = row.querySelector('[data-field="url"]');
        link.href = nextUrl;
        link.textContent = displayUrl(nextUrl);
        editBtn.setAttribute("aria-label", `Edit ${nextPlatform} profile`);
        deleteBtn?.setAttribute("aria-label", `Delete ${nextPlatform} profile`);

        row.classList.remove("is-editing");
        fields.remove();
        actions.remove();
      });
    });
  }

  socialBody?.querySelectorAll("[data-social-row]").forEach(bindSocialRow);

  addSocialBtn?.addEventListener("click", () => {
    const row = createSocialRow("", "");
    socialBody?.appendChild(row);
    row.querySelector(".social-edit-btn")?.click();
  });

  /* ---------- Messages panel + chat ---------- */
  const openMessagesBtn = document.getElementById("openMessagesBtn");
  const messagesPanel = document.getElementById("messagesPanel");
  const msgListView = document.getElementById("msgListView");
  const msgChatView = document.getElementById("msgChatView");
  const msgChatBack = document.getElementById("msgChatBack");
  const msgChatLog = document.getElementById("msgChatLog");
  const msgChatForm = document.getElementById("msgChatForm");
  const msgChatInput = document.getElementById("msgChatInput");
  const msgChatName = document.getElementById("msgChatName");
  const msgChatStatus = document.getElementById("msgChatStatus");
  const msgChatAvatar = document.getElementById("msgChatAvatar");
  const msgAttachBtn = document.getElementById("msgAttachBtn");
  const msgFileInput = document.getElementById("msgFileInput");
  const msgAttachPreview = document.getElementById("msgAttachPreview");
  const msgSendBtn = document.getElementById("msgSendBtn");

  let pendingFiles = [];
  let activeChatId = null;
  let lastRenderedDayKey = null;

  function getActiveThreadEl() {
    if (!msgChatLog || !activeChatId) return null;
    return msgChatLog.querySelector(`.msg-thread[data-thread-id="${activeChatId}"]`);
  }

  function ensureThreadEl(chatId) {
    if (!msgChatLog || !chatId) return null;
    let el = msgChatLog.querySelector(`.msg-thread[data-thread-id="${chatId}"]`);
    if (!el) {
      el = document.createElement("div");
      el.className = "msg-thread";
      el.dataset.threadId = chatId;
      el.hidden = true;
      msgChatLog.appendChild(el);
    }
    return el;
  }

  function setMessagesOpen(open) {
    if (!messagesPanel || !openMessagesBtn) return;
    messagesPanel.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) {
      showListView();
      clearPendingFiles();
    }
  }

  function showListView() {
    if (msgListView) msgListView.hidden = false;
    if (msgChatView) msgChatView.hidden = true;
    activeChatId = null;
  }

  function clearPendingFiles() {
    pendingFiles = [];
    if (msgFileInput) msgFileInput.value = "";
    renderAttachPreview();
  }

  function renderAttachPreview() {
    if (!msgAttachPreview) return;
    msgAttachPreview.innerHTML = "";
    pendingFiles.forEach((file, index) => {
      const chip = document.createElement("span");
      chip.className = "msg-attach-chip";
      const label = document.createElement("span");
      label.textContent = file.name;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.setAttribute("aria-label", `Remove ${file.name}`);
      remove.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
      remove.addEventListener("click", () => {
        pendingFiles.splice(index, 1);
        renderAttachPreview();
      });
      chip.append(label, remove);
      msgAttachPreview.appendChild(chip);
    });
  }

  function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function dayKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function dateLabel(date) {
    const target = startOfDay(date);
    const today = startOfDay(new Date());
    const diffDays = Math.round((today - target) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: today.getFullYear() !== target.getFullYear() ? "numeric" : undefined,
    }).format(target);
  }

  function timeLabel(date) {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  }

  function tickIcon(status) {
    return status === "sent" ? "fa-check" : "fa-check-double";
  }

  function tickAriaLabel(status) {
    if (status === "read") return "Seen";
    if (status === "delivered") return "Delivered";
    return "Sent";
  }

  function appendDaySeparator(date) {
    const host = getActiveThreadEl() || msgChatLog;
    if (!host) return;
    const sep = document.createElement("div");
    sep.className = "msg-day-sep";
    sep.setAttribute("role", "separator");
    const time = document.createElement("time");
    time.dateTime = dayKey(date);
    time.textContent = dateLabel(date);
    sep.appendChild(time);
    host.appendChild(sep);
  }

  function ensureDaySeparator(date) {
    const key = dayKey(date);
    if (lastRenderedDayKey === key) return;
    appendDaySeparator(date);
    lastRenderedDayKey = key;
  }

  function setTickStatus(ticks, status) {
    if (!ticks) return;
    ticks.className = `msg-ticks is-${status}`;
    ticks.dataset.status = status;
    ticks.title = tickAriaLabel(status);
    ticks.setAttribute("aria-label", tickAriaLabel(status));
    const icon = ticks.querySelector("i");
    if (icon) {
      icon.className = `fa-solid ${tickIcon(status)}`;
    }
  }

  function appendBubble(text, outgoing, options = {}) {
    const host = getActiveThreadEl() || msgChatLog;
    if (!host) return null;
    const when = options.at ? new Date(options.at) : new Date();
    const status = outgoing ? (options.status || "sent") : null;

    ensureDaySeparator(when);

    const bubble = document.createElement("div");
    bubble.className = `msg-bubble ${outgoing ? "is-out" : "is-in"}`;

    const textEl = document.createElement("p");
    textEl.className = "msg-bubble-text";
    textEl.textContent = text;
    bubble.appendChild(textEl);

    const meta = document.createElement("div");
    meta.className = "msg-bubble-meta";

    const timeEl = document.createElement("time");
    timeEl.dateTime = when.toISOString();
    timeEl.textContent = timeLabel(when);
    meta.appendChild(timeEl);

    if (outgoing) {
      const ticks = document.createElement("span");
      ticks.innerHTML = `<i class="fa-solid ${tickIcon(status)}" aria-hidden="true"></i>`;
      setTickStatus(ticks, status);
      meta.appendChild(ticks);
    }

    bubble.appendChild(meta);
    host.appendChild(bubble);
    if (msgChatLog) msgChatLog.scrollTop = msgChatLog.scrollHeight;
    return bubble;
  }

  function openChatFromRow(row) {
    if (!row || !msgChatView || !msgListView) return;
    activeChatId = row.dataset.chatId || "unknown";
    const name = row.dataset.name || "Contact";
    const avatar = row.dataset.avatar || "assets/images/cchub/tt1.webp";
    const status = row.dataset.status || "Active now";

    if (msgChatName) msgChatName.textContent = name;
    if (msgChatStatus) msgChatStatus.textContent = status;
    if (msgChatAvatar) {
      msgChatAvatar.src = avatar;
      msgChatAvatar.alt = "";
    }

    msgListView.hidden = true;
    msgChatView.hidden = false;
    clearPendingFiles();

    if (msgChatLog) {
      msgChatLog.querySelectorAll(".msg-thread").forEach((thread) => {
        thread.hidden = true;
      });
      const threadEl = ensureThreadEl(activeChatId);
      if (threadEl) {
        threadEl.hidden = false;
        const lastSep = [...threadEl.querySelectorAll(".msg-day-sep time")].pop();
        const lastSepLabel = lastSep?.textContent?.trim() || "";
        if (lastSepLabel === "Today") {
          lastRenderedDayKey = dayKey(new Date());
        } else if (lastSepLabel === "Yesterday") {
          const y = new Date();
          y.setDate(y.getDate() - 1);
          lastRenderedDayKey = dayKey(y);
        } else {
          lastRenderedDayKey = null;
        }
        if (!threadEl.children.length) {
          lastRenderedDayKey = null;
          appendBubble(`Start a conversation with ${name}.`, false, { at: new Date().toISOString() });
        }
        msgChatLog.scrollTop = msgChatLog.scrollHeight;
      }
    }

    window.requestAnimationFrame(() => msgChatInput?.focus());
  }

  messagesPanel?.querySelectorAll("[data-msg-close]").forEach((el) => {
    el.addEventListener("click", () => setMessagesOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && messagesPanel && !messagesPanel.hidden) {
      if (appNavDropdown && !appNavDropdown.hidden) return;
      if (msgChatView && !msgChatView.hidden) {
        showListView();
      } else {
        setMessagesOpen(false);
        openMessagesBtn?.focus();
      }
    }
  });

  msgChatBack?.addEventListener("click", () => {
    showListView();
  });

  document.getElementById("msgConversationList")?.addEventListener("click", (e) => {
    const row = e.target.closest(".msg-row");
    if (row) openChatFromRow(row);
  });

  msgAttachBtn?.addEventListener("click", () => msgFileInput?.click());

  msgFileInput?.addEventListener("change", () => {
    const files = Array.from(msgFileInput.files || []);
    if (!files.length) return;
    pendingFiles = pendingFiles.concat(files).slice(0, 5);
    renderAttachPreview();
    msgFileInput.value = "";
  });

  function autoGrowTextarea() {
    if (!msgChatInput) return;
    msgChatInput.style.height = "auto";
    msgChatInput.style.height = `${Math.min(msgChatInput.scrollHeight, 96)}px`;
  }

  msgChatInput?.addEventListener("input", autoGrowTextarea);

  msgChatInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      msgChatForm?.requestSubmit();
    }
  });

  msgChatForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = msgChatInput?.value.trim() || "";
    const hasFiles = pendingFiles.length > 0;
    if (!text && !hasFiles) return;

    const now = new Date();
    const outgoingText = hasFiles
      ? (text ? `${text}\n📎 ${pendingFiles.map((f) => f.name).join(", ")}` : `📎 ${pendingFiles.map((f) => f.name).join(", ")}`)
      : text;

    if (hasFiles) clearPendingFiles();

    const bubble = appendBubble(outgoingText, true, { at: now.toISOString(), status: "sent" });
    const ticks = bubble?.querySelector(".msg-ticks");

    window.setTimeout(() => {
      setTickStatus(ticks, "delivered");
    }, 700);
    window.setTimeout(() => {
      setTickStatus(ticks, "read");
    }, 1800);

    if (msgChatInput) {
      msgChatInput.value = "";
      autoGrowTextarea();
      msgChatInput.focus();
    }

    window.setTimeout(() => {
      appendBubble("Thanks — I'll reply shortly.", false, { at: new Date().toISOString() });
    }, 900);
  });

  /* ---------- App nav dropdown (Account + Admin Messages + Share) ---------- */

  const appNav = document.querySelector(".app-nav");
  const appNavDropdown = document.getElementById("appNavDropdown");
  const adminMessagesDropdown = document.getElementById("adminMessagesDropdown");
  const shareProfileDropdown = document.getElementById("shareProfileDropdown");
  const openAdminMessagesBtn = document.getElementById("openAdminMessagesBtn");
  const openShareProfileBtn = document.getElementById("openShareProfileBtn");
  const shareProfileLink = document.getElementById("shareProfileLink");
  const shareProfileLinkText = document.getElementById("shareProfileLinkText");
  const shareProfileCopyBtn = document.getElementById("shareProfileCopyBtn");
  const shareProfileCopyStatus = document.getElementById("shareProfileCopyStatus");
  const shareProfileSearch = document.getElementById("shareProfileSearch");
  const shareProfileResults = document.getElementById("shareProfileResults");
  const shareProfileEmpty = document.getElementById("shareProfileEmpty");
  const appNavItems = Array.from(document.querySelectorAll(".app-nav .app-nav-item"));
  let appNavDropdownAnchor = null;
  let shareCopyTimer = 0;

  function setAppNavExpanded(item, expanded) {
    appNavItems.forEach((navItem) => {
      navItem.setAttribute("aria-expanded", navItem === item && expanded ? "true" : "false");
    });
  }

  function positionDropdownUnderItem(dropdown, item, fallbackWidth) {
    if (!appNav || !dropdown || !item) return;
    const navRect = appNav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const menuWidth = dropdown.offsetWidth || fallbackWidth;
    let left = itemRect.left - navRect.left + itemRect.width / 2 - menuWidth / 2;
    left = Math.max(8, Math.min(left, navRect.width - menuWidth - 8));
    dropdown.style.left = `${left}px`;
    dropdown.style.right = "auto";
  }

  function positionAppNavDropdown(item) {
    positionDropdownUnderItem(appNavDropdown, item, 188);
  }

  function positionAdminMessagesDropdown(item) {
    positionDropdownUnderItem(adminMessagesDropdown, item, 420);
  }

  function positionShareProfileDropdown(item) {
    positionDropdownUnderItem(shareProfileDropdown, item, 400);
  }

  function getShareProfileUrl() {
    const path =
      shareProfileDropdown?.dataset.profilePath ||
      (document.body.classList.contains("page-other-profile")
        ? "ch-other-profile.html"
        : "ch-profile.html");
    try {
      return new URL(path, window.location.href).href;
    } catch {
      return path;
    }
  }

  function syncShareProfileLink() {
    const url = getShareProfileUrl();
    if (shareProfileLink) shareProfileLink.href = url;
    if (shareProfileLinkText) {
      const short =
        url.replace(/^https?:\/\//, "").length > 42
          ? `${url.replace(/^https?:\/\//, "").slice(0, 39)}...`
          : url.replace(/^https?:\/\//, "");
      shareProfileLinkText.textContent = short;
      shareProfileLinkText.title = url;
    }
  }

  function filterShareProfileResults(query) {
    if (!shareProfileResults) return;
    const q = String(query || "").trim().toLowerCase();
    let visible = 0;
    shareProfileResults.querySelectorAll(".share-profile-result").forEach((item) => {
      const name = (item.dataset.name || "").toLowerCase();
      const role = (item.dataset.role || "").toLowerCase();
      const text = item.textContent.toLowerCase();
      const match = !q || name.includes(q) || role.includes(q) || text.includes(q);
      item.hidden = !match;
      if (match) visible += 1;
    });
    if (shareProfileEmpty) shareProfileEmpty.hidden = visible > 0;
  }

  function closeAdminMessagesDropdown() {
    if (!adminMessagesDropdown) return;
    adminMessagesDropdown.hidden = true;
    if (openAdminMessagesBtn) openAdminMessagesBtn.setAttribute("aria-expanded", "false");
  }

  function closeShareProfileDropdown() {
    if (!shareProfileDropdown) return;
    shareProfileDropdown.hidden = true;
    if (openShareProfileBtn) openShareProfileBtn.setAttribute("aria-expanded", "false");
    if (shareProfileSearch) shareProfileSearch.value = "";
    filterShareProfileResults("");
    if (shareProfileCopyStatus) shareProfileCopyStatus.hidden = true;
    shareProfileCopyBtn?.classList.remove("is-copied");
  }

  function closeAppNavDropdown() {
    if (!appNavDropdown) return;
    appNavDropdown.hidden = true;
    setAppNavExpanded(null, false);
    appNavDropdownAnchor = null;
  }

  function closeAllAppNavMenus() {
    closeAppNavDropdown();
    closeAdminMessagesDropdown();
    closeShareProfileDropdown();
  }

  function openAppNavDropdown(item) {
    if (!appNavDropdown || !item) return;
    closeAdminMessagesDropdown();
    closeShareProfileDropdown();
    if (typeof setMessagesOpen === "function") setMessagesOpen(false);
    appNavDropdown.hidden = false;
    appNavDropdownAnchor = item;
    setAppNavExpanded(item, true);
    positionAppNavDropdown(item);
    window.requestAnimationFrame(() => {
      appNavDropdown.querySelector(".app-nav-dropdown-item")?.focus();
    });
  }

  function openAdminMessagesDropdown(item) {
    if (!adminMessagesDropdown || !item) return;
    closeAppNavDropdown();
    closeShareProfileDropdown();
    if (typeof setMessagesOpen === "function") setMessagesOpen(false);
    adminMessagesDropdown.hidden = false;
    setAppNavExpanded(item, true);
    positionAdminMessagesDropdown(item);
  }

  function openShareProfileDropdown(item) {
    if (!shareProfileDropdown || !item) return;
    closeAppNavDropdown();
    closeAdminMessagesDropdown();
    if (typeof setMessagesOpen === "function") setMessagesOpen(false);
    syncShareProfileLink();
    filterShareProfileResults("");
    shareProfileDropdown.hidden = false;
    setAppNavExpanded(item, true);
    positionShareProfileDropdown(item);
    window.requestAnimationFrame(() => shareProfileSearch?.focus());
  }

  function toggleAppNavDropdown(item) {
    if (!item) return;
    const isOpen = !appNavDropdown?.hidden && appNavDropdownAnchor === item;
    if (isOpen) closeAppNavDropdown();
    else openAppNavDropdown(item);
  }

  function toggleAdminMessagesDropdown(item) {
    if (!item) return;
    const isOpen = adminMessagesDropdown && !adminMessagesDropdown.hidden;
    if (isOpen) {
      closeAdminMessagesDropdown();
      setAppNavExpanded(null, false);
    } else {
      openAdminMessagesDropdown(item);
    }
  }

  function toggleShareProfileDropdown(item) {
    if (!item) return;
    const isOpen = shareProfileDropdown && !shareProfileDropdown.hidden;
    if (isOpen) {
      closeShareProfileDropdown();
      setAppNavExpanded(null, false);
    } else {
      openShareProfileDropdown(item);
    }
  }

  appNavItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (item.id === "openMessagesBtn" && messagesPanel) {
        const wasOpen = messagesPanel && !messagesPanel.hidden;
        closeAllAppNavMenus();
        if (wasOpen) {
          setMessagesOpen(false);
        } else {
          setMessagesOpen(true);
          showListView();
        }
        return;
      }

      if (item.id === "openAdminMessagesBtn") {
        toggleAdminMessagesDropdown(item);
        return;
      }

      if (item.id === "openShareProfileBtn") {
        toggleShareProfileDropdown(item);
        return;
      }

      // Allow "Your Profile" on other-profile to navigate
      if (item.getAttribute("href") === "ch-profile.html" && !item.classList.contains("is-active")) {
        closeAllAppNavMenus();
        window.location.href = "ch-profile.html";
        return;
      }

      toggleAppNavDropdown(item);
    });
  });

  appNavDropdown?.addEventListener("click", (e) => {
    e.stopPropagation();
    const actionItem = e.target.closest("[data-nav-action]");
    if (!actionItem) return;
    e.preventDefault();
    const action = actionItem.getAttribute("data-nav-action");
    closeAllAppNavMenus();
    if (action === "logout") {
      console.info("Logout (demo)");
      window.location.href = "index.html";
      return;
    }
    if (action === "activity") {
      window.location.href = "activity.html";
      return;
    }
  });

  adminMessagesDropdown?.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  shareProfileDropdown?.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  shareProfileCopyBtn?.addEventListener("click", async () => {
    const url = getShareProfileUrl();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const temp = document.createElement("textarea");
        temp.value = url;
        temp.setAttribute("readonly", "");
        temp.style.position = "absolute";
        temp.style.left = "-9999px";
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();
      }
      shareProfileCopyBtn.classList.add("is-copied");
      const icon = shareProfileCopyBtn.querySelector("i");
      if (icon) icon.className = "fa-solid fa-check";
      if (shareProfileCopyStatus) {
        shareProfileCopyStatus.hidden = false;
        shareProfileCopyStatus.textContent = "Profile link copied";
      }
      window.clearTimeout(shareCopyTimer);
      shareCopyTimer = window.setTimeout(() => {
        shareProfileCopyBtn.classList.remove("is-copied");
        if (icon) icon.className = "fa-regular fa-copy";
        if (shareProfileCopyStatus) shareProfileCopyStatus.hidden = true;
      }, 1800);
    } catch {
      if (shareProfileCopyStatus) {
        shareProfileCopyStatus.hidden = false;
        shareProfileCopyStatus.textContent = "Unable to copy link";
      }
    }
  });

  shareProfileSearch?.addEventListener("input", () => {
    filterShareProfileResults(shareProfileSearch.value);
  });

  document.addEventListener("click", (e) => {
    const clickedNav = e.target.closest(".app-nav-item");
    const clickedAccountMenu = e.target.closest("#appNavDropdown");
    const clickedAdminMenu = e.target.closest("#adminMessagesDropdown");
    const clickedShareMenu = e.target.closest("#shareProfileDropdown");
    if (clickedNav || clickedAccountMenu || clickedAdminMenu || clickedShareMenu) return;
    closeAllAppNavMenus();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const adminOpen = adminMessagesDropdown && !adminMessagesDropdown.hidden;
    const shareOpen = shareProfileDropdown && !shareProfileDropdown.hidden;
    const accountOpen = appNavDropdown && !appNavDropdown.hidden;
    if (!adminOpen && !shareOpen && !accountOpen) return;
    const anchor = adminOpen
      ? openAdminMessagesBtn
      : shareOpen
        ? openShareProfileBtn
        : appNavDropdownAnchor;
    closeAllAppNavMenus();
    anchor?.focus();
  });

  window.addEventListener("resize", () => {
    if (!appNavDropdown?.hidden && appNavDropdownAnchor) {
      positionAppNavDropdown(appNavDropdownAnchor);
    }
    if (adminMessagesDropdown && !adminMessagesDropdown.hidden && openAdminMessagesBtn) {
      positionAdminMessagesDropdown(openAdminMessagesBtn);
    }
    if (shareProfileDropdown && !shareProfileDropdown.hidden && openShareProfileBtn) {
      positionShareProfileDropdown(openShareProfileBtn);
    }
  });

  syncShareProfileLink();
})();
