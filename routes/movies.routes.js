const express = require("express");
const requireAuth = require("../middleware/requireAuth");

const {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} = require("../controllers/movies.controller");

const router = express.Router();

router.get("/", getMovies);
router.get("/:id", getMovieById);

router.post("/", requireAuth, createMovie);
router.put("/:id", requireAuth, updateMovie);
router.delete("/:id", requireAuth, deleteMovie);

module.exports = router;
