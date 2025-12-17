
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;


app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// app.use(express.static(path.join(__dirname, 'public')));

app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'views/about.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'views/contact.html')));
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

// POST route for contact form
app.post('/contact', (req, res) => {
  console.log(req.body);

  // Save data to a JSON file
  const messagesFile = path.join(__dirname, 'messages.json');
  const newMessage = {
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
    date: new Date().toISOString()
  };

  // Read existing messages
  let messages = [];
  if (fs.existsSync(messagesFile)) {
    const data = fs.readFileSync(messagesFile);
    messages = JSON.parse(data);
  }
  messages.push(newMessage);
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));

  res.send(`<h2>Thanks, ${req.body.name}! Your message has been received.</h2><a href="/">Go back Home</a>`);
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public/404.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
