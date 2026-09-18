import { Router } from "express";
import { scanMenuImage } from "../services/menuScan";

function stripDataUrlPrefix(imageBase64: string): string {
  const commaIndex = imageBase64.indexOf(",");
  return imageBase64.startsWith("data:") && commaIndex !== -1
    ? imageBase64.slice(commaIndex + 1)
    : imageBase64;
}

export const menuRouter = Router();

menuRouter.post("/scan", async (req, res) => {
  const { imageBase64 } = req.body ?? {};

  if (typeof imageBase64 !== "string" || imageBase64.length === 0) {
    return res.status(400).json({ error: "imageBase64 is required" });
  }

  try {
    const result = await scanMenuImage(stripDataUrlPrefix(imageBase64));
    return res.json({
      restaurantName: result.restaurantName,
      items: result.items.map((item, index) => ({ id: index, ...item })),
    });
  } catch (err) {
    console.error("[menu/scan] failed:", err);
    return res.status(502).json({ error: "menu scan failed" });
  }
});
