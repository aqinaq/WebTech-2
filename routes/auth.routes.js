const express = require("express");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

const router = express.Router();

function getUsersCollection(req) {
  const db = req.app.locals.db;
  if (!db) throw new Error("DB is not initialized (req.app.locals.db is missing)");
  return db.collection("users");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function invalidCredentials(res) {
  return res.status(401).json({ message: "Invalid credentials" });
}

// session store only userId
function setSessionUser(req, userId) {
  req.session.userId = String(userId);
  // role take from DB on demand in loadUserRole middleware, but not stored in session to avoid security issues
}

// --------------------
// POST /auth/register  
// --------------------
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail.includes("@")) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const pass = String(password);
    if (pass.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const users = getUsersCollection(req);

    // unique email check
    const exists = await users.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    // hash password
    const passwordHash = await bcrypt.hash(pass, 10);

    const result = await users.insertOne({
      email: normalizedEmail,
      passwordHash,
      role: "user", // save role in DB, but not in session
      createdAt: new Date(),
    });

    // auto-login after registration
    setSessionUser(req, result.insertedId);

    return res.status(201).json({
      message: "Registered",
      user: { id: result.insertedId.toString(), email: normalizedEmail, role: "user" },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// --------------------
// POST /auth/login
// --------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return invalidCredentials(res);

    const normalizedEmail = normalizeEmail(email);
    const users = getUsersCollection(req);

    const user = await users.findOne({ email: normalizedEmail });
    if (!user) return invalidCredentials(res);

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return invalidCredentials(res);

    setSessionUser(req, user._id);

    return res.status(200).json({
      message: "Logged in",
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role || "user",
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// --------------------
// POST /auth/logout
// --------------------
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("LOGOUT ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }

    // clear cookies on logout
    res.clearCookie("connect.sid", { path: "/" });
    res.clearCookie("sid", { path: "/" });

    return res.status(200).json({ message: "Logged out" });
  });
});

// --------------------
// GET /auth/me
// --------------------
router.get("/me", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(200).json({ authenticated: false });
    }

    if (!ObjectId.isValid(userId)) {
      return res.status(200).json({ authenticated: false });
    }

    const users = getUsersCollection(req);

    const user = await users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { passwordHash: 0 } }
    );

    if (!user) {
      return res.status(200).json({ authenticated: false });
    }

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role || "user",
      },
    });
  } catch (err) {
    console.error("ME ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }

  console.log("ME session userId:", req.session.userId);
  console.log("ME user role from DB:", user.role);

});

module.exports = router;
