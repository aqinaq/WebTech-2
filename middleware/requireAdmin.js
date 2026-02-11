module.exports = function requireAdmin(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: "Unauthorized" });
  if (req.userRole !== "admin") return res.status(403).json({ error: "Forbidden" });
  next();
};
