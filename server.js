const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

/* =======================
   MIDDLEWARE
======================= */

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Form data
app.use(express.urlencoded({ extended: true }));

// Custom logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/* =======================
   ROUTES (HTML)
======================= */

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'views', 'index.html'))
);

app.get('/about', (req, res) =>
  res.sendFile(path.join(__dirname, 'views', 'about.html'))
);

app.get('/contact', (req, res) =>
  res.sendFile(path.join(__dirname, 'views', 'contact.html'))
);

app.get('/movies', (req, res) =>
  res.sendFile(path.join(__dirname, 'views', 'movies.html'))
);

app.get('/favorites', (req, res) =>
  res.sendFile(path.join(__dirname, 'views', 'favorites.html'))
);

app.get('/profile', (req, res) =>
  res.sendFile(path.join(__dirname, 'views', 'profile.html'))
);

/* =======================
   ASSIGNMENT-SPECIFIC ROUTES
======================= */

// /search?q=value
app.get('/search', (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).send('Missing search query');
  }

  res.send(`<h2>Search results for: "${query}"</h2>`);
});

// /item/:id (placeholder)
app.get('/item/:id', (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).send('Item ID is required');
  }

  res.sendFile(path.join(__dirname, 'views', 'movie.html'));
});

/* =======================
   CONTACT FORM (POST)
======================= */

app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  // Server-side validation
  if (!name || !email || !message) {
    return res.status(400).send('All fields are required');
  }

  const data = {
    name,
    email,
    message,
    date: new Date().toISOString()
  };

  fs.writeFile(
    'messages.json',
    JSON.stringify(data, null, 2),
    (err) => {
      if (err) {
        return res.status(500).send('Error saving message');
      }
      res.send(`<h2>Thank you, ${name}! Your message was saved.</h2>`);
    }
  );
});

/* =======================
   API ROUTE (JSON)
======================= */

app.get('/api/info', (req, res) => {
  res.json({
    project: 'CineShelf',
    description: 'Movie library demo project using Express.js',
    team: 'SE-2426',
    year: 2025
  });
});

/* =======================
   404 HANDLER
======================= */

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

/* =======================
   SERVER
======================= */

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
