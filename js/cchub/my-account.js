      document.addEventListener("DOMContentLoaded", function () {
        // 1. Tab Navigation Elements
        const navBtns = document.querySelectorAll(
          ".account-nav-item[data-tab]",
        );
        const panels = document.querySelectorAll(".account-tab-panel");
        const titleEl = document.getElementById("accountHeading");

        function showToast(msg) {
          const toast = document.getElementById("accountToast");
          const msgEl = document.getElementById("accountToastMsg");
          if (!toast || !msgEl) return;
          msgEl.textContent = msg;
          toast.classList.add("show");
          setTimeout(() => toast.classList.remove("show"), 3200);
        }

        function switchTab(tabId) {
          let activeBtn = null;
          navBtns.forEach((btn) => {
            const isTarget = btn.getAttribute("data-tab") === tabId;
            btn.classList.toggle("is-active", isTarget);
            btn.setAttribute("aria-selected", isTarget ? "true" : "false");
            if (isTarget) activeBtn = btn;
          });

          panels.forEach((panel) => {
            const isTarget = panel.id === "panel-" + tabId;
            if (isTarget) {
              panel.removeAttribute("hidden");
              panel.classList.add("is-active");
            } else {
              panel.setAttribute("hidden", "");
              panel.classList.remove("is-active");
            }
          });

          if (activeBtn && titleEl) {
            titleEl.textContent =
              activeBtn.getAttribute("data-title") || "MY ACCOUNT";
          }

          // Update URL hash without scrolling
          if (history.replaceState) {
            history.replaceState(null, null, "#" + tabId);
          }
        }

        navBtns.forEach((btn) => {
          btn.addEventListener("click", function () {
            const tabId = this.getAttribute("data-tab");
            if (tabId) switchTab(tabId);
          });
        });

        // Handle initial hash routing
        const hash = window.location.hash.replace("#", "").toLowerCase();
        if (["personal", "orders", "address", "contact"].includes(hash)) {
          switchTab(hash);
        }

        // 2. Order History Filter Tabs
        const orderFilters = document.querySelectorAll(".order-filter-btn");
        const orderCards = document.querySelectorAll(".order-card");

        orderFilters.forEach((filterBtn) => {
          filterBtn.addEventListener("click", function () {
            orderFilters.forEach((b) => b.classList.remove("is-active"));
            this.classList.add("is-active");

            const filter = this.getAttribute("data-filter");
            orderCards.forEach((card) => {
              const status = card.getAttribute("data-status");
              if (filter === "all" || status === filter) {
                card.style.display = "";
              } else {
                card.style.display = "none";
              }
            });
          });
        });

        // 3. Edit Personal Info Dialog
        const editProfileDialog = document.getElementById("editProfileDialog");
        const btnEditDetails = document.getElementById("btnEditDetails");
        const btnAddDob = document.getElementById("btnAddDob");
        const editProfileClose = document.getElementById("editProfileClose");
        const editProfileCancel = document.getElementById("editProfileCancel");
        const editProfileForm = document.getElementById("editProfileForm");

        function openProfileDialog() {
          if (!editProfileDialog) return;
          document.getElementById("inputName").value = document
            .getElementById("profileName")
            .textContent.trim();
          document.getElementById("inputPhone").value = document
            .getElementById("profilePhone")
            .textContent.trim();
          document.getElementById("inputEmail").value = document
            .getElementById("profileEmail")
            .textContent.trim();
          const dobText = document
            .getElementById("profileDob")
            .textContent.trim();
          if (dobText !== "Not added yet") {
            document.getElementById("inputDob").value = dobText;
          }
          editProfileDialog.showModal();
        }

        if (btnEditDetails)
          btnEditDetails.addEventListener("click", openProfileDialog);
        if (btnAddDob) btnAddDob.addEventListener("click", openProfileDialog);

        if (editProfileClose)
          editProfileClose.addEventListener("click", () =>
            editProfileDialog.close(),
          );
        if (editProfileCancel)
          editProfileCancel.addEventListener("click", () =>
            editProfileDialog.close(),
          );

        if (editProfileForm) {
          editProfileForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const name = document.getElementById("inputName").value;
            const phone = document.getElementById("inputPhone").value;
            const email = document.getElementById("inputEmail").value;
            const dob = document.getElementById("inputDob").value;

            document.getElementById("profileName").textContent = name;
            document.getElementById("profilePhone").textContent = phone;
            document.getElementById("profileEmail").textContent = email;
            if (dob) {
              document.getElementById("profileDob").textContent = dob;
              if (btnAddDob) btnAddDob.textContent = "Change Date of Birth";
            }
            editProfileDialog.close();
            showToast("Personal details updated successfully!");
          });
        }

        // 4. Address Book Dialog & Actions
        const addressDialog = document.getElementById("addressDialog");
        const btnAddAddressBtn = document.getElementById("btnAddAddressBtn");
        const addressDialogClose =
          document.getElementById("addressDialogClose");
        const addressDialogCancel = document.getElementById(
          "addressDialogCancel",
        );
        const addressForm = document.getElementById("addressForm");
        const addressGrid = document.getElementById("addressGrid");

        if (btnAddAddressBtn) {
          btnAddAddressBtn.addEventListener("click", function () {
            document.getElementById("addressDialogTitle").textContent =
              "Add New Address";
            document.getElementById("addressEditId").value = "";
            addressForm.reset();
            addressDialog.showModal();
          });
        }

        if (addressDialogClose)
          addressDialogClose.addEventListener("click", () =>
            addressDialog.close(),
          );
        if (addressDialogCancel)
          addressDialogCancel.addEventListener("click", () =>
            addressDialog.close(),
          );

        if (addressGrid) {
          addressGrid.addEventListener("click", function (e) {
            const editBtn = e.target.closest(".address-btn--edit");
            const delBtn = e.target.closest(".address-btn--delete");

            if (delBtn) {
              const card = delBtn.closest(".address-card");
              if (
                card &&
                confirm("Are you sure you want to delete this address?")
              ) {
                card.remove();
                showToast("Address deleted successfully.");
              }
            } else if (editBtn) {
              const card = editBtn.closest(".address-card");
              if (card) {
                const addrId = card.getAttribute("data-address-id");
                const label = card
                  .querySelector(".address-label-name")
                  .textContent.trim();
                const name = card
                  .querySelector(".address-user-name")
                  .textContent.trim();
                const lines = card.querySelectorAll(".address-line");
                const phoneText = card
                  .querySelector(".address-phone")
                  .textContent.replace("Phone:", "")
                  .trim();

                document.getElementById("addressDialogTitle").textContent =
                  "Edit Address";
                document.getElementById("addressEditId").value = addrId;
                document.getElementById("addrLabel").value = label;
                document.getElementById("addrName").value = name;
                if (lines[0])
                  document.getElementById("addrStreet").value =
                    lines[0].textContent.trim();
                if (lines[1]) {
                  const parts = lines[1].textContent.split(",");
                  document.getElementById("addrCity").value = parts[0]
                    ? parts[0].trim()
                    : "";
                  if (parts[1]) {
                    const statePin = parts[1].split("-");
                    document.getElementById("addrState").value = statePin[0]
                      ? statePin[0].trim()
                      : "";
                    document.getElementById("addrPincode").value = statePin[1]
                      ? statePin[1].trim()
                      : "";
                  }
                }
                document.getElementById("addrPhone").value = phoneText;
                addressDialog.showModal();
              }
            }
          });
        }

        if (addressForm) {
          addressForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const editId = document.getElementById("addressEditId").value;
            const label = document.getElementById("addrLabel").value.trim();
            const name = document.getElementById("addrName").value.trim();
            const street = document.getElementById("addrStreet").value.trim();
            const city = document.getElementById("addrCity").value.trim();
            const state = document.getElementById("addrState").value.trim();
            const pin = document.getElementById("addrPincode").value.trim();
            const phone = document.getElementById("addrPhone").value.trim();

            if (editId) {
              const existingCard = document.querySelector(
                '.address-card[data-address-id="' + editId + '"]',
              );
              if (existingCard) {
                existingCard.querySelector(".address-label-name").textContent =
                  label;
                existingCard.querySelector(".address-user-name").textContent =
                  name;
                const lines = existingCard.querySelectorAll(".address-line");
                if (lines[0]) lines[0].textContent = street;
                if (lines[1])
                  lines[1].textContent =
                    city + ", " + state.toUpperCase() + " - " + pin;
                existingCard.querySelector(".address-phone").textContent =
                  "Phone: " + phone;
                showToast("Address updated successfully!");
              }
            } else {
              const newId = "addr-" + Date.now();
              const newCard = document.createElement("div");
              newCard.className = "address-card";
              newCard.setAttribute("data-address-id", newId);
              newCard.innerHTML = `
              <div class="address-card-header">
                <span class="address-pin-icon"><i class="fa-solid fa-location-dot"></i></span>
                <strong class="address-label-name">${label}</strong>
              </div>
              <div class="address-card-body">
                <p class="address-user-name">${name}</p>
                <p class="address-line">${street}</p>
                <p class="address-line">${city}, ${state.toUpperCase()} - ${pin}</p>
                <p class="address-phone">Phone: ${phone}</p>
              </div>
              <div class="address-card-actions">
                <button type="button" class="address-btn address-btn--edit" data-action="edit">Edit</button>
                <button type="button" class="address-btn address-btn--delete" data-action="delete">Delete</button>
              </div>
            `;
              addressGrid.appendChild(newCard);
              showToast("New address added successfully!");
            }
            addressDialog.close();
          });
        }

        // 5. Contact Form Submission
        const contactForm = document.getElementById("accountContactForm");
        if (contactForm) {
          contactForm.addEventListener("submit", function (e) {
            e.preventDefault();
            contactForm.reset();
            showToast("Thank you! Your message has been sent to support.");
          });
        }

        // 6. Logout Button
        const logoutBtn = document.getElementById("accountLogoutBtn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            if (
              confirm(
                "Are you sure you want to log out of your CC Hub account?",
              )
            ) {
              showToast("Logging out...");
              setTimeout(() => {
                window.location.href = "ch-trading.html";
              }, 1000);
            }
          });
        }

        // 7. Order Arrow Buttons - Navigate to Order Details
        const orderArrowBtns = document.querySelectorAll(".order-arrow-btn");
        orderArrowBtns.forEach((btn) => {
          btn.addEventListener("click", function (e) {
            e.preventDefault();
            window.location.href = "order-details.html";
          });
        });
      });
    
