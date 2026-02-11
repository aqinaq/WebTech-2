const { ObjectId } = require("mongodb");

// --------------------
// Helpers
// --------------------
function getDb(req, res) {
  const db = req.app.locals.db;
  if (!db) {
    res.status(500).json({ error: "Database not initialized" });
    return null;
  }
  return db;
}

function parseIntStrict(v) {
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

function parseNumberStrict(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

//taking role from db 
async function getUserRole(req, db) {
  if (req.userRole) return req.userRole;

  const userId = req.session?.userId;
  if (!userId || !ObjectId.isValid(userId)) return "user";

  const user = await db.collection("users").findOne(
    { _id: new ObjectId(userId) },
    { projection: { role: 1 } }
  );

  const role = user?.role || "user";
  req.userRole = role; 
  return role;
}

// --------------------
// Controllers
// --------------------
async function getMovies(req, res) {
  try {
    const db = getDb(req, res);
    if (!db) return;

    const collection = db.collection("movies");
    const { genre, year, director, country, sortBy, fields } = req.query;

    const filter = {};
    if (genre) filter.genre = String(genre);
    if (director) filter.director = String(director);
    if (country) filter.country = String(country);

    if (year) {
      const y = parseIntStrict(year);
      if (y === null) return res.status(400).json({ error: "Invalid year" });
      filter.year = y;
    }

    const options = {};

    // Projection
    if (fields) {
      options.projection = {};
      fields.split(",").forEach((f) => (options.projection[f.trim()] = 1));
    }

    // Sorting
    if (sortBy) {
      options.sort = {};
      sortBy.split(",").forEach((f) => {
        const field = f.trim();
        if (!field) return;
        if (field.startsWith("-")) options.sort[field.substring(1)] = -1;
        else options.sort[field] = 1;
      });
    } else {
      options.sort = { createdAt: -1 }; 
    }

    // Pagination
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      collection.find(filter, options).skip(skip).limit(limit).toArray(),
      collection.countDocuments(filter),
    ]);

    return res.status(200).json({ page, limit, total, items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }
}

async function getMovieById(req, res) {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const db = getDb(req, res);
    if (!db) return;

    const movie = await db.collection("movies").findOne({ _id: new ObjectId(id) });
    if (!movie) return res.status(404).json({ error: "Movie not found" });

    return res.status(200).json(movie);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }
}

async function createMovie(req, res) {
  const { title, genre, year, director, rating, durationMin, country, description } = req.body;

  if (
    !title || !genre || year === undefined ||
    !director || rating === undefined ||
    durationMin === undefined || !country || !description
  ) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const y = parseIntStrict(year);
  const d = parseIntStrict(durationMin);
  const r = parseNumberStrict(rating);

  if (y === null) return res.status(400).json({ error: "Invalid year" });
  if (d === null || d <= 0) return res.status(400).json({ error: "Invalid durationMin" });
  if (r === null || r < 0 || r > 10) return res.status(400).json({ error: "Invalid rating" });

  try {
    const db = getDb(req, res);
    if (!db) return;

    const userId = req.session?.userId;
    if (!userId || !ObjectId.isValid(userId)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const doc = {
      title: String(title).trim(),
      genre: String(genre).trim(),
      year: y,
      director: String(director).trim(),
      rating: r,
      durationMin: d,
      country: String(country).trim(),
      description: String(description).trim(),
      ownerId: new ObjectId(userId),
      createdAt: new Date(),
    };

    const result = await db.collection("movies").insertOne(doc);
    return res.status(201).json({ message: "Movie created", id: result.insertedId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }
}

async function updateMovie(req, res) {
  const { id } = req.params;
  const { title, genre, year, director, rating, durationMin, country, description } = req.body;

  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });

  if (
    !title || !genre || year === undefined ||
    !director || rating === undefined ||
    durationMin === undefined || !country || !description
  ) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const y = parseIntStrict(year);
  const d = parseIntStrict(durationMin);
  const r = parseNumberStrict(rating);

  if (y === null) return res.status(400).json({ error: "Invalid year" });
  if (d === null || d <= 0) return res.status(400).json({ error: "Invalid durationMin" });
  if (r === null || r < 0 || r > 10) return res.status(400).json({ error: "Invalid rating" });

  try {
    const db = getDb(req, res);
    if (!db) return;

    const userId = req.session?.userId;
    if (!userId || !ObjectId.isValid(userId)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const role = await getUserRole(req, db);
    const isAdmin = role === "admin";

    // owner-only  but admin can everything 
    const filter = isAdmin
      ? { _id: new ObjectId(id) }
      : { _id: new ObjectId(id), ownerId: new ObjectId(userId) };

    const result = await db.collection("movies").updateOne(
      filter,
      {
        $set: {
          title: String(title).trim(),
          genre: String(genre).trim(),
          year: y,
          director: String(director).trim(),
          rating: r,
          durationMin: d,
          country: String(country).trim(),
          description: String(description).trim(),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(403).json({ error: "Forbidden (not owner)" });
    }

    return res.status(200).json({ message: "Movie updated" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }
}

async function deleteMovie(req, res) {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const db = getDb(req, res);
    if (!db) return;

    const userId = req.session?.userId;
    if (!userId || !ObjectId.isValid(userId)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const role = await getUserRole(req, db);
    const isAdmin = role === "admin";

    const filter = isAdmin
      ? { _id: new ObjectId(id) }
      : { _id: new ObjectId(id), ownerId: new ObjectId(userId) };

    const result = await db.collection("movies").deleteOne(filter);

    if (result.deletedCount === 0) {
      return res.status(403).json({ error: "Forbidden (not owner)" });
    }

    return res.status(200).json({ message: "Movie deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }
}

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
