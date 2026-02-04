function requireAuth(req, res, next) {
  // если пользователь залогинен
  if (req.session && req.session.userId) {
    return next();
  }

  // если НЕ залогинен
  return res.status(401).json({
    message: "Unauthorized",
  });
}

module.exports = requireAuth;
