import "dotenv/config";
import cors from "cors";
import express from "express";
import { redis } from "./config/redis";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  let redisStatus = "unknown";
  try {
    await redis.ping();
    redisStatus = "ok";
  } catch {
    redisStatus = "down";
  }
  res.json({ status: "ok", redis: redisStatus });
});

const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => console.log(`[backend] listening on :${PORT}`));
