require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;

const movies = [
  { title: "Inception", genre: "Sci-Fi", year: 2010, director: "Christopher Nolan", rating: 8.8, durationMin: 148, country: "USA", description: "A thief enters dreams to steal ideas." },
  { title: "Parasite", genre: "Thriller", year: 2019, director: "Bong Joon-ho", rating: 8.5, durationMin: 132, country: "South Korea", description: "A poor family infiltrates a wealthy home." },
  { title: "Interstellar", genre: "Sci-Fi", year: 2014, director: "Christopher Nolan", rating: 8.7, durationMin: 169, country: "USA", description: "Explorers travel through a wormhole in space." },
  { title: "The Matrix", genre: "Sci-Fi", year: 1999, director: "The Wachowskis", rating: 8.7, durationMin: 136, country: "USA", description: "A hacker discovers reality is a simulation." },
  { title: "The Dark Knight", genre: "Action", year: 2008, director: "Christopher Nolan", rating: 9.0, durationMin: 152, country: "USA", description: "Batman faces the Joker in Gotham." },
  { title: "Spirited Away", genre: "Animation", year: 2001, director: "Hayao Miyazaki", rating: 8.6, durationMin: 125, country: "Japan", description: "A girl enters a mysterious spirit world." },
  { title: "Gladiator", genre: "Action", year: 2000, director: "Ridley Scott", rating: 8.5, durationMin: 155, country: "USA", description: "A Roman general seeks revenge as a gladiator." },
  { title: "Titanic", genre: "Romance", year: 1997, director: "James Cameron", rating: 7.9, durationMin: 195, country: "USA", description: "A love story aboard the doomed ship." },
  { title: "The Godfather", genre: "Crime", year: 1972, director: "Francis Ford Coppola", rating: 9.2, durationMin: 175, country: "USA", description: "The aging patriarch transfers power." },
  { title: "Whiplash", genre: "Drama", year: 2014, director: "Damien Chazelle", rating: 8.5, durationMin: 106, country: "USA", description: "A drummer pushed to perfection." },
  { title: "Joker", genre: "Drama", year: 2019, director: "Todd Phillips", rating: 8.4, durationMin: 122, country: "USA", description: "A comedian descends into madness." },
  { title: "Coco", genre: "Animation", year: 2017, director: "Lee Unkrich", rating: 8.4, durationMin: 105, country: "USA", description: "A boy explores the Land of the Dead." },
  { title: "Dune", genre: "Sci-Fi", year: 2021, director: "Denis Villeneuve", rating: 8.0, durationMin: 155, country: "USA", description: "A noble family faces galactic conflict." },
  { title: "Arrival", genre: "Sci-Fi", year: 2016, director: "Denis Villeneuve", rating: 7.9, durationMin: 116, country: "USA", description: "A linguist communicates with aliens." },
  { title: "La La Land", genre: "Musical", year: 2016, director: "Damien Chazelle", rating: 8.0, durationMin: 128, country: "USA", description: "Two artists chase dreams in LA." },
  { title: "The Shining", genre: "Horror", year: 1980, director: "Stanley Kubrick", rating: 8.4, durationMin: 146, country: "USA", description: "A family faces terror in a hotel." },
  { title: "Mad Max: Fury Road", genre: "Action", year: 2015, director: "George Miller", rating: 8.1, durationMin: 120, country: "Australia", description: "A high-speed desert chase." },
  { title: "Your Name", genre: "Romance", year: 2016, director: "Makoto Shinkai", rating: 8.4, durationMin: 106, country: "Japan", description: "Two teenagers swap bodies." },
  { title: "The Pianist", genre: "Drama", year: 2002, director: "Roman Polanski", rating: 8.5, durationMin: 150, country: "Poland", description: "A pianist survives WWII." },
  { title: "The Grand Budapest Hotel", genre: "Comedy", year: 2014, director: "Wes Anderson", rating: 8.1, durationMin: 100, country: "USA", description: "Adventures of a hotel concierge." }
];

async function run() {
  if (!uri) throw new Error("MONGO_URI is missing in .env");

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db();
  const col = db.collection("movies");

  await col.deleteMany({});

  const docs = movies.map(m => ({ ...m, createdAt: new Date() }));
  const result = await col.insertMany(docs);

  console.log("Seed inserted:", result.insertedCount);
  await client.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
