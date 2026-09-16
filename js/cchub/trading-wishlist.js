      document.addEventListener("DOMContentLoaded", function () {
        const grid = document.getElementById("wishlistGrid");
        const emptyState = document.getElementById("wishlistEmptyState");
        const countEl = document.getElementById("itemCountNumber");
        const toolbar = document.querySelector(".wishlist-toolbar");
        const clearBtn = document.getElementById("btnClearWishlist");
        const cartBadge = document.querySelector(".cart-badge");

        let currentCartCount =
          parseInt(cartBadge ? cartBadge.textContent.trim() : "0", 10) || 0;

        function showToast(msg, isSuccess = true) {
          const toast = document.getElementById("wishlistToast");
          const msgEl = document.getElementById("wishlistToastMsg");
          const icon = toast.querySelector("i");
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

        function updateItemCount() {
          const remainingCards = grid.querySelectorAll(".wishlist-card");
          const count = remainingCards.length;
          if (countEl) countEl.textContent = count;

          if (count === 0) {
            if (grid) grid.style.display = "none";
            if (toolbar) toolbar.style.display = "none";
            if (emptyState) emptyState.style.display = "block";
          } else {
            if (grid) grid.style.display = "grid";
            if (toolbar) toolbar.style.display = "flex";
            if (emptyState) emptyState.style.display = "none";
          }
        }

        if (grid) {
          grid.addEventListener("click", function (e) {
            const removeBtn = e.target.closest(".wishlist-remove-btn");
            const cartBtn = e.target.closest(".wishlist-btn-cart");

            if (removeBtn) {
              const card = removeBtn.closest(".wishlist-card");
              if (card) {
                const title = card.getAttribute("data-title") || "Item";
                card.classList.add("is-removing");
                setTimeout(() => {
                  card.remove();
                  updateItemCount();
                  showToast(title + " removed from wishlist", false);
                }, 300);
              }
            } else if (cartBtn) {
              const card = cartBtn.closest(".wishlist-card");
              if (card) {
                const title = card.getAttribute("data-title") || "Item";
                currentCartCount += 1;
                if (cartBadge) {
                  cartBadge.textContent = currentCartCount;
                  cartBadge.classList.add("bump");
                  setTimeout(() => cartBadge.classList.remove("bump"), 300);
                }

                card.classList.add("is-removing");
                setTimeout(() => {
                  card.remove();
                  updateItemCount();
                  showToast(title + " moved to cart!");
                }, 300);
              }
            }
          });
        }

        if (clearBtn) {
          clearBtn.addEventListener("click", function () {
            if (
              confirm(
                "Are you sure you want to remove all items from your wishlist?",
              )
            ) {
              const cards = grid.querySelectorAll(".wishlist-card");
              cards.forEach((c) => c.remove());
              updateItemCount();
              showToast("Wishlist cleared", false);
            }
          });
        }
      });
    
