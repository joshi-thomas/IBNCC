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
    item.querySelector(".detail-edit-form")?.remove();
    item.querySelector('[data-action="edit"]')?.setAttribute("aria-pressed", "false");
  }

  function openDetailEditor(item) {
    if (!item || item.classList.contains("is-editing")) return;

    document.querySelectorAll(".profile-detail-item.is-editing").forEach(closeDetailEditor);

    const grid = item.querySelector(".detail-grid");
    const content = item.querySelector(".detail-content");
    const rows = [...(grid?.querySelectorAll(":scope > div") || [])];
    const sectionLabel = item.querySelector(".detail-label")?.textContent.trim() || "";
    if (!grid || !content || !rows.length) return;

    item.open = true;
    item.classList.add("is-editing");
    item.querySelector('[data-action="edit"]')?.setAttribute("aria-pressed", "true");
    grid.hidden = true;

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
        <button type="button" class="sidebar-btn-secondary">Cancel</button>
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
    form.querySelector("input")?.focus();

    form.querySelectorAll(".detail-input-wrap input").forEach((input) => {
      input.addEventListener("click", () => {
        const field = input.closest(".detail-edit-field.has-options");
        if (!field) return;
        const shouldOpen = !field.classList.contains("is-open");
        setOptionDropdownOpen(field, shouldOpen);
      });
    });

    form.querySelectorAll(".detail-option-toggle").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const field = toggle.closest(".detail-edit-field.has-options");
        if (!field) return;
        const shouldOpen = !field.classList.contains("is-open");
        setOptionDropdownOpen(field, shouldOpen);
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

    form.querySelector(".sidebar-btn-secondary")?.addEventListener("click", () => {
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

      const label = item?.querySelector(".detail-label")?.textContent?.trim();
      console.info(`${action}: ${label}`);
    });
  });

  document.querySelector(".gallery-add-btn")?.addEventListener("click", () => {
    console.info("Add Image (demo)");
  });

  document.querySelector(".gallery-view-more")?.addEventListener("click", () => {
    console.info("View More gallery (demo)");
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

  function openPasswordDialog() {
    passwordDialog?.showModal();
  }

  function closePasswordDialogFn() {
    passwordDialog?.close();
    changePasswordForm?.reset();
  }

  changePasswordLink?.addEventListener("click", (e) => {
    e.preventDefault();
    openPasswordDialog();
  });

  closePasswordDialog?.addEventListener("click", closePasswordDialogFn);
  cancelPasswordBtn?.addEventListener("click", closePasswordDialogFn);

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

  const conversationThreads = {
    vivek: [
      { text: "Hi George, hope you're doing well!", out: false },
      { text: "Doing great, Vivek. How about you?", out: true },
      { text: "All good. Are you joining the Kochi conclave?", out: false },
    ],
    jaleel: [
      { text: "Can we connect on the networking session?", out: false },
      { text: "Absolutely — I'll be there after lunch.", out: true },
    ],
    joseph: [
      { text: "Aahaaa", out: false },
    ],
    bejois: [
      { text: "Sending over the event flyer shortly.", out: false },
      { text: "Please check the seating update as well.", out: false },
      { text: "Thanks Bejois, received!", out: true },
    ],
    anoop: [
      { text: "Reacted 👍 to your message", out: false },
      { text: "Looking forward to collaborating.", out: true },
    ],
    maria: [
      { text: "Looking forward to the conclave", out: false },
      { text: "Same here — see you in Kochi!", out: true },
    ],
    rahul: [
      { text: "Quick question about the trading desk timings.", out: false },
    ],
  };

  let pendingFiles = [];
  let activeChatId = null;

  function setMessagesOpen(open) {
    if (!messagesPanel || !openMessagesBtn) return;
    messagesPanel.hidden = !open;
    openMessagesBtn.setAttribute("aria-expanded", open ? "true" : "false");
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

  function appendBubble(text, outgoing) {
    if (!msgChatLog) return;
    const bubble = document.createElement("div");
    bubble.className = `msg-bubble ${outgoing ? "is-out" : "is-in"}`;
    bubble.textContent = text;
    const meta = document.createElement("span");
    meta.className = "msg-bubble-meta";
    meta.textContent = outgoing ? "Just now" : "";
    if (outgoing) bubble.appendChild(meta);
    msgChatLog.appendChild(bubble);
    msgChatLog.scrollTop = msgChatLog.scrollHeight;
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
      msgChatLog.innerHTML = "";
      const thread = conversationThreads[activeChatId] || [
        { text: `Start a conversation with ${name}.`, out: false },
      ];
      thread.forEach((msg) => appendBubble(msg.text, msg.out));
    }

    window.requestAnimationFrame(() => msgChatInput?.focus());
  }

  openMessagesBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    const opening = Boolean(messagesPanel?.hidden);
    setMessagesOpen(opening);
    if (opening) showListView();
  });

  messagesPanel?.querySelectorAll("[data-msg-close]").forEach((el) => {
    el.addEventListener("click", () => setMessagesOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && messagesPanel && !messagesPanel.hidden) {
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

    if (hasFiles) {
      const names = pendingFiles.map((f) => f.name).join(", ");
      appendBubble(text ? `${text}\n📎 ${names}` : `📎 ${names}`, true);
      clearPendingFiles();
    } else {
      appendBubble(text, true);
    }

    if (msgChatInput) {
      msgChatInput.value = "";
      autoGrowTextarea();
      msgChatInput.focus();
    }

    window.setTimeout(() => {
      appendBubble("Thanks — I'll reply shortly.", false);
    }, 700);
  });
})();
