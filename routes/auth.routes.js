const express = require("express");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

const router = express.Router();

function getUsersCollection(req) {
  // Берём db, который ты обычно сохраняешь в app.locals в connectDB (см. ниже в server.js)
  const db = req.app.locals.db;
  if (!db) throw new Error("DB is not initialized (req.app.locals.db is missing)");
  return db.collection("users");
}

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail.includes("@")) {
      return res.status(400).json({ message: "Invalid email" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const users = getUsersCollection(req);

    const exists = await users.findOne({ email: normalizedEmail });
    if (exists) {
      // можно более нейтрально, но это register (не login), тут ок
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const result = await users.insertOne({
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date(),
    });

    // опционально: сразу залогинить после регистрации
    req.session.userId = result.insertedId.toString();

    return res.status(201).json({
      message: "Registered",
      user: { id: result.insertedId.toString(), email: normalizedEmail },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // generic error message
    const invalid = () => res.status(401).json({ message: "Invalid credentials" });

    if (!email || !password) return invalid();

    const normalizedEmail = String(email).trim().toLowerCase();
    const users = getUsersCollection(req);

    const user = await users.findOne({ email: normalizedEmail });
    if (!user) return invalid();

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return invalid();

    req.session.userId = user._id.toString();

    return res.json({
      message: "Logged in",
      user: { id: user._id.toString(), email: user.email },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /auth/logout
router.post("/logout", (req, res) => {
  // уничтожаем сессию
  req.session.destroy((err) => {
    if (err) {
      console.error("LOGOUT ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }
    // удаляем cookie сессии
    res.clearCookie("connect.sid");
    return res.json({ message: "Logged out" });
  });
});

// GET /auth/me
router.get("/me", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(200).json({ authenticated: false });
    }

    const users = getUsersCollection(req);
    const user = await users.findOne(
      { _id: new ObjectId(req.session.userId) },
      { projection: { passwordHash: 0 } }
    );

    if (!user) {
      // если в сессии старый id — считаем неавторизованным
      return res.status(200).json({ authenticated: false });
    }

    return res.json({
      authenticated: true,
      user: { id: user._id.toString(), email: user.email },
    });
  } catch (err) {
    console.error("ME ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
