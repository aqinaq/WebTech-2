const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware для обработки статических файлов и данных форм
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// GET маршруты для отображения страниц
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'views', 'about.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'views', 'contact.html')));
app.get('/movies', (req, res) => res.sendFile(path.join(__dirname, 'views', 'movies.html')));
app.get('/movie/:id', (req, res) => res.sendFile(path.join(__dirname, 'views', 'movie.html')));
app.get('/favorites', (req, res) => res.sendFile(path.join(__dirname, 'views', 'favorites.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'views', 'profile.html')));

// --- ИСПРАВЛЕННЫЙ POST МАРШРУТ ---
app.post('/contact', (req, res) => {
  console.log(req.body); // Выводит данные формы в консоль сервера
  res.send(`<h2>Thanks, ${req.body.name}! Your message has been received.</h2>`);
});
// --------------------------------

// Обработка 404 ошибки
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public/404.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));