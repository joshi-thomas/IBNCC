      document.addEventListener("DOMContentLoaded", function () {
        // 1. Toast Notification Helper
        function showToast(msg, isSuccess = true) {
          const toast = document.getElementById("payToast");
          const msgEl = document.getElementById("payToastMsg");
          const icon = toast ? toast.querySelector("i") : null;
          if (!toast || !msgEl) return;

          msgEl.textContent = msg;
          if (icon) {
            icon.className = isSuccess
              ? "fa-solid fa-circle-check"
              : "fa-solid fa-circle-exclamation";
          }
          toast.classList.add("show");
          setTimeout(() => toast.classList.remove("show"), 3200);
        }

        // 2. Setup Address Selection Dialogs
        function setupAddressDialog(config) {
          const dialog = document.getElementById(config.dialogId);
          const openBtn = document.getElementById(config.openBtnId);
          const closeBtn = document.getElementById(config.closeBtnId);
          const cancelBtn = document.getElementById(config.cancelBtnId);
          const cancelIcon = document.getElementById(config.cancelIconId);
          const listContainer = document.getElementById(config.listId);
          const form = document.getElementById(config.formId);
          const emptyEl = config.emptyId
            ? document.getElementById(config.emptyId)
            : null;
          const detailsEl = config.detailsId
            ? document.getElementById(config.detailsId)
            : null;
          const clearBtn = config.clearBtnId
            ? document.getElementById(config.clearBtnId)
            : null;

          if (!dialog) return;

          function showFilledAddress() {
            if (!config.optional) return;
            if (emptyEl) emptyEl.hidden = true;
            if (detailsEl) detailsEl.hidden = false;
            if (openBtn) openBtn.textContent = "Change";
          }

          function showEmptyAddress() {
            if (!config.optional) return;
            if (emptyEl) emptyEl.hidden = false;
            if (detailsEl) detailsEl.hidden = true;
            if (openBtn) openBtn.textContent = "Add";
            const nameEl = document.getElementById(config.targetNameId);
            const streetEl = document.getElementById(config.targetStreetId);
            const cityEl = document.getElementById(config.targetCityStateId);
            const phoneEl = document.getElementById(config.targetPhoneId);
            if (nameEl) nameEl.textContent = "";
            if (streetEl) streetEl.textContent = "";
            if (cityEl) cityEl.textContent = "";
            if (phoneEl) phoneEl.textContent = "";
            if (listContainer) {
              listContainer
                .querySelectorAll(".addr-select-card")
                .forEach((c) => c.classList.remove("is-selected"));
            }
          }

          function applyAddress(name, street, citystate, phone) {
            document.getElementById(config.targetNameId).textContent = name;
            document.getElementById(config.targetStreetId).textContent = street;
            document.getElementById(config.targetCityStateId).textContent =
              citystate;
            document.getElementById(config.targetPhoneId).textContent =
              phone.startsWith("Phone:") ? phone : "Phone: " + phone;
            showFilledAddress();
          }

          // Open Dialog
          if (openBtn) {
            openBtn.addEventListener("click", function () {
              dialog.showModal();
            });
          }

          // Close Dialog Helpers
          function closeDialog() {
            dialog.close();
          }

          if (closeBtn) closeBtn.addEventListener("click", closeDialog);
          if (cancelBtn) cancelBtn.addEventListener("click", closeDialog);
          if (cancelIcon) cancelIcon.addEventListener("click", closeDialog);

          if (clearBtn) {
            clearBtn.addEventListener("click", function () {
              showEmptyAddress();
              showToast(
                config.label + " removed. You can continue without one.",
              );
            });
          }

          // Click on Existing Address Options
          if (listContainer) {
            listContainer.addEventListener("click", function (e) {
              const card = e.target.closest(".addr-select-card");
              if (!card) return;

              // Highlight selection
              listContainer
                .querySelectorAll(".addr-select-card")
                .forEach((c) => c.classList.remove("is-selected"));
              card.classList.add("is-selected");

              // Extract info
              const name = card.getAttribute("data-name");
              const street = card.getAttribute("data-street");
              const citystate = card.getAttribute("data-citystate");
              const phone = card.getAttribute("data-phone");

              applyAddress(name, street, citystate, phone);

              showToast(config.label + " selected successfully!");
              setTimeout(closeDialog, 250);
            });
          }

          // Add New Address Form Submit
          if (form) {
            form.addEventListener("submit", function (e) {
              e.preventDefault();

              const firstName = document
                .getElementById(config.inputFirstNameId)
                .value.trim();
              const lastName = document
                .getElementById(config.inputLastNameId)
                .value.trim();
              const fullName = firstName + " " + lastName;
              const phone = document
                .getElementById(config.inputPhoneId)
                .value.trim();
              const street = document
                .getElementById(config.inputStreetId)
                .value.trim();
              const pin = document
                .getElementById(config.inputPinId)
                .value.trim();
              const city = document
                .getElementById(config.inputCityId)
                .value.trim();
              const state = document
                .getElementById(config.inputStateId)
                .value.trim();

              const cityStateStr = city + ", " + state + " " + pin;

              // Create new address card in list
              const newCard = document.createElement("div");
              newCard.className = "addr-select-card is-selected";
              newCard.setAttribute("data-name", fullName);
              newCard.setAttribute("data-street", street);
              newCard.setAttribute("data-citystate", cityStateStr);
              newCard.setAttribute("data-phone", phone);

              newCard.innerHTML = `
              <div class="addr-radio-outer">
                <div class="addr-radio-inner"></div>
              </div>
              <div class="addr-card-content">
                <p class="addr-card-name">${fullName}</p>
                <p class="addr-card-line">${street}</p>
                <p class="addr-card-line">${cityStateStr}</p>
                <p class="addr-card-phone">Phone: ${phone}</p>
              </div>
            `;

              // Unselect others and prepend new card
              listContainer
                .querySelectorAll(".addr-select-card")
                .forEach((c) => c.classList.remove("is-selected"));
              listContainer.prepend(newCard);

              applyAddress(fullName, street, cityStateStr, phone);

              form.reset();
              showToast(
                "New " + config.label.toLowerCase() + " saved and selected!",
              );
              closeDialog();
            });
          }
        }

        // Initialize Delivery Address Dialog
        setupAddressDialog({
          label: "Delivery Address",
          dialogId: "deliveryAddressDialog",
          openBtnId: "btnChangeDeliveryAddr",
          closeBtnId: "deliveryDialogClose",
          cancelBtnId: "deliveryDialogCancelBtn",
          cancelIconId: "deliveryAddCancelIcon",
          listId: "deliveryAddressList",
          formId: "deliveryNewAddrForm",
          targetNameId: "delivName",
          targetStreetId: "delivStreet",
          targetCityStateId: "delivCityState",
          targetPhoneId: "delivPhone",
          inputFirstNameId: "delivFirstName",
          inputLastNameId: "delivLastName",
          inputPhoneId: "delivNewPhone",
          inputStreetId: "delivNewStreet",
          inputAreaId: "delivNewArea",
          inputPinId: "delivNewPin",
          inputCityId: "delivNewCity",
          inputStateId: "delivNewState",
        });

        // Initialize Shipping Address Dialog (optional — checkout may proceed without it)
        setupAddressDialog({
          label: "Shipping Address",
          dialogId: "shippingAddressDialog",
          openBtnId: "btnChangeShippingAddr",
          closeBtnId: "shippingDialogClose",
          cancelBtnId: "shippingDialogCancelBtn",
          cancelIconId: "shippingAddCancelIcon",
          listId: "shippingAddressList",
          formId: "shippingNewAddrForm",
          targetNameId: "shipName",
          targetStreetId: "shipStreet",
          targetCityStateId: "shipCityState",
          targetPhoneId: "shipPhone",
          inputFirstNameId: "shipFirstName",
          inputLastNameId: "shipLastName",
          inputPhoneId: "shipNewPhone",
          inputStreetId: "shipNewStreet",
          inputAreaId: "shipNewArea",
          inputPinId: "shipNewPin",
          inputCityId: "shipNewCity",
          inputStateId: "shipNewState",
          optional: true,
          emptyId: "shippingAddressEmpty",
          detailsId: "shippingAddressDetails",
          clearBtnId: "btnClearShippingAddr",
        });

        // 3. Payment Method Radio Selection Styling
        const payOptionItems = document.querySelectorAll(".pay-option-item");
        payOptionItems.forEach((item) => {
          item.addEventListener("click", function () {
            payOptionItems.forEach((i) => i.classList.remove("is-selected"));
            this.classList.add("is-selected");
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
          });
        });

        // 4. Send Inquiry → Guest mobile verification popup
        const payBtn = document.getElementById("btnPayNow");
        const guestDialog = document.getElementById("guestVerifyDialog");
        const guestCloseBtn = document.getElementById("guestVerifyDialogClose");
        const guestMobileInput = document.getElementById("guestMobileInput");
        const guestVerifyBtn = document.getElementById("guestVerifyBtn");
        const guestVerifyMsg = document.getElementById("guestVerifyMsg");
        const guestOtpPanel = document.getElementById("guestOtpPanel");
        const guestOtpInput = document.getElementById("guestOtpInput");
        const guestOtpSubmit = document.getElementById("guestOtpSubmit");
        const guestOtpDemo = document.getElementById("guestOtpDemo");
        const guestOtpHint = document.getElementById("guestOtpHint");
        let guestPendingOtp = "";

        function normalizeGuestPhone(value) {
          return String(value || "").replace(/\D/g, "");
        }

        function setGuestMsg(text, type) {
          if (!guestVerifyMsg) return;
          if (!text) {
            guestVerifyMsg.hidden = true;
            guestVerifyMsg.textContent = "";
            guestVerifyMsg.classList.remove("is-error", "is-success");
            return;
          }
          guestVerifyMsg.hidden = false;
          guestVerifyMsg.textContent = text;
          guestVerifyMsg.classList.toggle("is-error", type === "error");
          guestVerifyMsg.classList.toggle("is-success", type === "success");
        }

        function resetGuestVerifyDialog() {
          guestPendingOtp = "";
          if (guestMobileInput) guestMobileInput.value = "";
          if (guestOtpInput) guestOtpInput.value = "";
          if (guestVerifyBtn) {
            guestVerifyBtn.hidden = true;
            guestVerifyBtn.disabled = false;
            guestVerifyBtn.textContent = "Verify";
          }
          if (guestOtpSubmit) {
            guestOtpSubmit.disabled = false;
            guestOtpSubmit.textContent = "Submit";
          }
          if (guestOtpPanel) guestOtpPanel.hidden = true;
          if (guestOtpDemo) {
            guestOtpDemo.hidden = true;
            guestOtpDemo.textContent = "";
          }
          setGuestMsg("", "");
        }

        function showGuestVerifyBtn() {
          if (guestVerifyBtn) guestVerifyBtn.hidden = false;
        }

        function isValidGuestMobile(value) {
          const digits = normalizeGuestPhone(value);
          // Accept 10-digit Indian mobiles, or 12 digits starting with 91
          if (digits.length === 10) return true;
          if (digits.length === 12 && digits.startsWith("91")) return true;
          return false;
        }

        function maskGuestMobile(value) {
          const digits = normalizeGuestPhone(value);
          const local = digits.length === 12 ? digits.slice(2) : digits;
          if (local.length < 4) return "+91 " + local;
          return "+91 " + local.slice(0, 2) + "******" + local.slice(-2);
        }

        function sendGuestOtp(mobileValue) {
          const digits = normalizeGuestPhone(mobileValue);
          const local = digits.length === 12 ? digits.slice(2) : digits;
          guestPendingOtp = String(Math.floor(100000 + Math.random() * 900000));

          if (guestOtpPanel) guestOtpPanel.hidden = false;
          if (guestOtpHint) {
            guestOtpHint.textContent =
              "Enter the 6-digit OTP sent to " + maskGuestMobile(local);
          }
          if (guestOtpDemo) {
            guestOtpDemo.hidden = false;
            guestOtpDemo.innerHTML =
              "Demo OTP sent to your mobile: <strong>" +
              guestPendingOtp +
              "</strong>";
          }
          if (guestOtpSubmit) {
            guestOtpSubmit.disabled = false;
            guestOtpSubmit.textContent = "Submit";
          }
          if (guestOtpInput) {
            guestOtpInput.value = "";
            guestOtpInput.focus();
          }
          setGuestMsg(
            "OTP sent successfully to " + maskGuestMobile(local) + ".",
            "success",
          );
          showToast("OTP sent to " + maskGuestMobile(local));
        }

        function submitGuestOtp() {
          if (!guestOtpInput) return;
          const entered = normalizeGuestPhone(guestOtpInput.value);

          if (entered.length !== 6) {
            setGuestMsg("Enter the complete 6-digit OTP.", "error");
            guestOtpInput.focus();
            return;
          }

          if (!guestPendingOtp || entered !== guestPendingOtp) {
            setGuestMsg("Incorrect OTP. Please try again.", "error");
            guestOtpInput.focus();
            return;
          }

          if (guestOtpSubmit) {
            guestOtpSubmit.disabled = true;
            guestOtpSubmit.textContent = "Submitting…";
          }

          setGuestMsg("Mobile number verified successfully.", "success");
          showToast("Inquiry submitted successfully!");

          setTimeout(function () {
            if (guestDialog) guestDialog.close();
            resetGuestVerifyDialog();
          }, 700);
        }

        if (payBtn && guestDialog) {
          payBtn.addEventListener("click", function () {
            resetGuestVerifyDialog();
            guestDialog.showModal();
            setTimeout(function () {
              if (guestMobileInput) guestMobileInput.focus();
            }, 50);
          });
        }

        if (guestCloseBtn && guestDialog) {
          guestCloseBtn.addEventListener("click", function () {
            guestDialog.close();
            resetGuestVerifyDialog();
          });
        }

        if (guestDialog) {
          guestDialog.addEventListener("click", function (e) {
            if (e.target === guestDialog) {
              guestDialog.close();
              resetGuestVerifyDialog();
            }
          });
          guestDialog.addEventListener("close", resetGuestVerifyDialog);
        }

        if (guestMobileInput) {
          guestMobileInput.addEventListener("focus", showGuestVerifyBtn);
          guestMobileInput.addEventListener("click", showGuestVerifyBtn);
          guestMobileInput.addEventListener("input", function () {
            // Keep digits and common separators lightly cleaned for display
            const digits = normalizeGuestPhone(guestMobileInput.value).slice(
              0,
              12,
            );
            guestMobileInput.value = digits;
            setGuestMsg("", "");
            if (guestOtpPanel && !guestOtpPanel.hidden) {
              guestOtpPanel.hidden = true;
              guestPendingOtp = "";
              if (guestOtpDemo) {
                guestOtpDemo.hidden = true;
                guestOtpDemo.textContent = "";
              }
              if (guestVerifyBtn) {
                guestVerifyBtn.disabled = false;
                guestVerifyBtn.textContent = "Verify";
              }
              if (guestOtpSubmit) {
                guestOtpSubmit.disabled = false;
                guestOtpSubmit.textContent = "Submit";
              }
            }
          });
        }

        if (guestVerifyBtn) {
          guestVerifyBtn.addEventListener("click", function () {
            const value = guestMobileInput ? guestMobileInput.value.trim() : "";
            if (!isValidGuestMobile(value)) {
              setGuestMsg("Enter a valid 10-digit mobile number.", "error");
              if (guestMobileInput) guestMobileInput.focus();
              return;
            }

            guestVerifyBtn.disabled = true;
            guestVerifyBtn.textContent = "Sending…";
            setGuestMsg("Sending OTP…", "success");

            setTimeout(function () {
              sendGuestOtp(value);
              guestVerifyBtn.disabled = false;
              guestVerifyBtn.textContent = "Resend";
            }, 600);
          });
        }

        if (guestOtpInput) {
          guestOtpInput.addEventListener("input", function () {
            guestOtpInput.value = normalizeGuestPhone(
              guestOtpInput.value,
            ).slice(0, 6);
            setGuestMsg("", "");
          });

          guestOtpInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
              e.preventDefault();
              submitGuestOtp();
            }
          });
        }

        if (guestOtpSubmit) {
          guestOtpSubmit.addEventListener("click", function () {
            submitGuestOtp();
          });
        }

        const guestForm = document.getElementById("guestVerifyForm");
        if (guestForm) {
          guestForm.addEventListener("submit", function (e) {
            e.preventDefault();
            if (guestOtpPanel && !guestOtpPanel.hidden) {
              submitGuestOtp();
              return;
            }
            if (guestVerifyBtn && !guestVerifyBtn.hidden)
              guestVerifyBtn.click();
          });
        }
      });
    
