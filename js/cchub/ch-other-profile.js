/**
 * CC Hub — Other member profile: message chat
 */

(() => {
  "use strict";

  const sendBtn = document.getElementById("sendMessageBtn");
  const chatBox = document.getElementById("otherChatBox");
  const closeBtn = document.getElementById("closeChatBtn");
  const form = document.getElementById("otherChatForm");
  const input = document.getElementById("otherChatInput");
  const log = document.getElementById("otherChatMessages");
  const empty = document.getElementById("otherChatEmpty");

  if (!sendBtn || !chatBox) return;

  function setChatOpen(open) {
    chatBox.hidden = !open;
    sendBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      window.requestAnimationFrame(() => input?.focus());
    }
  }

  sendBtn.addEventListener("click", () => {
    setChatOpen(chatBox.hidden);
  });

  closeBtn?.addEventListener("click", () => {
    setChatOpen(false);
    sendBtn.focus();
  });

  function appendBubble(text, outgoing) {
    empty?.remove();
    const bubble = document.createElement("p");
    bubble.className = `other-chat-bubble ${outgoing ? "is-out" : "is-in"}`;
    bubble.textContent = text;
    log.appendChild(bubble);
    log.scrollTop = log.scrollHeight;
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input?.value.trim();
    if (!text) return;

    appendBubble(text, true);
    input.value = "";
    input.focus();

    window.setTimeout(() => {
      appendBubble("Thanks for reaching out. I’ll get back to you shortly.", false);
    }, 700);
  });

  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form?.requestSubmit();
    }
  });
})();
