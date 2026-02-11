const { ObjectId } = require("mongodb");

function getDb(req) {
  return req.app.locals.db;
}

async function requireRole(req, res, next) {
  try {
    if (!req.session?.userId) return res.status(401).json({ error: "Unauthorized" });
    if (!ObjectId.isValid(req.session.userId)) return res.status(401).json({ error: "Unauthorized" });

    const db = getDb(req);
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(req.session.userId) },
      { projection: { role: 1 } }
    );

    req.userRole = user?.role || "user"; // прокидываем роль в req
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = requireRole;
