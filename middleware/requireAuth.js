function requireAuth(req, res, next) {
  // if user is logged in session should have userId
  if (req.session && req.session.userId) {
    return next();
  }

  // if it doesn't — 401 Unauthorized
  return res.status(401).json({
    message: "Unauthorized",
  });
}

module.exports = requireAuth;
