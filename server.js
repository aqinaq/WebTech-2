const express = require("express");
const path = require("path");
const connectDB = require("./database/mongo"); // Импортируем функцию подключения

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Static
app.use(express.static(path.join(__dirname, "public")));

// HTML Routes
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

// Функция для запуска базы и сервера
async function start() {
    try {
        // Сначала подключаемся к базе данных
        await connectDB(); 
        
        // Только после успеха запускаем сервер
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("❌ Failed to start server due to MongoDB error:", err);
        process.exit(1); // Завершаем процесс, если база не доступна
    }
}

// Запускаем приложение
start();