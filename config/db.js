const { MongoClient } = require("mongodb");

let db;

async function connectDB(uri) {
  if (db) return db;
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  console.log("Connected to MongoDB");
  return db;
}

module.exports = { connectDB };
