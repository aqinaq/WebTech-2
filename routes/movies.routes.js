const express = require("express");
const { ObjectId } = require("mongodb");
const connectDB = require("../database/mongo");

const router = express.Router();

// GET ALL with filter, sort, projection
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("movies");

    const { genre, year, sortBy, fields } = req.query;

    let filter = {};
    if (genre) filter.genre = genre;
    if (year) filter.year = parseInt(year);

    let options = {};

    // Projection
    if (fields) {
      options.projection = {};
      fields.split(",").forEach((f) => (options.projection[f.trim()] = 1));
    }

    // Sorting
    if (sortBy) {
      options.sort = {};
      sortBy.split(",").forEach((f) => {
        if (f.startsWith("-")) {
          options.sort[f.substring(1)] = -1;
        } else {
          options.sort[f] = 1;
        }
      });
    }

    const movies = await collection.find(filter, options).toArray();
    res.status(200).json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET ONE
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const db = await connectDB();
    const movie = await db.collection("movies").findOne({ _id: new ObjectId(id) });

    if (!movie) return res.status(404).json({ error: "Movie not found" });
    res.status(200).json(movie);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// CREATE
router.post("/", async (req, res) => {
  const { title, genre, year, description } = req.body;

  if (!title || !genre || !year || !description) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const db = await connectDB();
    const result = await db.collection("movies").insertOne({
      title: String(title),
      genre: String(genre),
      year: parseInt(year),
      description: String(description),
    });

    res.status(201).json({ message: "Movie created", id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, genre, year, description } = req.body;

  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });
  if (!title || !genre || !year || !description) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const db = await connectDB();
    const result = await db.collection("movies").updateOne(
      { _id: new ObjectId(id) },
      { $set: { title: String(title), genre: String(genre), year: parseInt(year), description: String(description) } }
    );

    if (result.matchedCount === 0) return res.status(404).json({ error: "Movie not found" });

    res.status(200).json({ message: "Movie updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const db = await connectDB();
    const result = await db.collection("movies").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) return res.status(404).json({ error: "Movie not found" });

    res.status(200).json({ message: "Movie deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
