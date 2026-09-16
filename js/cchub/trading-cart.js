      document.addEventListener("DOMContentLoaded", function () {
        const cartGrid = document.getElementById("cartLayoutGrid");
        const emptyState = document.getElementById("cartEmptyState");
        const cartList = document.getElementById("cartItemsList");
        const cartBadge = document.querySelector(".cart-badge");

        const subTotalEl = document.getElementById("summarySubTotal");
        const discountEl = document.getElementById("summaryDiscount");
        const giftWrapEl = document.getElementById("summaryGiftWrap");
        const taxEl = document.getElementById("summaryTax");
        const deliveryEl = document.getElementById("summaryDelivery");
        const totalEl = document.getElementById("summaryTotal");
        const youSaveEl = document.getElementById("summaryYouSave");
        const checkoutBtn = document.getElementById("btnProceedCheckout");

        const MAX_QTY = 99999;

        function formatINR(val) {
          return "₹ " + Math.round(val).toLocaleString("en-IN");
        }

        function showToast(msg, isSuccess) {
          if (typeof isSuccess === "undefined") isSuccess = true;
          const toast = document.getElementById("cartToast");
          const msgEl = document.getElementById("cartToastMsg");
          const icon = toast ? toast.querySelector("i") : null;
          if (!toast || !msgEl) return;

          msgEl.textContent = msg;
          if (icon) {
            icon.className = isSuccess
              ? "fa-solid fa-circle-check"
              : "fa-solid fa-trash-can";
          }
          toast.classList.add("show");
          setTimeout(function () {
            toast.classList.remove("show");
          }, 3000);
        }

        function getQty(card) {
          const input = card.querySelector(".cart-qty-input");
          if (!input) return 1;
          const qty = parseInt(input.value, 10);
          return Number.isFinite(qty) && qty > 0 ? qty : 1;
        }

        function setQty(card, qty) {
          const input = card.querySelector(".cart-qty-input");
          if (!input) return;
          input.value = String(qty);
        }

        function applyTier(card) {
          const qty = getQty(card);
          const tiers = Array.prototype.slice.call(
            card.querySelectorAll(".pl-tier"),
          );
          if (!tiers.length) return getQty(card);

          let active = tiers[0];
          tiers.forEach(function (tier) {
            const min = parseFloat(tier.getAttribute("data-tier-min")) || 1;
            const maxAttr = tier.getAttribute("data-tier-max");
            const max =
              maxAttr == null || maxAttr === "" ? null : parseFloat(maxAttr);
            const match = qty >= min && (max == null || qty <= max);
            tier.classList.toggle("is-active", match);
            if (match) active = tier;
          });

          const unit = parseFloat(active.getAttribute("data-tier-price")) || 0;
          const first =
            parseFloat(tiers[0].getAttribute("data-tier-price")) || unit;
          card.setAttribute("data-price", String(unit));
          card.setAttribute("data-original-price", String(first));
          return qty;
        }

        function calculateCart() {
          const cards = document.querySelectorAll(".cart-item-card");
          let totalItemsCount = 0;
          let subtotal = 0;
          let giftWrapTotal = 0;

          cards.forEach(function (card) {
            const qty = applyTier(card);
            const price = parseFloat(card.getAttribute("data-price")) || 0;
            const giftCheckbox = card.querySelector(".cart-gift-wrap-check");

            totalItemsCount += qty;
            subtotal += price * qty;

            if (giftCheckbox && giftCheckbox.checked) {
              giftWrapTotal += 50 * qty;
            }
          });

          if (cartBadge) cartBadge.textContent = totalItemsCount;

          if (cards.length === 0) {
            if (cartGrid) cartGrid.style.display = "none";
            if (emptyState) emptyState.style.display = "block";
            return;
          }

          if (cartGrid) cartGrid.style.display = "grid";
          if (emptyState) emptyState.style.display = "none";

          const productDiscount = Math.round(subtotal * 0.075);
          const taxableAmount = subtotal - productDiscount + giftWrapTotal;
          const tax = Math.round(taxableAmount * 0.03);
          const deliveryCharge = 0;
          const finalTotal = taxableAmount + tax + deliveryCharge;

          if (subTotalEl) subTotalEl.textContent = formatINR(subtotal);
          if (discountEl)
            discountEl.textContent = "- " + formatINR(productDiscount);
          if (giftWrapEl) giftWrapEl.textContent = formatINR(giftWrapTotal);
          if (taxEl) taxEl.textContent = formatINR(tax);
          if (deliveryEl)
            deliveryEl.textContent =
              deliveryCharge === 0 ? "FREE" : formatINR(deliveryCharge);
          if (totalEl) totalEl.textContent = formatINR(finalTotal);
          if (youSaveEl)
            youSaveEl.textContent = "+ " + formatINR(productDiscount);
        }

        calculateCart();

        if (cartList) {
          cartList.addEventListener("click", function (e) {
            const minusBtn = e.target.closest(".btn-qty-minus");
            const plusBtn = e.target.closest(".btn-qty-plus");
            const removeBtn = e.target.closest(".cart-item-remove");

            if (minusBtn) {
              const card = minusBtn.closest(".cart-item-card");
              let currentQty = getQty(card);
              if (currentQty > 1) {
                setQty(card, currentQty - 1);
                calculateCart();
                showToast("Quantity updated");
              } else if (
                confirm("Do you want to remove this item from your cart?")
              ) {
                const title = card
                  .querySelector(".cart-item-title")
                  .textContent.trim();
                card.classList.add("is-removing");
                setTimeout(function () {
                  card.remove();
                  calculateCart();
                  showToast(title + " removed from cart", false);
                }, 300);
              }
            } else if (plusBtn) {
              const card = plusBtn.closest(".cart-item-card");
              let currentQty = getQty(card);
              if (currentQty < MAX_QTY) {
                setQty(card, currentQty + 1);
                calculateCart();
                showToast("Quantity updated");
              } else {
                alert("Maximum quantity reached for this item.");
              }
            } else if (removeBtn) {
              const card = removeBtn.closest(".cart-item-card");
              const title = card
                .querySelector(".cart-item-title")
                .textContent.trim();
              card.classList.add("is-removing");
              setTimeout(function () {
                card.remove();
                calculateCart();
                showToast(title + " removed from cart", false);
              }, 300);
            }
          });

          cartList.addEventListener("change", function (e) {
            if (e.target.classList.contains("cart-gift-wrap-check")) {
              calculateCart();
            }
          });

          cartList.addEventListener("input", function (e) {
            const input = e.target.closest(".cart-qty-input");
            if (!input) return;
            const card = input.closest(".cart-item-card");
            let qty = parseInt(input.value, 10);
            if (!Number.isFinite(qty) || qty < 1) qty = 1;
            if (qty > MAX_QTY) qty = MAX_QTY;
            input.value = String(qty);
            calculateCart();
          });

          cartList.addEventListener(
            "blur",
            function (e) {
              const input = e.target.closest(".cart-qty-input");
              if (!input) return;
              let qty = parseInt(input.value, 10);
              if (!Number.isFinite(qty) || qty < 1) {
                input.value = "1";
                calculateCart();
              }
            },
            true,
          );
        }

        // Start Your Inquiry → payment page
        if (checkoutBtn) {
          checkoutBtn.addEventListener("click", function () {
            const cards = document.querySelectorAll(".cart-item-card");
            if (cards.length === 0) {
              alert(
                "Your cart is empty. Please add products before starting an inquiry.",
              );
              return;
            }
            showToast("Starting your inquiry...");
            setTimeout(function () {
              window.location.href = "payment.html";
            }, 600);
          });
        }
      });
    
