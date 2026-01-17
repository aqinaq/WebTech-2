const { MongoClient } = require("mongodb");

const uri = "mongodb://127.0.0.1:27017";
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
