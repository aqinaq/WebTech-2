const express = require("express");
const path = require("path");

require("dotenv").config();

const connectDB = require("./database/mongo");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Static files (public)
app.use(express.static(path.join(__dirname, "public")));

// HTML Routes (views)
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "views", "index.html")));
app.get("/about", (req, res) => res.sendFile(path.join(__dirname, "views", "about.html")));
app.get("/contact", (req, res) => res.sendFile(path.join(__dirname, "views", "contact.html")));
app.get("/movies", (req, res) => res.sendFile(path.join(__dirname, "views", "movies.html")));
app.get("/favorites", (req, res) => res.sendFile(path.join(__dirname, "views", "favorites.html")));
app.get("/profile", (req, res) => res.sendFile(path.join(__dirname, "views", "profile.html")));

// API Routes
const moviesRoutes = require("./routes/movies.routes");
app.use("/api/movies", moviesRoutes);
console.log("Movies routes connected");

// Global 404
app.use((req, res) => {
  if (req.url.startsWith("/api")) {
    res.status(404).json({ error: "API route not found" });
  } else {
    res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
  }
});

async function start() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server due to MongoDB error:", err);
    process.exit(1);
  }
}

start();
