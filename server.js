const express = require("express");
const path = require("path");
require("dotenv").config();

const connectDB = require("./database/mongo");

// SESSIONS
const session = require("express-session");
const MongoStorePkg = require("connect-mongo");
const MongoStore = MongoStorePkg.default || MongoStorePkg;

//role loader middleware 
const loadUserRole = require("./middleware/loadUserRole");

const app = express();
const PORT = process.env.PORT || 3000;


app.set("trust proxy", 1);

// --------------------
// MIDDLEWARE
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// --------------------
// SESSIONS 
// --------------------
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: "cineshelf_db", 
      collectionName: "sessions",
      ttl: 60 * 60 * 24, 
      autoRemove: "native",
    }),

    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, 
    },
  })
);

// load user role for every request (if authenticated) and put it in req.userRole
app.use(loadUserRole);

// --------------------
// STATIC FILES
// --------------------
app.use(express.static(path.join(__dirname, "public")));

// --------------------
// HTML ROUTES (VIEWS)
// --------------------
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "index.html"))
);

app.get("/about", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "about.html"))
);

app.get("/contact", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "contact.html"))
);

app.get("/movies", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "movies.html"))
);

app.get("/favorites", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "favorites.html"))
);

app.get("/profile", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "profile.html"))
);

app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "login.html"))
);

app.get("/register", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "register.html"))
);

// healthcheck
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

// --------------------
// API ROUTES
// --------------------
const moviesRoutes = require("./routes/movies.routes");
app.use("/api/movies", moviesRoutes);
console.log("Movies routes connected");

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);
console.log("Auth routes connected");



// --------------------
// GLOBAL 404
// --------------------
app.use((req, res) => {
  if (req.url.startsWith("/api") || req.url.startsWith("/auth")) {
    res.status(404).json({ error: "API route not found" });
  } else {
    res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
  }
});

// --------------------
// START SERVER
// --------------------
async function start() {
  try {
    const db = await connectDB();
    app.locals.db = db;

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server due to MongoDB error:", err);
    process.exit(1);
  }
}

start();
