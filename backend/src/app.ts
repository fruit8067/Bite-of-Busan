import cors from "cors";
import express from "express";
import { menuRouter } from "./routes/menu";
import uploadRouter from "./routes/upload";

export const app = express();
app.use(cors());
// Vercel's Node.js Functions hard-cap request bodies at 4.5MB (not configurable, any plan) —
// confirmed in production via a 413 FUNCTION_PAYLOAD_TOO_LARGE on a real menu photo. This limit
// is set below that so Express rejects oversized payloads with our own JSON error instead of
// Vercel's raw 413 (only matters off-Vercel/local; on Vercel the platform rejects first either
// way). The real fix is compressing the photo client-side before it's base64-encoded here.
app.use(express.json({ limit: "4mb" }));

app.use("/menu", menuRouter);
app.use("/api/upload", uploadRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ error: "image too large, please retake at a lower resolution" });
  }
  console.error("[app] unhandled error:", err);
  return res.status(500).json({ error: "internal server error" });
});
