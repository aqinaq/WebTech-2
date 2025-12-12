const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

// Landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Movies list page
app.get('/movies', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'movies.html'));
});

// Single movie page (example static for now)
app.get('/movie/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'movie.html'));
});

// Start server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
