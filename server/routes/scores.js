import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/connection.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// POST /api/scores - submit a score (protected)
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { score } = req.body;

    if (typeof score !== "number" || score < 0 || !Number.isInteger(score)) {
      return res.status(400).json({ error: "Score must be a non-negative integer" });
    }

    const db = getDb();
    const doc = {
      userId: req.user.userId,
      username: req.user.username,
      score,
      createdAt: new Date(),
    };

    const result = await db.collection("scores").insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    next(err);
  }
});

// GET /api/scores/leaderboard - get top scores with pagination (public)
router.get("/leaderboard", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;
    const db = getDb();
    const col = db.collection("scores");

    const [scores, total] = await Promise.all([
      col.find().sort({ score: -1, createdAt: 1 }).skip(skip).limit(limit).toArray(),
      col.countDocuments(),
    ]);

    res.json({ scores, total, page, limit });
  } catch (err) {
    next(err);
  }
});

// GET /api/scores/rank/:id - get rank and page of a specific score (public)
router.get("/rank/:id", async (req, res, next) => {
  try {
    const db = getDb();
    const col = db.collection("scores");

    let objectId;
    try {
      objectId = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ error: "Invalid score ID" });
    }

    const target = await col.findOne({ _id: objectId });
    if (!target) {
      return res.status(404).json({ error: "Score not found" });
    }

    // Count scores ranked higher (higher score, or same score but earlier submission)
    const rank = await col.countDocuments({
      $or: [
        { score: { $gt: target.score } },
        { score: target.score, createdAt: { $lt: target.createdAt } },
      ],
    });

    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const page = Math.floor(rank / limit) + 1;

    res.json({ rank, page });
  } catch (err) {
    next(err);
  }
});

// GET /api/scores/me - get current user's scores (protected)
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const db = getDb();
    const scores = await db
      .collection("scores")
      .find({ userId: req.user.userId })
      .sort({ score: -1 })
      .toArray();

    res.json(scores);
  } catch (err) {
    next(err);
  }
});

export default router;
