const API_URL = "/api/movies";

const tableBody = document.getElementById("moviesBody");
const form = document.getElementById("movieForm");

const idInput = document.getElementById("movieId");
const titleInput = document.getElementById("title");
const genreInput = document.getElementById("genre");
const yearInput = document.getElementById("year");
const descInput = document.getElementById("description");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

async function loadMovies() {
  const res = await fetch(API_URL);
  const movies = await res.json();

  tableBody.innerHTML = "";

  movies.forEach((m) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td style="padding:10px 6px; border-bottom:1px solid #333;">${escapeHtml(m.title)}</td>
      <td style="padding:10px 6px; border-bottom:1px solid #333;">${escapeHtml(m.genre)}</td>
      <td style="padding:10px 6px; border-bottom:1px solid #333;">${m.year}</td>
      <td style="padding:10px 6px; border-bottom:1px solid #333; max-width:420px;">${escapeHtml(m.description)}</td>
      <td style="padding:10px 6px; border-bottom:1px solid #333; white-space:nowrap;">
        <button class="details-btn" data-edit="${m._id}">Edit</button>
        <button class="details-btn" data-del="${m._id}">Delete</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

function setFormModeCreate() {
  idInput.value = "";
  submitBtn.textContent = "Add Movie";
  cancelBtn.style.display = "none";
  form.reset();
}

function setFormModeEdit(movie) {
  idInput.value = movie._id;
  titleInput.value = movie.title;
  genreInput.value = movie.genre;
  yearInput.value = movie.year;
  descInput.value = movie.description;

  submitBtn.textContent = "Update Movie";
  cancelBtn.style.display = "inline-block";
}

tableBody.addEventListener("click", async (e) => {
  const editId = e.target.dataset.edit;
  const delId = e.target.dataset.del;

  if (delId) {
    const ok = confirm("Delete this movie?");
    if (!ok) return;

    await fetch(`${API_URL}/${delId}`, { method: "DELETE" });
    await loadMovies();
    setFormModeCreate();
  }

  if (editId) {
    const res = await fetch(`${API_URL}/${editId}`);
    const movie = await res.json();
    setFormModeEdit(movie);
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    title: titleInput.value.trim(),
    genre: genreInput.value.trim(),
    year: Number(yearInput.value),
    description: descInput.value.trim(),
  };

  const id = idInput.value;

  if (!id) {
    // CREATE
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } else {
    // UPDATE
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  await loadMovies();
  setFormModeCreate();
});

cancelBtn.addEventListener("click", () => {
  setFormModeCreate();
});

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Init
loadMovies();
setFormModeCreate();
