const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("MONGO_URI is not defined. Add it to .env (local) or hosting env vars (production).");
}

const client = new MongoClient(uri);

let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("cineshelf_db");
    console.log("Connected to MongoDB");
  }
  return db;
}

module.exports = connectDB;
