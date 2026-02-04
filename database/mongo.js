const { MongoClient } = require("mongodb");

let client;
let db;

async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  client = new MongoClient(process.env.MONGO_URI);
  await client.connect();

  // имя базы уже в URI: ...mongodb.net/cineshelf_db...
  db = client.db(); // возьмёт DB из URI
  console.log("Connected to MongoDB");

  return db;
}

module.exports = connectDB;
