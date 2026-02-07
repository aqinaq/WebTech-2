const { MongoClient } = require("mongodb");

let client;
let db;

async function connectDB(uri) {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(); // db from URI (cineshelf_db)
  return db;
}

function getDB() {
  if (!db) throw new Error("DB not initialized");
  return db;
}

module.exports = { connectDB, getDB };
