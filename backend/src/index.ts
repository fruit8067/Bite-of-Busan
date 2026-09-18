import dotenv from "dotenv";
// override: true — this machine has a stale system-level OPENAI_API_KEY env var that would
// otherwise shadow the correct one in .env (dotenv doesn't override existing process.env by default)
dotenv.config({ override: true });
import cors from "cors";
import express from "express";
import { menuRouter } from "./routes/menu";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/menu", menuRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => console.log(`[backend] listening on :${PORT}`));
