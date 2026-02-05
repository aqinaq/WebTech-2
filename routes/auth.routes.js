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
  // всегда одно и то же сообщение (по требованиям)
  return res.status(401).json({ message: "Invalid credentials" });
}

// --------------------
// POST /auth/register
// Разрешаем только создать ПЕРВОГО пользователя (админа).
// После этого регистрироваться нельзя (для безопасности).
// --------------------
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

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

    // ✅ безопасность: разрешаем регистрацию только если в базе нет пользователей
    const usersCount = await users.countDocuments({});
    if (usersCount > 0) {
      return res.status(403).json({ message: "Registration is disabled" });
    }

    const passwordHash = await bcrypt.hash(pass, 10);

    const result = await users.insertOne({
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date(),
    });

    // авто-логин после регистрации
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

    req.session.userId = user._id.toString();

    return res.status(200).json({
      message: "Logged in",
      user: { id: user._id.toString(), email: user.email },
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

    // важно: path должен совпадать с cookie path (обычно '/')
    res.clearCookie("connect.sid", { path: "/" });

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

    // защита от кривых id
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
      user: { id: user._id.toString(), email: user.email },
    });
  } catch (err) {
    console.error("ME ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
