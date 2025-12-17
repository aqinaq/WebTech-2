
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;


app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));


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

app.get('/message', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'message.html'));
});

app.post('/contact', (req, res) => {
  console.log(req.body);

  const messagesFile = path.join(__dirname, 'messages.json');
  const newMessage = {
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
    date: new Date().toISOString()
  };

  let messages = [];
  if (fs.existsSync(messagesFile)) {
    messages = JSON.parse(fs.readFileSync(messagesFile));
  }

  messages.push(newMessage);
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));

  res.redirect('/message');
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public/404.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
