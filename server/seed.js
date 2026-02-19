import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";

dotenv.config();

const FAKE_USERS = [
  "Alice", "Bob", "Charlie", "Diana", "Eve",
  "Frank", "Grace", "Hank", "Ivy", "Jack",
  "Karen", "Leo", "Mona", "Nick", "Olivia",
  "Paul", "Quinn", "Rita", "Sam", "Tina",
];

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();

  // Clear existing fake data
  await db.collection("scores").deleteMany({ _fake: true });
  await db.collection("users").deleteMany({ _fake: true });

  console.log("Cleared previous fake data.");

  const passwordHash = await bcrypt.hash("password123", 10);

  // Insert fake users
  const userDocs = FAKE_USERS.map((name) => ({
    _id: new ObjectId(),
    username: name,
    email: `${name.toLowerCase()}@fake.com`,
    password: passwordHash,
    createdAt: new Date(),
    _fake: true,
  }));

  await db.collection("users").insertMany(userDocs);
  console.log(`Inserted ${userDocs.length} fake users.`);

  // Insert fake scores (3-5 scores per user, ~80 total)
  const scoreDocs = [];
  for (const user of userDocs) {
    const numScores = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numScores; i++) {
      scoreDocs.push({
        userId: user._id.toString(),
        username: user.username,
        score: Math.floor(Math.random() * 500) + 1,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        _fake: true,
      });
    }
  }

  await db.collection("scores").insertMany(scoreDocs);
  console.log(`Inserted ${scoreDocs.length} fake scores.`);

  await client.close();
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
