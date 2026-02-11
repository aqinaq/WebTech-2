const { ObjectId } = require("mongodb");

module.exports = async function requireOwnerOrAdmin(req, res, next) {
  try {
    const db = req.app.locals.db;
    const movieId = req.params.id;

    if (!ObjectId.isValid(movieId)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const movie = await db.collection("movies").findOne(
      { _id: new ObjectId(movieId) },
      { projection: { ownerId: 1 } }
    );

    if (!movie) return res.status(404).json({ error: "Movie not found" });

    // ✅ нормализуем роль безопасно
    const role = String(req.userRole || "user").trim().toLowerCase().replace(/,+$/, "");
    const isAdmin = role === "admin";

    // ✅ если ownerId отсутствует (старые записи) — редактировать может только admin
    if (!movie.ownerId) {
      if (!isAdmin) return res.status(403).json({ error: "Forbidden" });
      return next();
    }

    const isOwner = String(movie.ownerId) === String(req.session.userId);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return next();
  } catch (e) {
    console.error("requireOwnerOrAdmin error:", e);
    return res.status(500).json({ error: "Server error" });
  }
};
