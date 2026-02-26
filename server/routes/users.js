import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/connection.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// GET /api/users/:id - get user public profile
router.get("/:id", async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const db = getDb();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.params.id) }, { projection: { passwordHash: 0, email: 0 } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/me - update own profile (protected)
router.put("/me", authenticate, async (req, res, next) => {
  try {
    const { username, avatarUrl } = req.body;
    const update = {};

    if (username !== undefined) {
      if (!username || username.trim().length === 0) {
        return res.status(400).json({ error: "Username cannot be empty" });
      }
      // Check if username is taken by someone else
      const db = getDb();
      const existing = await db.collection("users").findOne({
        username: username.trim(),
        _id: { $ne: new ObjectId(req.user.userId) },
      });
      if (existing) {
        return res.status(409).json({ error: "Username already taken" });
      }
      update.username = username.trim();
    }

    if (avatarUrl !== undefined) {
      update.avatarUrl = avatarUrl;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const db = getDb();
    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(req.user.userId) }, { $set: update });

    const updated = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.user.userId) }, { projection: { passwordHash: 0 } });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id/scores - get a user's scores
router.get("/:id/scores", async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const db = getDb();
    const scores = await db
      .collection("scores")
      .find({ userId: req.params.id })
      .sort({ score: -1 })
      .limit(10)
      .toArray();

    res.json(scores);
  } catch (err) {
    next(err);
  }
});

export default router;

/*
Missing DELETE operations
This collection support Create, Read, and Update but neither exposes a Delete endpoint. The rubric requires full CRUD on at least 2 collections.
can add DELETE /api/users/me (delete account) with corresponding frontend controls.
*/
