import { MongoClient } from "mongodb";

let db;

export async function connectDb() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db();
  console.log(`Connected to MongoDB: ${db.databaseName}`);

  await createIndexes();
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error("Database not connected. Call connectDb() first.");
  }
  return db;
}

async function createIndexes() {
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("users").createIndex({ username: 1 }, { unique: true });
  await db.collection("scores").createIndex({ score: -1 });
  await db.collection("scores").createIndex({ userId: 1 });
}
