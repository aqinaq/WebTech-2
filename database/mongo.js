const { MongoClient } = require("mongodb");

let client;
let db;

async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  client = new MongoClient(process.env.MONGO_URI);
  await client.connect();

  db = client.db();
  console.log("Connected to MongoDB");

  return db;
}

module.exports = connectDB;
