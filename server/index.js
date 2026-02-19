import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { connectDb } from "./db/connection.js";
import authRoutes from "./routes/auth.js";
import scoreRoutes from "./routes/scores.js";
import userRoutes from "./routes/users.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve frontend config dynamically from BASE_PATH env var
app.get("/js/config.js", (req, res) => {
  res.type("application/javascript");
  res.send(`export const BASE = ${JSON.stringify(process.env.BASE_PATH || "")};`);
});

app.use(express.static(path.join(__dirname, "..", "public")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

async function start() {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
