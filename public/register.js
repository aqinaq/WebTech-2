const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const msgEl = document.getElementById("msg");
const btn = document.getElementById("btn");

btn.addEventListener("click", async () => {
  msgEl.textContent = "";

  const email = emailEl.value.trim();
  const password = passEl.value;

  const res = await fetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include"
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    msgEl.textContent = data.message || "Register failed";
    return;
  }

  // после регистрации перекидываем на movies
  window.location.href = "/movies";
});
