import { Router } from "express";
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

// GET /api/scores/leaderboard - get top scores (public)
router.get("/leaderboard", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const db = getDb();
    const scores = await db
      .collection("scores")
      .find()
      .sort({ score: -1 })
      .limit(limit)
      .toArray();

    res.json(scores);
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
