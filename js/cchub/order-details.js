      document.addEventListener("DOMContentLoaded", function () {
        // Toast notification helper
        function showToast(message) {
          const toast = document.getElementById("orderToast");
          const msgEl = document.getElementById("orderToastMsg");
          if (toast && msgEl) {
            msgEl.textContent = message;
            toast.classList.add("show");
            setTimeout(() => {
              toast.classList.remove("show");
            }, 3200);
          }
        }

        // Download Invoice Action
        const downloadBtn = document.getElementById("downloadInvoiceBtn");
        if (downloadBtn) {
          downloadBtn.addEventListener("click", function () {
            showToast(
              "Generating and downloading official invoice #ORD-98241...",
            );
            setTimeout(() => {
              window.print();
            }, 1000);
          });
        }

        // Header Login Modal toggle
        const loginBtn = document.querySelector(".btn-login");
        const loginModal = document.getElementById("loginModal");
        const loginModalClose = document.getElementById("loginModalClose");

        if (loginBtn && loginModal) {
          loginBtn.addEventListener("click", function (e) {
            e.preventDefault();
            loginModal.showModal();
          });
        }

        if (loginModalClose && loginModal) {
          loginModalClose.addEventListener("click", function () {
            loginModal.close();
          });
        }

        // Category Navigation Active Toggle
        const catBtns = document.querySelectorAll(".cat-nav-btn");
        catBtns.forEach((btn) => {
          btn.addEventListener("click", function () {
            const item = this.closest(".cat-nav-item");
            const wasActive = item.classList.contains("is-active");
            document
              .querySelectorAll(".cat-nav-item")
              .forEach((i) => i.classList.remove("is-active"));
            if (!wasActive) {
              item.classList.add("is-active");
            }
          });
        });
      });
    
