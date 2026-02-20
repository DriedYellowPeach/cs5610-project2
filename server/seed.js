import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";

dotenv.config();

const FIRST_NAMES = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Eve",
  "Frank",
  "Grace",
  "Hank",
  "Ivy",
  "Jack",
  "Karen",
  "Leo",
  "Mona",
  "Nick",
  "Olivia",
  "Paul",
  "Quinn",
  "Rita",
  "Sam",
  "Tina",
  "Uma",
  "Vince",
  "Wendy",
  "Xander",
  "Yara",
  "Zane",
  "Amy",
  "Blake",
  "Cora",
  "Derek",
  "Ella",
  "Finn",
  "Gina",
  "Hugo",
  "Iris",
  "Joel",
  "Kate",
  "Liam",
  "Maya",
  "Noah",
  "Opal",
  "Pete",
  "Rosa",
  "Sean",
  "Tara",
  "Umar",
  "Vera",
  "Wade",
  "Xena",
  "Yuri",
];

function generateUsername(index) {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const suffix = Math.floor(index / FIRST_NAMES.length);
  return suffix === 0 ? first : `${first}${suffix}`;
}

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();

  // Clear existing fake data
  await db.collection("scores").deleteMany({ _fake: true });
  await db.collection("users").deleteMany({ _fake: true });
  console.log("Cleared previous fake data.");

  const passwordHash = await bcrypt.hash("password123", 10);
  const userCount = 1000;

  // Insert fake users in batches
  const userDocs = [];
  for (let i = 0; i < userCount; i++) {
    const username = generateUsername(i);
    userDocs.push({
      _id: new ObjectId(),
      username,
      email: `${username.toLowerCase()}@fake.com`,
      password: passwordHash,
      avatarUrl: `/assets/avatars/avatar${(i % 7) + 1}.svg`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
      _fake: true,
    });
  }

  await db.collection("users").insertMany(userDocs);
  console.log(`Inserted ${userDocs.length} fake users.`);

  // Insert fake scores (1-3 scores per user, all below 5)
  const scoreDocs = [];
  for (const user of userDocs) {
    const numScores = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numScores; i++) {
      scoreDocs.push({
        userId: user._id.toString(),
        username: user.username,
        score: Math.floor(Math.random() * 5),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000)),
        _fake: true,
      });
    }
  }

  await db.collection("scores").insertMany(scoreDocs);
  console.log(`Inserted ${scoreDocs.length} fake scores (all below 5).`);

  await client.close();
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
