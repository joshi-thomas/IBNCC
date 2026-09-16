    (function () {
      "use strict";

      // Tab Elements
      const tabButtons = document.querySelectorAll(".activity-tab-btn");
      const tabPanels = document.querySelectorAll(".activity-tab-panel");
      const sectionTitle = document.getElementById("activitySectionTitle");
      const sectionSubtitle = document.getElementById("activitySectionSubtitle");
      const headerBadge = document.getElementById("activityHeaderBadge");
      const headerBadgeText = document.getElementById("activityHeaderBadgeText");
      const toast = document.getElementById("activityToast");
      const toastText = document.getElementById("activityToastText");
      let toastTimer = null;

      function showToast(message, iconClass = "fa-circle-check") {
        if (!toast || !toastText) return;
        toastText.textContent = message;
        const icon = toast.querySelector("i");
        if (icon) {
          icon.className = `fa-solid ${iconClass}`;
        }
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
          toast.classList.remove("show");
        }, 3000);
      }

      function updateCounts() {
        const savedCount = document.querySelectorAll("#savedProfileList .profile-card").length;
        const sharedCount = document.querySelectorAll("#sharedProfileList .profile-card").length;
        const blockedCount = document.querySelectorAll("#blockedProfileList .profile-card").length;

        const savedBadge = document.getElementById("savedCountBadge");
        const sharedBadge = document.getElementById("sharedCountBadge");
        const blockedBadge = document.getElementById("blockedCountBadge");

        if (savedBadge) savedBadge.textContent = savedCount;
        if (sharedBadge) sharedBadge.textContent = sharedCount;
        if (blockedBadge) blockedBadge.textContent = blockedCount;

        const activeTab = document.querySelector(".activity-tab-btn.is-active");
        if (activeTab && headerBadgeText) {
          const tabType = activeTab.getAttribute("data-tab");
          if (tabType === "saved") {
            headerBadgeText.textContent = `${savedCount} Saved Member${savedCount !== 1 ? "s" : ""}`;
          } else if (tabType === "shared") {
            headerBadgeText.textContent = `${sharedCount} Shared Profile${sharedCount !== 1 ? "s" : ""}`;
          } else if (tabType === "blocked") {
            headerBadgeText.textContent = `${blockedCount} Blocked Member${blockedCount !== 1 ? "s" : ""}`;
          }
        }
      }

      function switchTab(targetTabBtn) {
        if (!targetTabBtn) return;
        const tabKey = targetTabBtn.getAttribute("data-tab");
        const title = targetTabBtn.getAttribute("data-title") || "My Activity";
        const subtitle = targetTabBtn.getAttribute("data-subtitle") || "";

        tabButtons.forEach((btn) => {
          const isCurrent = btn === targetTabBtn;
          btn.classList.toggle("is-active", isCurrent);
          btn.setAttribute("aria-selected", isCurrent ? "true" : "false");
        });

        tabPanels.forEach((panel) => {
          const panelId = panel.id;
          if (panelId === `panel-${tabKey}`) {
            panel.hidden = false;
          } else {
            panel.hidden = true;
          }
        });

        if (sectionTitle) sectionTitle.textContent = title;
        if (sectionSubtitle) sectionSubtitle.textContent = subtitle;

        updateCounts();
      }

      tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          switchTab(btn);
        });

        btn.addEventListener("keydown", (e) => {
          const btns = Array.from(tabButtons);
          const index = btns.indexOf(btn);
          let targetIndex = -1;

          if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            targetIndex = (index + 1) % btns.length;
          } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            targetIndex = (index - 1 + btns.length) % btns.length;
          }

          if (targetIndex !== -1) {
            e.preventDefault();
            btns[targetIndex].focus();
            switchTab(btns[targetIndex]);
          }
        });
      });

      // Actions: Unblock, Unsave, Re-share
      document.addEventListener("click", (e) => {
        // Unblock action
        const unblockBtn = e.target.closest('[data-action="unblock"]');
        if (unblockBtn) {
          const name = unblockBtn.getAttribute("data-name") || "Member";
          const card = unblockBtn.closest(".profile-card");
          if (card) {
            card.style.transition = "all 0.3s ease";
            card.style.opacity = "0";
            card.style.transform = "translateX(20px)";
            setTimeout(() => {
              card.remove();
              updateCounts();
              showToast(`${name} has been unblocked.`);
            }, 300);
          }
          return;
        }

        // Unsave action
        const unsaveBtn = e.target.closest('[data-action="unsave"]');
        if (unsaveBtn) {
          const name = unsaveBtn.getAttribute("data-name") || "Member";
          const card = unsaveBtn.closest(".profile-card");
          if (card) {
            card.style.transition = "all 0.3s ease";
            card.style.opacity = "0";
            card.style.transform = "scale(0.96)";
            setTimeout(() => {
              card.remove();
              updateCounts();
              showToast(`${name} removed from saved profiles.`);
            }, 300);
          }
          return;
        }

        // Reshare action
        const reshareBtn = e.target.closest('[data-action="reshare"]');
        if (reshareBtn) {
          const name = reshareBtn.getAttribute("data-name") || "Member";
          showToast(`Profile link for ${name} copied to clipboard!`, "fa-share-nodes");
          return;
        }
      });

      updateCounts();
    })();
  
