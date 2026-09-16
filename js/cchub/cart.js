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

        function formatINR(val) {
          return "₹ " + Math.round(val).toLocaleString("en-IN");
        }

        function showToast(msg, isSuccess = true) {
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
          setTimeout(() => toast.classList.remove("show"), 3000);
        }

        function calculateCart() {
          const cards = document.querySelectorAll(".cart-item-card");
          let totalItemsCount = 0;
          let subtotal = 0;
          let totalOriginal = 0;
          let giftWrapTotal = 0;

          cards.forEach((card) => {
            const qty =
              parseInt(
                card.querySelector(".cart-qty-number").textContent.trim(),
                10,
              ) || 1;
            const price = parseFloat(card.getAttribute("data-price")) || 0;
            const origPrice =
              parseFloat(card.getAttribute("data-original-price")) || price;
            const giftCheckbox = card.querySelector(".cart-gift-wrap-check");

            totalItemsCount += qty;
            subtotal += price * qty;
            totalOriginal += origPrice * qty;

            if (giftCheckbox && giftCheckbox.checked) {
              giftWrapTotal += 50 * qty;
            }
          });

          // Update header badge
          if (cartBadge) {
            cartBadge.textContent = totalItemsCount;
          }

          if (cards.length === 0) {
            if (cartGrid) cartGrid.style.display = "none";
            if (emptyState) emptyState.style.display = "block";
            return;
          } else {
            if (cartGrid) cartGrid.style.display = "grid";
            if (emptyState) emptyState.style.display = "none";
          }

          // Calculations matching the reference summary proportions:
          // Discount is approx 7.5% or difference
          const productDiscount = Math.round(subtotal * 0.075);
          const taxableAmount = subtotal - productDiscount + giftWrapTotal;
          const tax = Math.round(taxableAmount * 0.03); // 3% GST on jewelry
          const deliveryCharge = 0; // Free delivery
          const finalTotal = taxableAmount + tax + deliveryCharge;
          const youSave = productDiscount;

          // Render values
          if (subTotalEl) subTotalEl.textContent = formatINR(subtotal);
          if (discountEl)
            discountEl.textContent = "- " + formatINR(productDiscount);
          if (giftWrapEl) giftWrapEl.textContent = formatINR(giftWrapTotal);
          if (taxEl) taxEl.textContent = formatINR(tax);
          if (deliveryEl)
            deliveryEl.textContent =
              deliveryCharge === 0 ? "FREE" : formatINR(deliveryCharge);
          if (totalEl) totalEl.textContent = formatINR(finalTotal);
          if (youSaveEl) youSaveEl.textContent = "+ " + formatINR(youSave);
        }

        // Initial Calculation
        calculateCart();

        // Event Delegation on Cart items list
        if (cartList) {
          cartList.addEventListener("click", function (e) {
            const minusBtn = e.target.closest(".btn-qty-minus");
            const plusBtn = e.target.closest(".btn-qty-plus");
            const removeBtn = e.target.closest(".cart-item-remove");

            if (minusBtn) {
              const card = minusBtn.closest(".cart-item-card");
              const qtyNum = card.querySelector(".cart-qty-number");
              let currentQty = parseInt(qtyNum.textContent.trim(), 10) || 1;
              if (currentQty > 1) {
                currentQty -= 1;
                qtyNum.textContent = currentQty;
                calculateCart();
                showToast("Quantity updated");
              } else {
                // Confirm remove
                if (
                  confirm("Do you want to remove this item from your cart?")
                ) {
                  const title = card
                    .querySelector(".cart-item-title")
                    .textContent.trim();
                  card.classList.add("is-removing");
                  setTimeout(() => {
                    card.remove();
                    calculateCart();
                    showToast(title + " removed from cart", false);
                  }, 300);
                }
              }
            } else if (plusBtn) {
              const card = plusBtn.closest(".cart-item-card");
              const qtyNum = card.querySelector(".cart-qty-number");
              let currentQty = parseInt(qtyNum.textContent.trim(), 10) || 1;
              if (currentQty < 20) {
                currentQty += 1;
                qtyNum.textContent = currentQty;
                calculateCart();
                showToast("Quantity updated");
              } else {
                alert("Maximum limit of 20 units reached for this item.");
              }
            } else if (removeBtn) {
              const card = removeBtn.closest(".cart-item-card");
              const title = card
                .querySelector(".cart-item-title")
                .textContent.trim();
              card.classList.add("is-removing");
              setTimeout(() => {
                card.remove();
                calculateCart();
                showToast(title + " removed from cart", false);
              }, 300);
            }
          });

          // Checkbox change for gift wrap
          cartList.addEventListener("change", function (e) {
            if (e.target.classList.contains("cart-gift-wrap-check")) {
              calculateCart();
              showToast(
                e.target.checked
                  ? "Gift wrap added (+ ₹50)"
                  : "Gift wrap removed",
              );
            }
          });
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
            setTimeout(() => {
              window.location.href = "payment.html";
            }, 600);
          });
        }
      });
    
