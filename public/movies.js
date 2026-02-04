const API_URL = "/api/movies";

const tableBody = document.getElementById("moviesBody");
const form = document.getElementById("movieForm");

const idInput = document.getElementById("movieId");
const titleInput = document.getElementById("title");
const genreInput = document.getElementById("genre");
const yearInput = document.getElementById("year");

// NEW fields (должны быть в movies.html)
const directorInput = document.getElementById("director");
const ratingInput = document.getElementById("rating");
const durationInput = document.getElementById("durationMin");
const countryInput = document.getElementById("country");

const descInput = document.getElementById("description");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

// Auth UI elements
const authStatus = document.getElementById("authStatus");
const loginLink = document.getElementById("loginLink");
const logoutBtn = document.getElementById("logoutBtn");
const authWarning = document.getElementById("authWarning");

let isAuthenticated = false;

// --------------------
// Helpers
// --------------------
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function redirectToLogin() {
  alert("Please login");
  window.location.href = "/login";
}

function setAuthUI(auth, userEmail = "") {
  isAuthenticated = auth;

  if (authStatus) authStatus.textContent = auth ? `Logged in as ${userEmail}` : "Not logged in";
  if (loginLink) loginLink.style.display = auth ? "none" : "inline";
  if (logoutBtn) logoutBtn.style.display = auth ? "inline-block" : "none";
  if (authWarning) authWarning.style.display = auth ? "none" : "block";

  const disable = !auth;
  if (titleInput) titleInput.disabled = disable;
  if (genreInput) genreInput.disabled = disable;
  if (yearInput) yearInput.disabled = disable;

  if (directorInput) directorInput.disabled = disable;
  if (ratingInput) ratingInput.disabled = disable;
  if (durationInput) durationInput.disabled = disable;
  if (countryInput) countryInput.disabled = disable;

  if (descInput) descInput.disabled = disable;
  if (submitBtn) submitBtn.disabled = disable;
  if (cancelBtn) cancelBtn.disabled = disable;
}

async function checkAuth() {
  const res = await fetch("/auth/me", { credentials: "include" });
  const data = await safeJson(res);

  if (data && data.authenticated) {
    setAuthUI(true, data.user?.email || "");
    return true;
  }

  setAuthUI(false, "");
  return false;
}

// --------------------
// Movies loading
// --------------------
async function loadMovies() {
  const res = await fetch(API_URL);
  const movies = await safeJson(res);

  tableBody.innerHTML = "";

  if (!res.ok) {
    const msg = movies?.error || movies?.message || "Failed to load movies";
    tableBody.innerHTML = `<tr><td colspan="9" style="padding:10px;">${escapeHtml(msg)}</td></tr>`;
    return;
  }

  (movies || []).forEach((m) => {
    const tr = document.createElement("tr");

    const actionsHtml = isAuthenticated
      ? `
        <button class="details-btn" data-edit="${m._id}">Edit</button>
        <button class="details-btn" data-del="${m._id}">Delete</button>
      `
      : `<span style="color:#888;">Login required</span>`;

    tr.innerHTML = `
      <td style="padding:10px 6px; border-bottom:1px solid #333;">${escapeHtml(m.title)}</td>
      <td style="padding:10px 6px; border-bottom:1px solid #333;">${escapeHtml(m.genre)}</td>
      <td style="padding:10px 6px; border-bottom:1px solid #333;">${Number(m.year) || ""}</td>

      <td style="padding:10px 6px; border-bottom:1px solid #333;">${escapeHtml(m.director)}</td>
      <td style="padding:10px 6px; border-bottom:1px solid #333;">${m.rating ?? ""}</td>
      <td style="padding:10px 6px; border-bottom:1px solid #333;">${m.durationMin ?? ""}</td>
      <td style="padding:10px 6px; border-bottom:1px solid #333;">${escapeHtml(m.country)}</td>

      <td style="padding:10px 6px; border-bottom:1px solid #333; max-width:420px;">${escapeHtml(m.description)}</td>

      <td style="padding:10px 6px; border-bottom:1px solid #333; white-space:nowrap;">
        ${actionsHtml}
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

// --------------------
// Form modes
// --------------------
function setFormModeCreate() {
  idInput.value = "";
  submitBtn.textContent = "Add Movie";
  cancelBtn.style.display = "none";
  form.reset();
}

function setFormModeEdit(movie) {
  idInput.value = movie._id;

  titleInput.value = movie.title || "";
  genreInput.value = movie.genre || "";
  yearInput.value = movie.year ?? "";

  if (directorInput) directorInput.value = movie.director || "";
  if (ratingInput) ratingInput.value = movie.rating ?? "";
  if (durationInput) durationInput.value = movie.durationMin ?? "";
  if (countryInput) countryInput.value = movie.country || "";

  descInput.value = movie.description || "";

  submitBtn.textContent = "Update Movie";
  cancelBtn.style.display = "inline-block";
}

// --------------------
// Table actions
// --------------------
tableBody.addEventListener("click", async (e) => {
  const editId = e.target.dataset?.edit;
  const delId = e.target.dataset?.del;

  if (delId) {
    if (!isAuthenticated) return redirectToLogin();

    const ok = confirm("Delete this movie?");
    if (!ok) return;

    const res = await fetch(`${API_URL}/${delId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.status === 401) return redirectToLogin();

    if (!res.ok) {
      const data = await safeJson(res);
      alert(data?.error || data?.message || "Delete failed");
      return;
    }

    await loadMovies();
    setFormModeCreate();
  }

  if (editId) {
    if (!isAuthenticated) return redirectToLogin();

    const res = await fetch(`${API_URL}/${editId}`);
    const movie = await safeJson(res);

    if (!res.ok) {
      alert(movie?.error || movie?.message || "Failed to load movie");
      return;
    }

    setFormModeEdit(movie);
  }
});

// --------------------
// Submit form
// --------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!isAuthenticated) return redirectToLogin();

  const payload = {
    title: titleInput.value.trim(),
    genre: genreInput.value.trim(),
    year: Number(yearInput.value),

    director: directorInput ? directorInput.value.trim() : "",
    rating: ratingInput ? Number(ratingInput.value) : null,
    durationMin: durationInput ? Number(durationInput.value) : null,
    country: countryInput ? countryInput.value.trim() : "",

    description: descInput.value.trim(),
  };

  const id = idInput.value;

  let res;
  if (!id) {
    res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
  } else {
    res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
  }

  if (res.status === 401) return redirectToLogin();

  if (!res.ok) {
    const data = await safeJson(res);
    alert(data?.error || data?.message || "Save failed");
    return;
  }

  await loadMovies();
  setFormModeCreate();
});

cancelBtn.addEventListener("click", () => {
  setFormModeCreate();
});

// --------------------
// Logout
// --------------------
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    const res = await fetch("/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      alert("Logout failed");
      return;
    }

    setAuthUI(false, "");
    setFormModeCreate();
    await loadMovies();
  });
}

// --------------------
// Escape HTML
// --------------------
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// --------------------
// Init
// --------------------
(async () => {
  await checkAuth();
  await loadMovies();
  setFormModeCreate();
})();
