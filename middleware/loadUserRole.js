const { ObjectId } = require("mongodb");

module.exports = async function loadUserRole(req, res, next) {
  try {
    const userId = req.session?.userId;

    if (!userId || !ObjectId.isValid(userId)) {
      req.userRole = null;
      return next();
    }

    const db = req.app.locals.db;
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { role: 1 } }
    );

    // normalization if role is not string or has weird format  default to "user"
    const raw = String(user?.role || "user");
    const role = raw.trim().toLowerCase().replace(/,+$/, ""); // убираем запятые в конце: "admin," -> "admin"

    req.userRole = role;
    return next();
  } catch (e) {
    console.error("loadUserRole error:", e);
    return res.status(500).json({ error: "Server error" });
  }
};
