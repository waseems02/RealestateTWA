function addMessage(role, text) {
  const chat = document.querySelector("#chatBox");
  chat.insertAdjacentHTML("beforeend", `<div class="message ${role}">${text}</div>`);
  chat.scrollTop = chat.scrollHeight;
}

document.addEventListener("DOMContentLoaded", () => {
  addMessage("assistant", "שלום, אני יכול לעזור להשוות דירות, להבין עלויות ולנסח שאלות לבעל הדירה.");

  document.querySelector("#chatForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = document.querySelector("#message");
    const message = input.value.trim();
    if (!message) return;

    input.value = "";
    addMessage("user", message);

    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    const payload = await response.json();
    addMessage("assistant", payload.reply || "לא התקבלה תשובה.");
  });
});
