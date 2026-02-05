const express = require("express");
const { ObjectId } = require("mongodb");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

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


router.get("/", async (req, res) => {
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
    }

    const movies = await collection.find(filter, options).toArray();
    res.status(200).json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});


router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const db = getDb(req, res);
    if (!db) return;

    const movie = await db.collection("movies").findOne({ _id: new ObjectId(id) });
    if (!movie) return res.status(404).json({ error: "Movie not found" });

    res.status(200).json(movie);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const { title, genre, year, director, rating, durationMin, country, description } = req.body;

  // Required fields
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

    const doc = {
      title: String(title).trim(),
      genre: String(genre).trim(),
      year: y,
      director: String(director).trim(),
      rating: r,
      durationMin: d,
      country: String(country).trim(),
      description: String(description).trim(),
      createdAt: new Date(),
    };

    const result = await db.collection("movies").insertOne(doc);
    res.status(201).json({ message: "Movie created", id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
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

    const result = await db.collection("movies").updateOne(
      { _id: new ObjectId(id) },
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
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(200).json({ message: "Movie updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});


router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const db = getDb(req, res);
    if (!db) return;

    const result = await db.collection("movies").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(200).json({ message: "Movie deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
