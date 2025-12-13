const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/movies', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'movies.html'));
});

app.get('/movie/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'movie.html'));
});

app.get('/favorites', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'favorites.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
