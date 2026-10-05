/**
 * CC Hub — Login, register, OTP, and reset-password modals
 */

(() => {
  "use strict";

  const ACCOUNTS_KEY = "ccHubAccounts";
  const OTP_KEY = "ccHubOtp";
  const SESSION_KEY = "ccHubSession";
  const RESEND_SECONDS = 30;

  /* ---------- Signed-in session + header profile icon ---------- */
  function readSession() {
    for (const store of [localStorage, sessionStorage]) {
      try {
        const session = JSON.parse(store.getItem(SESSION_KEY) || "null");
        if (session && typeof session === "object") return session;
      } catch {
        store.removeItem(SESSION_KEY);
      }
    }
    return null;
  }

  function writeSession(user, remember) {
    const session = { name: String(user.name || "").trim(), phone: user.phone || "" };
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(session));
    renderHeaderAuth();
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    renderHeaderAuth();
  }

  function initialOf(name) {
    const first = Array.from(String(name || "").trim())[0];
    return first ? first.toLocaleUpperCase() : "";
  }

  function closeProfileMenus(except) {
    document.querySelectorAll(".header-profile").forEach((profile) => {
      if (profile === except) return;
      const menu = profile.querySelector(".header-profile-menu");
      const btn = profile.querySelector(".header-profile-btn");
      if (menu) menu.hidden = true;
      btn?.setAttribute("aria-expanded", "false");
    });
  }

  function buildProfile() {
    const profile = document.createElement("div");
    profile.className = "header-profile";
    profile.innerHTML = `
      <button type="button" class="header-profile-btn" aria-haspopup="menu" aria-expanded="false">
        <span class="header-profile-initial" aria-hidden="true"></span>
      </button>
      <div class="header-profile-menu" role="menu" hidden>
        <p class="header-profile-name"></p>
        <a href="my-account.html" class="header-profile-item" role="menuitem">
          <i class="fa-regular fa-user" aria-hidden="true"></i> My Account
        </a>
        <button type="button" class="header-profile-item" role="menuitem" data-auth-logout>
          <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> Logout
        </button>
      </div>`;

    const btn = profile.querySelector(".header-profile-btn");
    const menu = profile.querySelector(".header-profile-menu");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const opening = menu.hidden;
      closeProfileMenus(profile);
      menu.hidden = !opening;
      btn.setAttribute("aria-expanded", String(opening));
    });

    profile.querySelector("[data-auth-logout]").addEventListener("click", () => {
      logout();
      document.querySelector(".header-actions .btn-login")?.focus();
    });

    return profile;
  }

  function renderHeaderAuth() {
    const session = readSession();
    document.querySelectorAll(".header-actions .btn-login").forEach((loginLink) => {
      let profile = loginLink.nextElementSibling?.classList.contains("header-profile")
        ? loginLink.nextElementSibling
        : null;

      if (!session) {
        loginLink.hidden = false;
        profile?.remove();
        return;
      }

      if (!profile) {
        profile = buildProfile();
        loginLink.after(profile);
      }

      const name = session.name || "Member";
      const initial = initialOf(session.name);
      const initialEl = profile.querySelector(".header-profile-initial");
      initialEl.textContent = initial;
      initialEl.classList.toggle("is-fallback", !initial);
      if (!initial) initialEl.innerHTML = '<i class="fa-solid fa-user"></i>';
      profile.querySelector(".header-profile-btn").setAttribute("aria-label", `Account menu for ${name}`);
      profile.querySelector(".header-profile-name").textContent = name;
      loginLink.hidden = true;
    });
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".header-profile")) closeProfileMenus();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = document.querySelector(".header-profile-menu:not([hidden])");
    if (!open) return;
    closeProfileMenus();
    open.closest(".header-profile")?.querySelector(".header-profile-btn")?.focus();
  });

  window.addEventListener("storage", (e) => {
    if (e.key === SESSION_KEY || e.key === null) renderHeaderAuth();
  });

  window.ccHubAuth = { getSession: readSession, logout };
  renderHeaderAuth();

  const loginModal = document.getElementById("loginModal");
  const registerModal = document.getElementById("registerModal");
  const otpModal = document.getElementById("otpModal");
  const resetPasswordModal = document.getElementById("resetPasswordModal");
  if (!loginModal && !registerModal && !otpModal && !resetPasswordModal) return;

  let resendTimerId = 0;
  let verifiedResetPhone = "";

  function openDialog(dialog, focusId) {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    window.requestAnimationFrame(() => {
      if (focusId) document.getElementById(focusId)?.focus();
    });
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (dialog.open && typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
  }

  function openLogin(e) {
    e?.preventDefault();
    closeDialog(registerModal);
    closeDialog(otpModal);
    closeDialog(resetPasswordModal);
    openDialog(loginModal, "loginPhone");
  }

  function openRegister(e) {
    e?.preventDefault();
    closeDialog(loginModal);
    closeDialog(otpModal);
    closeDialog(resetPasswordModal);
    openDialog(registerModal, "registerName");
  }

  function getAccounts() {
    try {
      const parsed = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function findAccount(phone) {
    const normalized = normalizePhone(phone);
    return getAccounts().find((item) => normalizePhone(item.phone) === normalized) || null;
  }

  function saveAccount(account) {
    const phone = normalizePhone(account.phone);
    if (!phone) return;
    const existing = findAccount(phone) || {};
    const accounts = getAccounts().filter((item) => normalizePhone(item.phone) !== phone);
    accounts.push({ ...existing, ...account, phone });
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  function normalizePhone(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function maskPhone(phone) {
    const digits = normalizePhone(phone);
    if (digits.length < 4) return phone || "your registered mobile";
    return `${digits.slice(0, 2)}${"•".repeat(Math.max(0, digits.length - 6))}${digits.slice(-4)}`;
  }

  function otpInputs() {
    return [...(otpModal?.querySelectorAll(".otp-inputs input") || [])];
  }

  function readOtpValue() {
    return otpInputs()
      .map((input) => input.value.replace(/\D/g, ""))
      .join("");
  }

  function clearOtpInputs() {
    otpInputs().forEach((input) => {
      input.value = "";
    });
  }

  function setOtpMessage(type, text) {
    const error = document.getElementById("otpError");
    const success = document.getElementById("otpSuccess");
    if (error) {
      error.hidden = type !== "error";
      error.textContent = type === "error" ? text : "";
    }
    if (success) {
      success.hidden = type !== "success";
      success.textContent = type === "success" ? text : "";
    }
  }

  function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function persistOtp(phone, code) {
    sessionStorage.setItem(
      OTP_KEY,
      JSON.stringify({
        phone: normalizePhone(phone),
        code,
        expires: Date.now() + 5 * 60 * 1000,
      })
    );
  }

  function readStoredOtp() {
    try {
      return JSON.parse(sessionStorage.getItem(OTP_KEY) || "null");
    } catch {
      return null;
    }
  }

  function stopResendTimer() {
    window.clearInterval(resendTimerId);
    resendTimerId = 0;
  }

  function startResendTimer() {
    const resendBtn = document.getElementById("otpResend");
    const timer = document.getElementById("otpTimer");
    let remaining = RESEND_SECONDS;
    stopResendTimer();
    if (resendBtn) resendBtn.disabled = true;
    if (timer) timer.textContent = `(${remaining}s)`;

    resendTimerId = window.setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        stopResendTimer();
        if (resendBtn) resendBtn.disabled = false;
        if (timer) timer.textContent = "";
        return;
      }
      if (timer) timer.textContent = `(${remaining}s)`;
    }, 1000);
  }

  function sendOtp(phone) {
    const code = generateOtp();
    persistOtp(phone, code);

    const masked = document.getElementById("otpMaskedPhone");
    const sms = document.getElementById("otpSms");
    const smsCode = document.getElementById("otpSmsCode");
    if (masked) masked.textContent = maskPhone(phone);
    if (smsCode) smsCode.textContent = code;
    if (sms) sms.hidden = false;

    clearOtpInputs();
    setOtpMessage("", "");
    startResendTimer();
  }

  function resolveResetPhone() {
    const typed = document.getElementById("loginPhone")?.value.trim() || "";
    const accounts = getAccounts();
    if (typed) return typed;
    return accounts[accounts.length - 1]?.phone || "";
  }

  function openOtp(e) {
    e?.preventDefault();
    const phoneInput = document.getElementById("loginPhone");
    const phone = resolveResetPhone();

    if (phoneInput) phoneInput.setCustomValidity("");

    if (!normalizePhone(phone)) {
      if (phoneInput) {
        phoneInput.setCustomValidity("Enter the mobile number used at signup.");
        phoneInput.reportValidity();
        phoneInput.focus();
      }
      return;
    }

    const accounts = getAccounts();
    if (accounts.length && !findAccount(phone)) {
      if (phoneInput) {
        phoneInput.setCustomValidity("This mobile number is not registered. Please sign up first.");
        phoneInput.reportValidity();
        phoneInput.focus();
      }
      return;
    }

    const account = findAccount(phone);
    const targetPhone = account?.phone || phone;

    closeDialog(loginModal);
    closeDialog(registerModal);
    closeDialog(resetPasswordModal);
    sendOtp(targetPhone);
    openDialog(otpModal, "otpDigit1");
  }

  function verifyOtp(e) {
    e?.preventDefault();
    const entered = readOtpValue();
    const stored = readStoredOtp();

    if (entered.length !== 6) {
      setOtpMessage("error", "Enter the 6-digit OTP sent to your mobile number.");
      otpInputs()[0]?.focus();
      return;
    }

    if (!stored || Date.now() > stored.expires) {
      setOtpMessage("error", "This OTP has expired. Please resend a new code.");
      return;
    }

    if (entered !== stored.code) {
      setOtpMessage("error", "Invalid OTP. Please try again.");
      otpInputs()[otpInputs().length - 1]?.focus();
      return;
    }

    verifiedResetPhone = stored.phone;
    sessionStorage.removeItem(OTP_KEY);
    setOtpMessage("success", "Mobile number verified successfully.");
    window.setTimeout(() => {
      stopResendTimer();
      closeDialog(otpModal);
      openResetPassword();
    }, 500);
  }

  function setResetPasswordMessage(type, text) {
    const error = document.getElementById("resetPasswordError");
    const success = document.getElementById("resetPasswordSuccess");
    if (error) {
      error.hidden = type !== "error";
      error.textContent = type === "error" ? text : "";
    }
    if (success) {
      success.hidden = type !== "success";
      success.textContent = type === "success" ? text : "";
    }
  }

  function openResetPassword() {
    document.getElementById("resetPasswordForm")?.reset();
    setResetPasswordMessage("", "");
    closeDialog(loginModal);
    closeDialog(registerModal);
    closeDialog(otpModal);
    openDialog(resetPasswordModal, "resetPassword");
  }

  function saveNewPassword(e) {
    e?.preventDefault();
    const password = document.getElementById("resetPassword")?.value || "";
    const confirm = document.getElementById("resetPasswordConfirm")?.value || "";

    if (password.length < 6) {
      setResetPasswordMessage("error", "Password must be at least 6 characters.");
      document.getElementById("resetPassword")?.focus();
      return;
    }

    if (password !== confirm) {
      setResetPasswordMessage("error", "Passwords do not match.");
      document.getElementById("resetPasswordConfirm")?.focus();
      return;
    }

    if (!normalizePhone(verifiedResetPhone)) {
      setResetPasswordMessage("error", "Please verify OTP again before setting a new password.");
      return;
    }

    saveAccount({
      phone: verifiedResetPhone,
      password,
    });
    setResetPasswordMessage("success", "Password updated successfully. You can now log in.");

    const loginPhone = document.getElementById("loginPhone");
    if (loginPhone) loginPhone.value = verifiedResetPhone;
    verifiedResetPhone = "";

    window.setTimeout(() => {
      closeDialog(resetPasswordModal);
      openDialog(loginModal, "loginPassword");
    }, 800);
  }

  document.querySelectorAll(".btn-login").forEach((btn) => {
    btn.addEventListener("click", openLogin);
  });

  document.querySelectorAll(".login-register").forEach((btn) => {
    btn.addEventListener("click", openRegister);
  });

  document.querySelectorAll(".login-forgot").forEach((btn) => {
    btn.addEventListener("click", openOtp);
  });

  document.getElementById("otpBackLogin")?.addEventListener("click", openLogin);
  document.getElementById("resetBackLogin")?.addEventListener("click", openLogin);

  document.getElementById("loginModalClose")?.addEventListener("click", () => {
    closeDialog(loginModal);
  });

  document.getElementById("registerModalClose")?.addEventListener("click", () => {
    closeDialog(registerModal);
  });

  document.getElementById("otpModalClose")?.addEventListener("click", () => {
    stopResendTimer();
    closeDialog(otpModal);
  });

  document.getElementById("resetPasswordModalClose")?.addEventListener("click", () => {
    closeDialog(resetPasswordModal);
  });

  loginModal?.addEventListener("click", (e) => {
    if (e.target === loginModal) closeDialog(loginModal);
  });

  registerModal?.addEventListener("click", (e) => {
    if (e.target === registerModal) closeDialog(registerModal);
  });

  otpModal?.addEventListener("click", (e) => {
    if (e.target === otpModal) {
      stopResendTimer();
      closeDialog(otpModal);
    }
  });

  resetPasswordModal?.addEventListener("click", (e) => {
    if (e.target === resetPasswordModal) closeDialog(resetPasswordModal);
  });

  document.getElementById("loginPhone")?.addEventListener("input", () => {
    document.getElementById("loginPhone").setCustomValidity("");
  });

  function bindPasswordToggle(btn) {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.getAttribute("data-password-toggle")) ||
        document.getElementById("loginPassword");
      if (!input) return;
      const hidden = input.type === "password";
      input.type = hidden ? "text" : "password";
      btn.setAttribute("aria-label", hidden ? "Hide password" : "Show password");
      const icon = btn.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-eye-slash", !hidden);
        icon.classList.toggle("fa-eye", hidden);
      }
    });
  }

  document.querySelectorAll("[data-password-toggle]").forEach(bindPasswordToggle);

  const loginToggle = document.getElementById("loginPasswordToggle");
  if (loginToggle && !loginToggle.hasAttribute("data-password-toggle")) {
    bindPasswordToggle(loginToggle);
  }

  document.getElementById("loginPassword")?.addEventListener("input", () => {
    document.getElementById("loginPassword").setCustomValidity("");
  });

  document.getElementById("loginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const phoneInput = document.getElementById("loginPhone");
    const passwordInput = document.getElementById("loginPassword");
    const account = findAccount(phoneInput?.value);

    if (!account) {
      phoneInput?.setCustomValidity("This mobile number is not registered. Please sign up first.");
      phoneInput?.reportValidity();
      return;
    }

    if (account.password && account.password !== passwordInput?.value) {
      passwordInput?.setCustomValidity("Incorrect password. Please try again.");
      passwordInput?.reportValidity();
      return;
    }

    writeSession(account, Boolean(form.elements.remember?.checked));
    form.reset();
    closeDialog(loginModal);
  });

  document.getElementById("registerForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const password = document.getElementById("registerPassword")?.value || "";
    const confirm = document.getElementById("registerConfirm")?.value || "";
    if (password !== confirm) {
      window.alert("Passwords do not match.");
      document.getElementById("registerConfirm")?.focus();
      return;
    }

    const phoneVerified = document.getElementById("registerPhoneField")?.dataset.verified === "true";
    const emailValue = document.getElementById("registerEmail")?.value.trim() || "";
    const emailVerified = document.getElementById("registerEmailField")?.dataset.verified === "true";

    if (document.getElementById("registerPhoneVerifyBtn") && !phoneVerified) {
      window.alert("Please verify your phone number before signing up.");
      document.getElementById("registerPhone")?.focus();
      return;
    }

    if (emailValue && document.getElementById("registerEmailVerifyBtn") && !emailVerified) {
      window.alert("Please verify your email address before signing up.");
      document.getElementById("registerEmail")?.focus();
      return;
    }

    const account = {
      name: document.getElementById("registerName")?.value.trim() || "",
      phone: document.getElementById("registerPhone")?.value || "",
      email: emailValue,
      password,
    };
    saveAccount(account);
    writeSession(account, true);
    closeDialog(registerModal);
  });

  /* ---------- Searchable dependent dropdowns (register form: Rite → Diocese → Parish) ---------- */
  function setupRegisterCombos(form) {
    const combos = [];
    let escapeHandled = false;

    function closeAll(except) {
      combos.forEach((combo) => {
        if (combo !== except) combo.close(false);
      });
    }

    form.querySelectorAll(".register-combo select").forEach((select, index) => {
      const field = select.closest(".register-combo");
      const label = field.querySelector("label");
      const uid = select.id || `registerCombo${index}`;
      const placeholder =
        select.querySelector('option[value=""]')?.textContent.trim() || "Select an option";
      const labelText = label?.textContent.trim() || "";

      if (label && !label.id) label.id = `${uid}Label`;

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "register-combo-trigger";
      trigger.id = `${uid}Trigger`;
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-controls", `${uid}Panel`);
      if (label) trigger.setAttribute("aria-labelledby", `${label.id} ${trigger.id}`);

      const panel = document.createElement("div");
      panel.className = "register-combo-panel";
      panel.id = `${uid}Panel`;
      panel.hidden = true;

      const searchWrap = document.createElement("div");
      searchWrap.className = "register-combo-search";
      searchWrap.innerHTML = '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>';

      const search = document.createElement("input");
      search.type = "text";
      search.autocomplete = "off";
      search.spellcheck = false;
      search.placeholder = labelText ? `Search ${labelText.toLowerCase()}` : "Search";
      search.setAttribute("role", "combobox");
      search.setAttribute("aria-label", labelText ? `Search ${labelText}` : "Search");
      search.setAttribute("aria-autocomplete", "list");
      search.setAttribute("aria-expanded", "true");
      search.setAttribute("aria-controls", `${uid}List`);
      searchWrap.appendChild(search);

      const list = document.createElement("ul");
      list.className = "register-combo-list";
      list.id = `${uid}List`;
      list.setAttribute("role", "listbox");
      if (label) list.setAttribute("aria-labelledby", label.id);

      const empty = document.createElement("p");
      empty.className = "register-combo-empty";
      empty.textContent = "No matches found";
      empty.hidden = true;

      panel.append(searchWrap, list, empty);
      select.tabIndex = -1;
      select.setAttribute("aria-hidden", "true");
      select.insertAdjacentElement("afterend", trigger);
      field.appendChild(panel);

      let items = [];
      let activeIndex = -1;

      function setActive(nextIndex) {
        activeIndex = nextIndex;
        items.forEach((item, i) => item.classList.toggle("is-active", i === nextIndex));
        const active = items[nextIndex];
        if (active) {
          search.setAttribute("aria-activedescendant", active.id);
          active.scrollIntoView({ block: "nearest" });
        } else {
          search.removeAttribute("aria-activedescendant");
        }
      }

      function render() {
        const query = search.value.trim().toLowerCase();
        list.innerHTML = "";
        items = [];

        Array.from(select.options).forEach((option) => {
          if (!option.value || option.disabled || option.hidden) return;
          const text = option.textContent.trim();
          if (query && !text.toLowerCase().includes(query)) return;

          const item = document.createElement("li");
          const selected = option.value === select.value;
          item.className = "register-combo-option";
          item.id = `${uid}Option${items.length}`;
          item.setAttribute("role", "option");
          item.setAttribute("aria-selected", String(selected));
          item.classList.toggle("is-selected", selected);
          item.dataset.value = option.value;
          item.textContent = text;
          list.appendChild(item);
          items.push(item);
        });

        empty.hidden = items.length > 0;
        const selectedIndex = items.findIndex((item) => item.classList.contains("is-selected"));
        setActive(selectedIndex >= 0 ? selectedIndex : items.length ? 0 : -1);
      }

      function sync() {
        const hasValue = Boolean(select.value);
        const parent = select.dataset.dependsOn && document.getElementById(select.dataset.dependsOn);
        const parentLabel = parent && form.querySelector(`label[for="${parent.id}"]`);

        if (hasValue) {
          trigger.textContent = select.selectedOptions[0]?.textContent.trim() || "";
        } else if (select.disabled && parentLabel) {
          trigger.textContent = `Select ${parentLabel.textContent.trim().toLowerCase()} first`;
        } else {
          trigger.textContent = placeholder;
        }

        trigger.classList.toggle("has-value", hasValue);
        trigger.disabled = select.disabled;
        field.classList.toggle("is-disabled", select.disabled);
      }

      function isOpen() {
        return !panel.hidden;
      }

      function open() {
        if (select.disabled || isOpen()) return;
        closeAll(combo);
        search.value = "";
        render();
        panel.hidden = false;
        field.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        search.focus();
        panel.scrollIntoView({ block: "nearest" });
      }

      function close(restoreFocus) {
        if (!isOpen()) return;
        panel.hidden = true;
        field.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
        if (restoreFocus) trigger.focus();
      }

      function choose(value) {
        if (select.value !== value) {
          select.value = value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
        close(true);
      }

      field.addEventListener("mousedown", (e) => {
        if (e.target !== search) e.preventDefault();
      });

      field.addEventListener("click", (e) => {
        if (panel.contains(e.target)) {
          const item = e.target.closest(".register-combo-option");
          if (item) choose(item.dataset.value);
          return;
        }
        if (e.target.closest("label")) e.preventDefault();
        if (isOpen()) close(true);
        else open();
      });

      field.addEventListener("focusout", (e) => {
        if (!field.contains(e.relatedTarget)) close(false);
      });

      trigger.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          open();
        }
      });

      search.addEventListener("input", render);

      search.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          if (!items.length) return;
          const step = e.key === "ArrowDown" ? 1 : -1;
          setActive((activeIndex + step + items.length) % items.length);
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (items[activeIndex]) choose(items[activeIndex].dataset.value);
        } else if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          escapeHandled = true;
          window.setTimeout(() => {
            escapeHandled = false;
          }, 0);
          close(true);
        } else if (e.key === "Tab") {
          close(false);
        }
      });

      select.addEventListener("change", sync);

      const combo = { select, sync, close, isOpen, filter: null };
      combos.push(combo);
    });

    combos.forEach((child) => {
      const parent = child.select.dataset.dependsOn && document.getElementById(child.select.dataset.dependsOn);
      if (!parent) {
        child.sync();
        return;
      }

      child.filter = () => {
        const parentValue = parent.value;
        Array.from(child.select.options).forEach((option) => {
          if (!option.value) return;
          const match = Boolean(parentValue) && option.dataset.parent === parentValue;
          option.hidden = !match;
          option.disabled = !match;
        });

        let reset = false;
        if (child.select.value && child.select.selectedOptions[0]?.disabled) {
          child.select.value = "";
          reset = true;
        }

        child.select.disabled = !parentValue;
        if (!parentValue) child.close(false);
        child.sync();
        if (reset) child.select.dispatchEvent(new Event("change", { bubbles: true }));
      };

      parent.addEventListener("change", child.filter);
      child.filter();
    });

    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        combos.forEach((combo) => (combo.filter ? combo.filter() : combo.sync()));
      }, 0);
    });

    const dialog = form.closest("dialog");
    dialog?.addEventListener("cancel", (e) => {
      const openCombo = combos.find((combo) => combo.isOpen());
      if (escapeHandled || openCombo) {
        e.preventDefault();
        openCombo?.close(true);
      }
    });
    dialog?.addEventListener("close", () => closeAll());
  }

  const registerFormEl = document.getElementById("registerForm");
  if (registerFormEl) setupRegisterCombos(registerFormEl);

  /* ---------- Inline phone / email OTP verification (register form) ---------- */
  function setupRegisterContactVerification(options) {
    const {
      type,
      field,
      input,
      verifyBtn,
      verifiedBadge,
      otpPanel,
      otpInput,
      confirmBtn,
      demoEl,
      msgEl,
      validate,
      sentLabel,
    } = options;

    if (!field || !input || !verifyBtn || !otpPanel || !otpInput || !confirmBtn) return;

    let pendingCode = "";
    let verifiedValue = "";

    function setMsg(text, kind) {
      if (!msgEl) return;
      if (!text) {
        msgEl.hidden = true;
        msgEl.textContent = "";
        msgEl.classList.remove("is-error", "is-success");
        return;
      }
      msgEl.hidden = false;
      msgEl.textContent = text;
      msgEl.classList.toggle("is-error", kind === "error");
      msgEl.classList.toggle("is-success", kind === "success");
    }

    function showVerifyBtn() {
      if (field.dataset.verified === "true") return;
      verifyBtn.hidden = false;
    }

    function markVerified() {
      field.dataset.verified = "true";
      verifyBtn.hidden = true;
      if (verifiedBadge) verifiedBadge.hidden = false;
      otpPanel.hidden = true;
      otpInput.value = "";
      if (demoEl) demoEl.hidden = true;
      setMsg("", "");
      input.readOnly = true;
    }

    function resetVerification() {
      field.dataset.verified = "false";
      pendingCode = "";
      verifiedValue = "";
      input.readOnly = false;
      if (verifiedBadge) verifiedBadge.hidden = true;
      otpPanel.hidden = true;
      otpInput.value = "";
      if (demoEl) {
        demoEl.hidden = true;
        demoEl.textContent = "";
      }
      setMsg("", "");
      verifyBtn.hidden = true;
      verifyBtn.disabled = false;
      verifyBtn.textContent = "Verify";
    }

    field.addEventListener("click", showVerifyBtn);
    field.addEventListener("focusin", showVerifyBtn);

    verifyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const value = input.value.trim();
      const error = validate(value);
      if (error) {
        input.setCustomValidity(error);
        input.reportValidity();
        input.focus();
        return;
      }
      input.setCustomValidity("");

      pendingCode = generateOtp();
      verifiedValue = value;
      otpPanel.hidden = false;
      otpInput.value = "";
      setMsg("", "");
      if (demoEl) {
        demoEl.hidden = false;
        demoEl.innerHTML = `${sentLabel} <strong>${pendingCode}</strong>`;
      }
      verifyBtn.textContent = "Resend";
      window.requestAnimationFrame(() => otpInput.focus());
    });

    input.addEventListener("input", () => {
      input.setCustomValidity("");
      if (field.dataset.verified === "true" && input.value.trim() !== verifiedValue) {
        resetVerification();
        showVerifyBtn();
      }
    });

    confirmBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const entered = otpInput.value.replace(/\D/g, "");
      if (entered.length !== 6) {
        setMsg("Enter the complete 6-digit OTP.", "error");
        otpInput.focus();
        return;
      }
      if (entered !== pendingCode) {
        setMsg("Incorrect OTP. Please try again.", "error");
        otpInput.focus();
        return;
      }
      setMsg(`${type === "phone" ? "Phone number" : "Email"} verified successfully.`, "success");
      markVerified();
    });

    otpInput.addEventListener("input", () => {
      otpInput.value = otpInput.value.replace(/\D/g, "").slice(0, 6);
      setMsg("", "");
    });

    otpInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        confirmBtn.click();
      }
    });
  }

  setupRegisterContactVerification({
    type: "phone",
    field: document.getElementById("registerPhoneField"),
    input: document.getElementById("registerPhone"),
    verifyBtn: document.getElementById("registerPhoneVerifyBtn"),
    verifiedBadge: document.getElementById("registerPhoneVerified"),
    otpPanel: document.getElementById("registerPhoneOtpPanel"),
    otpInput: document.getElementById("registerPhoneOtpInput"),
    confirmBtn: document.getElementById("registerPhoneOtpConfirm"),
    demoEl: document.getElementById("registerPhoneOtpDemo"),
    msgEl: document.getElementById("registerPhoneOtpMsg"),
    sentLabel: "Demo OTP sent to your phone:",
    validate(value) {
      const digits = normalizePhone(value);
      if (digits.length < 10) return "Enter a valid phone number (at least 10 digits).";
      return "";
    },
  });

  setupRegisterContactVerification({
    type: "email",
    field: document.getElementById("registerEmailField"),
    input: document.getElementById("registerEmail"),
    verifyBtn: document.getElementById("registerEmailVerifyBtn"),
    verifiedBadge: document.getElementById("registerEmailVerified"),
    otpPanel: document.getElementById("registerEmailOtpPanel"),
    otpInput: document.getElementById("registerEmailOtpInput"),
    confirmBtn: document.getElementById("registerEmailOtpConfirm"),
    demoEl: document.getElementById("registerEmailOtpDemo"),
    msgEl: document.getElementById("registerEmailOtpMsg"),
    sentLabel: "Demo OTP sent to your email:",
    validate(value) {
      if (!value) return "Enter an email address to verify.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address.";
      return "";
    },
  });

  document.getElementById("otpForm")?.addEventListener("submit", verifyOtp);
  document.getElementById("resetPasswordForm")?.addEventListener("submit", saveNewPassword);

  document.getElementById("otpResend")?.addEventListener("click", () => {
    const stored = readStoredOtp();
    const phone = stored?.phone || resolveResetPhone();
    if (!normalizePhone(phone)) return;
    sendOtp(phone);
    setOtpMessage("success", "A new OTP has been sent to your registered mobile number.");
    otpInputs()[0]?.focus();
  });

  const otpBoxList = otpInputs();
  otpBoxList.forEach((input, index) => {
    input.addEventListener("input", () => {
      const digit = input.value.replace(/\D/g, "").slice(-1);
      input.value = digit;
      setOtpMessage("", "");
      if (digit && otpBoxList[index + 1]) otpBoxList[index + 1].focus();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && otpBoxList[index - 1]) {
        otpBoxList[index - 1].focus();
      }
    });

    input.addEventListener("paste", (e) => {
      const pasted = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, 6);
      if (!pasted) return;
      e.preventDefault();
      otpBoxList.forEach((box, i) => {
        box.value = pasted[i] || "";
      });
      otpBoxList[Math.min(pasted.length, otpBoxList.length) - 1]?.focus();
    });
  });

  if (window.location.hash === "#login") openLogin();
  if (window.location.hash === "#register") openRegister();
  if (window.location.hash === "#forgot-password") openOtp();
})();
