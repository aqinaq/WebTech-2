const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const PORT = 3000;

// --- DATABASE SETUP ---
let db;
(async () => {
    // Открываем базу данных
    db = await open({
        filename: './database.db',
        driver: sqlite3.Database
    });

    // Создание таблицы, если она не существует
    await db.exec(`
        CREATE TABLE IF NOT EXISTS movies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL
        )
    `);

    // --- СЕКЦИЯ НАПОЛНЕНИЯ ДАННЫМИ ---
    const moviesCount = await db.get('SELECT COUNT(*) as count FROM movies');

    if (moviesCount.count === 0) {
        await db.run(`
            INSERT INTO movies (title, description) VALUES 
            ('Inception', 'A thief who steals corporate secrets through the use of dream-sharing technology.'),
            ('Interstellar', 'A team of explorers travel through a wormhole in space.'),
            ('Parasite', 'A poor family cunningly infiltrates a wealthy household, exposing deep-rooted class discrimination through a gripping and dark social satire.')
        `);
        console.log("Initial movies added to the database!");
    }
    // ---------------------------------

    console.log("Database & Table ready.");
})();

// --- MIDDLEWARE ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Требование №2: для обработки JSON в API

// Custom logger middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// --- HTML ROUTES ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'views', 'about.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'views', 'contact.html')));
app.get('/movies', (req, res) => res.sendFile(path.join(__dirname, 'views', 'movies.html')));
app.get('/favorites', (req, res) => res.sendFile(path.join(__dirname, 'views', 'favorites.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'views', 'profile.html')));

// --- API ROUTES (CRUD) - Требование №4 & №5 ---

// 1. GET ALL
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await db.all('SELECT * FROM movies ORDER BY id ASC');
        res.status(200).json(movies);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// 2. GET SINGLE
app.get('/api/movies/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    try {
        const movie = await db.get('SELECT * FROM movies WHERE id = ?', id);
        if (!movie) return res.status(404).json({ error: "Movie not found" });
        res.status(200).json(movie);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// 3. POST (CREATE)
app.post('/api/movies', async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        return res.status(400).json({ error: "Missing fields: title and description are required" });
    }

    try {
        const result = await db.run(
            'INSERT INTO movies (title, description) VALUES (?, ?)',
            [title, description]
        );
        res.status(201).json({ id: result.lastID, title, description });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// 4. PUT (UPDATE)
app.put('/api/movies/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, description } = req.body;

    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    if (!title || !description) return res.status(400).json({ error: "Missing fields" });

    try {
        const result = await db.run(
            'UPDATE movies SET title = ?, description = ? WHERE id = ?',
            [title, description, id]
        );
        if (result.changes === 0) return res.status(404).json({ error: "Movie not found" });
        res.status(200).json({ id, title, description });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// 5. DELETE
app.delete('/api/movies/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    try {
        const result = await db.run('DELETE FROM movies WHERE id = ?', id);
        if (result.changes === 0) return res.status(404).json({ error: "Movie not found" });
        res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// --- OTHER HANDLERS ---

app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).send('All fields are required');
    
    const data = { name, email, message, date: new Date().toISOString() };
    fs.writeFile('messages.json', JSON.stringify(data, null, 2), (err) => {
        if (err) return res.status(500).send('Error saving message');
        res.send(`<h2>Thank you, ${name}! Your message was saved.</h2>`);
    });
});

// Global 404 Handler (Требование №7)
app.use((req, res) => {
    if (req.url.startsWith('/api/')) {
        res.status(404).json({ error: "API route not found" });
    } else {
        res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));